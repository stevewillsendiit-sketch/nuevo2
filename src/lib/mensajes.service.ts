import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  writeBatch,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import { Mensaje, Conversacion } from '@/types';

export function getConversacionesByUsuario(
  usuarioId: string,
  callback: (conversaciones: Conversacion[]) => void
) {
  console.log('📥 Escuchando conversaciones para usuario:', usuarioId);
  
  const q = query(
    collection(db, 'conversaciones'),
    where('participantes', 'array-contains', usuarioId),
    orderBy('fechaUltimoMensaje', 'desc')
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    console.log('📊 Conversaciones recibidas:', snapshot.size);
    const conversaciones = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('💬 Conversación:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        fechaUltimoMensaje: data.fechaUltimoMensaje?.toDate() || new Date(),
      } as Conversacion;
    });
    callback(conversaciones);
  });
}

export function getMensajesByConversacion(
  conversacionId: string,
  callback: (mensajes: Mensaje[]) => void
) {
  console.log('📨 Cargando mensajes para conversación:', conversacionId);
  
  // Query simplificada sin orderBy para no requerir índice compuesto
  const q = query(
    collection(db, 'mensajes'),
    where('conversacionId', '==', conversacionId)
  );

  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    console.log('📨 Mensajes recibidos:', snapshot.size);
    
    const mensajes = snapshot.docs.map(doc => {
      const data = doc.data();
      console.log('💬 Mensaje:', doc.id, data);
      return {
        id: doc.id,
        ...data,
        fecha: data.fecha?.toDate() || new Date(),
      } as Mensaje;
    });
    
    // Ordenar en memoria por fecha
    mensajes.sort((a, b) => a.fecha.getTime() - b.fecha.getTime());
    
    callback(mensajes);
  });
}

export async function enviarMensaje(
  conversacionId: string,
  remitenteId: string,
  contenido: string
): Promise<void> {
  console.log('📤 Enviando mensaje:', { conversacionId, remitenteId });
  
  // Obtener conversación para saber quién es el destinatario
  const conversacionDoc = await getDoc(doc(db, 'conversaciones', conversacionId));
  if (!conversacionDoc.exists()) {
    console.error('❌ Conversación no encontrada');
    return;
  }
  
  const conversacionData = conversacionDoc.data();
  const participantes = conversacionData.participantes as string[];
  const destinatarioId = participantes.find((p: string) => p !== remitenteId);
  
  if (!destinatarioId) {
    console.error('❌ Destinatario no encontrado');
    return;
  }
  
  // Crear mensaje
  await addDoc(collection(db, 'mensajes'), {
    conversacionId,
    remitenteId,
    contenido,
    fecha: Timestamp.now(),
    leido: false,
  });

  console.log('✅ Mensaje guardado en Firestore');

  // Actualizar conversación con contador de no leídos
  // Solo actualizar último mensaje; el incremento de no-leídos lo gestiona la Cloud Function
  await updateDoc(doc(db, 'conversaciones', conversacionId), {
    ultimoMensaje: contenido,
    fechaUltimoMensaje: Timestamp.now(),
  });

  console.log('✅ Conversación actualizada (ultimoMensaje)');
}

export async function crearConversacion(
  participantes: string[],
  anuncioId: string,
  primerMensaje: string,
  remitenteId: string
): Promise<string> {
  // Validar que el mensaje no esté vacío
  if (!primerMensaje || !primerMensaje.trim()) {
    throw new Error('El mensaje no puede estar vacío');
  }
  
  const mensajeLimpio = primerMensaje.trim();
  
  console.log('🔵 Crear conversación:', { participantes, anuncioId, remitenteId });
  
  // Verificar si ya existe una conversación para este anuncio con estos participantes
  const q = query(
    collection(db, 'conversaciones'),
    where('anuncioId', '==', anuncioId)
  );

  const snapshot = await getDocs(q);
  console.log('🔍 Conversaciones encontradas:', snapshot.size);
  
  // Buscar conversación existente que tenga ambos participantes
  const conversacionExistente = snapshot.docs.find(doc => {
    const convParticipantes = doc.data().participantes as string[];
    return participantes.every(p => convParticipantes.includes(p));
  });

  if (conversacionExistente) {
    console.log('✅ Conversación existente encontrada:', conversacionExistente.id);
    const conversacionData = conversacionExistente.data();
    const destinatarioId = participantes.find((p: string) => p !== remitenteId);
    
    // Si existe, enviar nuevo mensaje
    await addDoc(collection(db, 'mensajes'), {
      conversacionId: conversacionExistente.id,
      remitenteId,
      contenido: mensajeLimpio,
      fecha: Timestamp.now(),
      leido: false,
    });

    // Actualizar conversación con noLeidos
    await updateDoc(doc(db, 'conversaciones', conversacionExistente.id), {
      ultimoMensaje: mensajeLimpio,
      fechaUltimoMensaje: Timestamp.now(),
      [`noLeidos_${destinatarioId}`]: (conversacionData[`noLeidos_${destinatarioId}`] || 0) + 1,
    });

    return conversacionExistente.id;
  }

  console.log('🆕 Creando nueva conversación');
  
  // Obtener anuncio para saber quién es el vendedor
  const anuncioDoc = await getDoc(doc(db, 'anuncios', anuncioId));
  const vendedorId = anuncioDoc.exists() ? anuncioDoc.data().vendedorId : participantes[1];
  const compradorId = participantes.find(p => p !== vendedorId) || participantes[0];
  
  
  // Crear nueva conversación con campos compatibles con iOS
  const conversacionRef = await addDoc(collection(db, 'conversaciones'), {
    participantes,
    anuncioId,
    compradorId,
    vendedorId,
    ultimoMensaje: mensajeLimpio,
    fechaUltimoMensaje: Timestamp.now(),
    // Inicializar contadores en 0; la Cloud Function incrementará cuando el mensaje sea creado
    [`noLeidos_${compradorId}`]: 0,
    [`noLeidos_${vendedorId}`]: 0,
  });

  console.log('✅ Conversación creada:', conversacionRef.id);

  // Enviar primer mensaje
  await addDoc(collection(db, 'mensajes'), {
    conversacionId: conversacionRef.id,
    remitenteId,
    contenido: mensajeLimpio,
    fecha: Timestamp.now(),
    leido: false,
  });

  console.log('✅ Primer mensaje enviado');

  return conversacionRef.id;
}

export async function marcarMensajesComoLeidos(
  conversacionId: string,
  usuarioId: string
): Promise<void> {
  // Query simplificada sin índice compuesto
  const q = query(
    collection(db, 'mensajes'),
    where('conversacionId', '==', conversacionId)
  );

  const snapshot = await getDocs(q);
  
  // Filtrar en memoria los mensajes que no son del usuario y no están leídos
  const promises = snapshot.docs
    .filter(docSnap => {
      const data = docSnap.data();
      return data.remitenteId !== usuarioId && !data.leido;
    })
    .map(docSnap => 
      updateDoc(doc(db, 'mensajes', docSnap.id), { 
        leido: true,
        fechaLectura: Timestamp.now()
      })
    );

  await Promise.all(promises);
  
  // Resetear contador de no leídos
  // Obtener valor previo para descontarlo del contador global
  const convDocRef = doc(db, 'conversaciones', conversacionId);
  const convSnap = await getDoc(convDocRef);
  const prev = convSnap.exists() ? (convSnap.data()[`noLeidos_${usuarioId}`] || 0) : 0;

  const batch = writeBatch(db);
  batch.update(convDocRef, { [`noLeidos_${usuarioId}`]: 0 });

  // Actualizar counters/{usuarioId} decrementando totalNoLeidos
  const counterRef = doc(db, 'counters', usuarioId);
  // Si no existe, ensure it's created with 0 then no-op
  batch.set(counterRef, { totalNoLeidos: increment(-prev) }, { merge: true });

  await batch.commit();
}

export async function borrarConversacion(conversacionId: string): Promise<void> {
  console.log('🗑️ Borrando conversación:', conversacionId);
  
  try {
    // Borrar todos los mensajes de la conversación
    const mensajesQuery = query(
      collection(db, 'mensajes'),
      where('conversacionId', '==', conversacionId)
    );
    
    const mensajesSnapshot = await getDocs(mensajesQuery);
    const batch = writeBatch(db);
    
    mensajesSnapshot.docs.forEach((documento) => {
      batch.delete(documento.ref);
    });
    
    // Borrar la conversación
    batch.delete(doc(db, 'conversaciones', conversacionId));
    
    await batch.commit();
    console.log('✅ Conversación borrada exitosamente');
  } catch (error) {
    console.error('❌ Error borrando conversación:', error);
    throw error;
  }
}
