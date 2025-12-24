import { NextResponse } from 'next/server';
import { collection, query, orderBy, where, limit, getDocs, startAfter } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { EstadoAnuncio } from '@/types';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const categoria = url.searchParams.get('categoria') || null;
    const pageSize = Number(url.searchParams.get('pageSize') || '20');
    const cursor = url.searchParams.get('cursor'); // millis timestamp of fechaPublicacion

    const anunciosRef = collection(db, 'anuncios');

    let firestoreQuery: any = query(anunciosRef, orderBy('fechaPublicacion', 'desc'));
    try {
      firestoreQuery = categoria
        ? query(anunciosRef, where('categoria', '==', categoria), orderBy('fechaPublicacion', 'desc'))
        : query(anunciosRef, orderBy('fechaPublicacion', 'desc'));
    } catch (e) {
      firestoreQuery = query(anunciosRef, orderBy('fechaPublicacion', 'desc'));
    }

    const fetchLimit = Math.max(20, pageSize * 3);
    const snap = await getDocs(query(firestoreQuery, limit(fetchLimit)));
    const docs = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));

    const qLower = q.trim().toLowerCase();
    let filtered = docs.filter((a: any) => a.estado ? a.estado === EstadoAnuncio.ACTIVO : true);
    if (qLower) {
      filtered = filtered.filter((a: any) => {
        const titulo = String(a.titulo || '').toLowerCase();
        const descripcion = String(a.descripcion || '').toLowerCase();
        const ubicacion = String(a.ubicacion || '').toLowerCase();
        return titulo.includes(qLower) || descripcion.includes(qLower) || ubicacion.includes(qLower);
      });
    }

    const page = filtered.slice(0, pageSize).map((a: any) => ({
      ...a,
      fechaPublicacion: a.fechaPublicacion ? (a.fechaPublicacion.seconds ? a.fechaPublicacion.seconds * 1000 : a.fechaPublicacion.toMillis?.() || null) : null,
    }));

    const nextCursor = filtered.length > pageSize && page.length > 0 ? (page[page.length - 1].fechaPublicacion || null) : null;

    return NextResponse.json({ results: page, nextCursor });
  } catch (err) {
    console.error('API /search error', err);
    return NextResponse.json({ results: [], nextCursor: null }, { status: 500 });
  }
}
