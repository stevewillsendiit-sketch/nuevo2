export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EstadoAnuncio } from '@/types';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const categoria = url.searchParams.get('categoria') || null;
    const ubicacionParam = url.searchParams.get('ubicacion') || '';
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const cursor = url.searchParams.get('cursor'); // millis timestamp of fechaPublicacion

    console.log('Search API - categoria:', categoria, 'q:', q, 'ubicacion:', ubicacionParam);

    const anunciosRef = collection(db, 'anuncios');

    // Traer todos los documentos ordenados por fecha (sin filtro de categoría en la query)
    // El filtro de categoría se hace en el servidor para evitar necesitar índices compuestos
    const firestoreQuery = query(anunciosRef, orderBy('fechaPublicacion', 'desc'));

    // Fetch más documentos para poder filtrar
    const fetchLimit = Math.max(200, pageSize * 10);
    const snap = await getDocs(query(firestoreQuery, limit(fetchLimit)));
    let docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
    
    // Debug: mostrar estados de los anuncios
    docs.forEach((d: any) => {
      console.log('📦 Anuncio:', d.id, 'Estado:', d.estado, 'Título:', d.titulo?.substring(0, 30));
    });
    
    // Filtrar por categoría en el servidor
    if (categoria) {
      docs = docs.filter((a: any) => a.categoria === categoria);
      console.log('Search API - docs después de filtrar por categoría:', docs.length);
    }
    
    console.log('Search API - docs encontrados:', docs.length);

    // Server-side filter by q (simple contains)
    const qLower = q.trim().toLowerCase();
    const ubicacionLower = ubicacionParam.trim().toLowerCase();
    
    let filtered = docs.filter((a: any) => a.estado ? a.estado === EstadoAnuncio.ACTIVO : true);
    
    // Filtrar por texto de búsqueda
    if (qLower) {
      filtered = filtered.filter((a: any) => {
        const titulo = String(a.titulo || '').toLowerCase();
        const descripcion = String(a.descripcion || '').toLowerCase();
        return titulo.includes(qLower) || descripcion.includes(qLower);
      });
    }
    
    // Filtrar por ubicación (ciudad o provincia/judet)
    if (ubicacionLower) {
      filtered = filtered.filter((a: any) => {
        const ubicacionAnuncio = String(a.ubicacion || '').toLowerCase();
        const provinciaAnuncio = String(a.provincia || '').toLowerCase();
        // Extraer ciudad de la búsqueda (puede venir como "Ciudad, Judet")
        const ciudadBusqueda = ubicacionLower.split(',')[0].trim();
        const judetBusqueda = ubicacionLower.split(',')[1]?.trim() || '';
        
        // Buscar coincidencia en ciudad o provincia
        const coincideCiudad = ubicacionAnuncio.includes(ciudadBusqueda) || ciudadBusqueda.includes(ubicacionAnuncio);
        const coincideProvincia = provinciaAnuncio.includes(ciudadBusqueda) || 
                                  provinciaAnuncio.includes(judetBusqueda) ||
                                  (judetBusqueda && provinciaAnuncio.includes(judetBusqueda));
        
        return coincideCiudad || coincideProvincia;
      });
    }

    // Total de resultados filtrados (para mostrar en UI)
    const totalFiltered = filtered.length;

    // Aplicar cursor para paginación - filtrar los que ya se han mostrado
    let paginatedResults = filtered;
    if (cursor) {
      const cursorTimestamp = Number(cursor);
      // Encontrar el índice del último elemento ya mostrado y continuar desde ahí
      const cursorIndex = filtered.findIndex((a: any) => {
        const ts = a.fechaPublicacion?.seconds 
          ? a.fechaPublicacion.seconds * 1000 
          : a.fechaPublicacion?.toMillis?.() || 0;
        return ts <= cursorTimestamp;
      });
      
      if (cursorIndex !== -1) {
        // Empezar desde el siguiente elemento después del cursor
        paginatedResults = filtered.slice(cursorIndex + 1);
      }
    }

    const page = paginatedResults.slice(0, pageSize).map((a: any) => ({
      ...a,
      fechaPublicacion: a.fechaPublicacion ? (a.fechaPublicacion.seconds ? a.fechaPublicacion.seconds * 1000 : a.fechaPublicacion.toMillis?.() || null) : null,
    }));

    const nextCursor = paginatedResults.length > pageSize && page.length > 0 ? (page[page.length - 1].fechaPublicacion || null) : null;

    return NextResponse.json({ results: page, nextCursor, total: totalFiltered });
  } catch (err) {
    console.error('API /search error', err);
    return NextResponse.json({ results: [], nextCursor: null }, { status: 500 });
  }
}
