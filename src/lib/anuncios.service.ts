import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';
import { Anuncio, Categoria, EstadoAnuncio } from '@/types';
import { optimizeImages } from './imageOptimizer';

export async function getAnuncios(categoria?: Categoria | null, usuarioActualId?: string | null): Promise<Anuncio[]> {
  const anunciosRef = collection(db, 'anuncios');
  
  try {
    // Primero intentar sin filtros para ver todos los anuncios
    let q = query(
      anunciosRef,
      orderBy('fechaPublicacion', 'desc'),
      limit(50)
    );

    if (categoria) {
      q = query(
        anunciosRef,
        where('categoria', '==', categoria),
        orderBy('fechaPublicacion', 'desc'),
        limit(50)
      );
    }

    try {
      const snapshot = await getDocs(q);
      console.log('📊 Total anuncios en Firestore:', snapshot.size);
      
      const anuncios = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📦 Anuncio:', doc.id, 'Estado:', data.estado);
        return {
          id: doc.id,
          ...data,
          fechaPublicacion: data.fechaPublicacion?.toDate() || new Date(),
        } as Anuncio;
      });
      
      // Filtrar: mostrar activos + los en revisión del usuario actual
      const anunciosFiltrados = anuncios.filter(a => {
        // Siempre mostrar activos
        if (a.estado === EstadoAnuncio.ACTIVO) return true;
        // Mostrar en revisión solo si es del usuario actual
        if (a.estado === EstadoAnuncio.EN_REVISION && usuarioActualId && a.vendedorId === usuarioActualId) return true;
        return false;
      });
      
      console.log('✅ Anuncios procesados:', anunciosFiltrados.length);
      return anunciosFiltrados;
    } catch (queryErr: any) {
      // Si Firestore reclama un índice compuesto, hacemos un fallback: traer sin filtro y filtrar/ordenar en cliente
      const msg = String(queryErr?.message || '');
      if (msg.includes('requires an index') || msg.includes('requires index')) {
        console.warn('⚠️ Consulta compuesta requiere índice. Usando fallback client-side.');
        try {
          const snapshot2 = await getDocs(query(anunciosRef, orderBy('fechaPublicacion', 'desc'), limit(200)));
          let anuncios = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data(), fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date() } as Anuncio));
          if (categoria) {
            anuncios = anuncios.filter(a => a.categoria === categoria);
          }
          return anuncios;
        } catch (fallbackErr) {
          console.error('❌ Fallback error cargando anuncios:', fallbackErr);
          return [];
        }
      }
      throw queryErr;
    }
  } catch (error) {
    console.error('❌ Error cargando anuncios:', error);
    return [];
  }
}

export async function getAnuncioById(id: string): Promise<Anuncio | null> {
  const docSnap = await getDoc(doc(db, 'anuncios', id));
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data(),
      fechaPublicacion: docSnap.data().fechaPublicacion?.toDate() || new Date(),
    } as Anuncio;
  }
  
  return null;
}

export async function getAnunciosByUsuario(usuarioId: string): Promise<Anuncio[]> {
  // First try: read user's `anunciosPublicados` array (most reliable)
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', usuarioId));
    if (userDoc.exists()) {
      const data = userDoc.data() as any;
      const publicados: string[] = Array.isArray(data.anunciosPublicados) ? data.anunciosPublicados : [];
      if (publicados.length > 0) {
        const promises = publicados.map(async (id) => {
          const s = await getDoc(doc(db, 'anuncios', id));
          if (!s.exists()) return null;
          return {
            id: s.id,
            ...s.data(),
            fechaPublicacion: s.data().fechaPublicacion?.toDate() || new Date(),
          } as Anuncio;
        });
        const results = (await Promise.all(promises)).filter(Boolean) as Anuncio[];
        // sort by fechaPublicacion desc
        results.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime());
        return results;
      }
    }
  } catch (err) {
    console.error('Error leyendo anunciosPublicados del usuario:', err);
  }

  // Fallback: try querying by `usuarioId` or `vendedorId` fields for legacy docs
  const anunciosRef = collection(db, 'anuncios');
  
  try {
    // Simple query sin orderBy para evitar índice compuesto
    let q = query(
      anunciosRef,
      where('usuarioId', '==', usuarioId)
    );
    
    const snapshot = await getDocs(q);
    const anuncios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
    } as Anuncio));
    
    // Ordenar en el cliente
    anuncios.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime());
    
    return anuncios;
  } catch (error) {
    console.error('Error obteniendo anuncios por usuario:', error);
    return [];
  }
}

export async function createAnuncio(
  anuncio: Omit<Anuncio, 'id' | 'vistas' | 'favoritos' | 'fechaPublicacion'>,
  imagenes: File[]
): Promise<string> {
  // Optimizar imágenes a WebP antes de subir
  const imagenesOptimizadas = await optimizeImages(imagenes, {
    maxWidth: 1920,
    maxHeight: 1080,
    quality: 0.85,
    format: 'webp'
  });

  // Subir imágenes optimizadas
  const imagenesUrls: string[] = [];
  for (const imagen of imagenesOptimizadas) {
    const storageRef = ref(storage, `anuncios/${Date.now()}_${imagen.name}`);
    await uploadBytes(storageRef, imagen);
    const url = await getDownloadURL(storageRef);
    imagenesUrls.push(url);
  }

  // Crear anuncio
  const nuevoAnuncio = {
    ...anuncio,
    imagenes: imagenesUrls,
    vistas: 0,
    favoritos: 0,
    fechaPublicacion: Timestamp.now(),
  };

  const docRef = await addDoc(collection(db, 'anuncios'), nuevoAnuncio);
  
  // Actualizar usuario (usar `vendedorId` que está presente en el tipo)
  await updateDoc(doc(db, 'usuarios', anuncio.vendedorId), {
    anunciosPublicados: arrayUnion(docRef.id),
  });

  return docRef.id;
}

export async function updateAnuncio(id: string, data: Partial<Anuncio>): Promise<void> {
  await updateDoc(doc(db, 'anuncios', id), data);
}

export async function deleteAnuncio(id: string, usuarioId: string): Promise<void> {
  await deleteDoc(doc(db, 'anuncios', id));
  
  // Actualizar usuario
  await updateDoc(doc(db, 'usuarios', usuarioId), {
    anunciosPublicados: arrayRemove(id),
  });
}

export async function incrementarVistas(id: string): Promise<void> {
  await updateDoc(doc(db, 'anuncios', id), {
    vistas: increment(1),
  });
}

export async function searchAnuncios(searchTerm: string): Promise<Anuncio[]> {
  const anunciosRef = collection(db, 'anuncios');
  const q = query(
    anunciosRef,
    where('estado', '==', EstadoAnuncio.ACTIVO),
    orderBy('fechaPublicacion', 'desc')
  );

  const snapshot = await getDocs(q);
  const anuncios = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
  } as Anuncio));

  // Filtrar por término de búsqueda
  const searchLower = searchTerm.toLowerCase();
  return anuncios.filter(anuncio =>
    anuncio.titulo.toLowerCase().includes(searchLower) ||
    anuncio.descripcion.toLowerCase().includes(searchLower) ||
    anuncio.ubicacion.toLowerCase().includes(searchLower)
  );
}

export async function getFeaturedAnuncios(limitN = 6): Promise<Anuncio[]> {
  const anunciosRef = collection(db, 'anuncios');
  try {
    // Order by priority first (if present), then by publication date
    const q = query(
      anunciosRef,
      where('destacado', '==', true),
      orderBy('destacadoPrioridad', 'desc'),
      orderBy('fechaPublicacion', 'desc'),
      limit(limitN)
    );

    const snapshot = await getDocs(q);
    const anuncios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
    } as Anuncio));

    return anuncios;
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('requires an index') || msg.includes('requires index')) {
      console.warn('⚠️ Consulta de destacados requiere índice. Usando fallback.');
      try {
        const snapshot2 = await getDocs(query(anunciosRef, orderBy('fechaPublicacion', 'desc'), limit(200)));
        let anuncios = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data(), fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date() } as Anuncio));
        anuncios = anuncios.filter(a => a.destacado === true).slice(0, limitN);
        return anuncios;
      } catch (fallbackErr) {
        console.error('❌ Fallback error cargando destacados:', fallbackErr);
        return [];
      }
    }
    console.error('❌ Error cargando destacados:', err);
    return [];
  }
}

export async function getPromotedAnuncios(limitN = 6): Promise<Anuncio[]> {
  const anunciosRef = collection(db, 'anuncios');
  try {
    // Intentamos consultar por campo 'promovido' (si existe en documentos)
    const q = query(
      anunciosRef,
      where('promovado', '==', true),
      orderBy('fechaPublicacion', 'desc'),
      limit(limitN)
    );

    const snapshot = await getDocs(q);
    const anuncios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
    } as Anuncio));

    return anuncios;
  } catch (err: any) {
    const msg = String(err?.message || '');
    if (msg.includes('requires an index') || msg.includes('requires index')) {
      console.warn('⚠️ Consulta de promovidos requiere índice. Usando fallback.');
      try {
        const snapshot2 = await getDocs(query(anunciosRef, orderBy('fechaPublicacion', 'desc'), limit(200)));
        let anuncios = snapshot2.docs.map(doc => ({ id: doc.id, ...doc.data(), fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date() } as Anuncio));
        anuncios = anuncios.filter((a: any) => a.promovado === true).slice(0, limitN);
        return anuncios;
      } catch (fallbackErr) {
        console.error('❌ Fallback error cargando promovidos:', fallbackErr);
        return [];
      }
    }
    console.error('❌ Error cargando promovidos:', err);
    return [];
  }
}
