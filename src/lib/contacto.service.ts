'use client';

import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from './firebase';

export interface MensajeContacto {
  id: string;
  numeroTicket: string; // Número único de solicitud (SUP-YYYYMMDD-XXXX)
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  fecha: Date;
  leido: boolean;
  respondido: boolean;
  estado: 'pendiente' | 'en_proceso' | 'resuelto';
  respuesta?: string;
  fechaRespuesta?: Date;
  adminId?: string;
  notas?: string;
  userId?: string; // ID del usuario logueado que envió el mensaje
}

// Generar número de ticket único
function generarNumeroTicket(): string {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  const random = Math.floor(1000 + Math.random() * 9000); // 4 dígitos aleatorios
  return `SUP-${año}${mes}${dia}-${random}`;
}

// Enviar mensaje de contacto
export async function enviarMensajeContacto(data: {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
  userId?: string; // ID del usuario logueado (opcional)
}): Promise<{ id: string; numeroTicket: string }> {
  try {
    const numeroTicket = generarNumeroTicket();
    console.log('📤 Enviando mensaje de contacto:', data.email, 'userId:', data.userId, 'ticket:', numeroTicket);
    const docRef = await addDoc(collection(db, 'mensajes_contacto'), {
      numeroTicket,
      nombre: data.nombre,
      email: data.email.toLowerCase(), // Guardar en minúsculas
      asunto: data.asunto,
      mensaje: data.mensaje,
      fecha: Timestamp.now(),
      leido: false,
      respondido: false,
      estado: 'pendiente',
      ...(data.userId && { userId: data.userId }) // Guardar userId si está logueado
    });
    console.log('✅ Mensaje guardado con ID:', docRef.id, 'Ticket:', numeroTicket);
    return { id: docRef.id, numeroTicket };
  } catch (error) {
    console.error('❌ Error al enviar mensaje de contacto:', error);
    throw error;
  }
}

// Obtener todos los mensajes de contacto (para admin)
export function getMensajesContacto(
  callback: (mensajes: MensajeContacto[]) => void
) {
  const q = query(
    collection(db, 'mensajes_contacto'),
    orderBy('fecha', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const mensajes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        numeroTicket: data.numeroTicket || `SUP-${doc.id.slice(0, 8).toUpperCase()}`,
        nombre: data.nombre,
        email: data.email,
        asunto: data.asunto,
        mensaje: data.mensaje,
        fecha: data.fecha?.toDate() || new Date(),
        leido: data.leido || false,
        respondido: data.respondido || false,
        estado: data.estado || 'pendiente',
        respuesta: data.respuesta,
        fechaRespuesta: data.fechaRespuesta?.toDate(),
        adminId: data.adminId,
        notas: data.notas
      } as MensajeContacto;
    });
    callback(mensajes);
  });
}

// Marcar mensaje como leído
export async function marcarMensajeLeido(mensajeId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'mensajes_contacto', mensajeId), {
      leido: true
    });
  } catch (error) {
    console.error('Error al marcar mensaje como leído:', error);
    throw error;
  }
}

// Actualizar estado del mensaje
export async function actualizarEstadoMensaje(
  mensajeId: string, 
  estado: 'pendiente' | 'en_proceso' | 'resuelto'
): Promise<void> {
  try {
    await updateDoc(doc(db, 'mensajes_contacto', mensajeId), {
      estado
    });
  } catch (error) {
    console.error('Error al actualizar estado del mensaje:', error);
    throw error;
  }
}

// Responder mensaje
export async function responderMensaje(
  mensajeId: string,
  respuesta: string,
  adminId: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'mensajes_contacto', mensajeId), {
      respondido: true,
      respuesta,
      fechaRespuesta: Timestamp.now(),
      adminId,
      estado: 'resuelto'
    });
  } catch (error) {
    console.error('Error al responder mensaje:', error);
    throw error;
  }
}

// Agregar nota al mensaje
export async function agregarNotaMensaje(
  mensajeId: string,
  notas: string
): Promise<void> {
  try {
    await updateDoc(doc(db, 'mensajes_contacto', mensajeId), {
      notas
    });
  } catch (error) {
    console.error('Error al agregar nota:', error);
    throw error;
  }
}

// Eliminar mensaje
export async function eliminarMensajeContacto(mensajeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'mensajes_contacto', mensajeId));
  } catch (error) {
    console.error('Error al eliminar mensaje:', error);
    throw error;
  }
}

// Obtener estadísticas de mensajes
export async function getEstadisticasMensajes(): Promise<{
  total: number;
  pendientes: number;
  enProceso: number;
  resueltos: number;
  noLeidos: number;
}> {
  try {
    const snapshot = await getDocs(collection(db, 'mensajes_contacto'));
    
    let total = 0;
    let pendientes = 0;
    let enProceso = 0;
    let resueltos = 0;
    let noLeidos = 0;
    
    snapshot.forEach(doc => {
      const data = doc.data();
      total++;
      if (data.estado === 'pendiente') pendientes++;
      if (data.estado === 'en_proceso') enProceso++;
      if (data.estado === 'resuelto') resueltos++;
      if (!data.leido) noLeidos++;
    });
    
    return { total, pendientes, enProceso, resueltos, noLeidos };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { total: 0, pendientes: 0, enProceso: 0, resueltos: 0, noLeidos: 0 };
  }
}

// Obtener mensajes de un usuario por email O por userId (para el perfil del usuario)
export function getMensajesUsuario(
  userEmail: string,
  callback: (mensajes: MensajeContacto[]) => void,
  userId?: string
) {
  console.log('📧 Buscando mensajes para email:', userEmail, 'userId:', userId);
  
  // Si tenemos userId, buscar por userId (más confiable)
  // Si no, buscar por email
  const q = userId 
    ? query(collection(db, 'mensajes_contacto'), where('userId', '==', userId))
    : query(collection(db, 'mensajes_contacto'), where('email', '==', userEmail.toLowerCase()));

  return onSnapshot(q, (snapshot) => {
    console.log('📨 Mensajes encontrados:', snapshot.size);
    const mensajes = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        numeroTicket: data.numeroTicket || `SUP-${doc.id.slice(0, 8).toUpperCase()}`,
        nombre: data.nombre,
        email: data.email,
        asunto: data.asunto,
        mensaje: data.mensaje,
        fecha: data.fecha?.toDate() || new Date(),
        leido: data.leido || false,
        respondido: data.respondido || false,
        estado: data.estado || 'pendiente',
        respuesta: data.respuesta,
        fechaRespuesta: data.fechaRespuesta?.toDate(),
        adminId: data.adminId,
        notas: data.notas,
        userId: data.userId
      } as MensajeContacto;
    });
    // Ordenar en memoria por fecha descendente
    mensajes.sort((a, b) => b.fecha.getTime() - a.fecha.getTime());
    callback(mensajes);
  }, (error) => {
    console.error('❌ Error al obtener mensajes del usuario:', error);
    callback([]);
  });
}
