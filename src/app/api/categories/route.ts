import { NextResponse } from 'next/server';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Categoria, EstadoAnuncio } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const anunciosRef = collection(db, 'anuncios');
    const snap = await getDocs(anunciosRef);
    
    // Contar anuncios por categoría
    const conteo: Record<string, number> = {};
    let total = 0;
    
    // Inicializar todas las categorías en 0
    Object.values(Categoria).forEach(cat => {
      conteo[cat] = 0;
    });
    
    snap.docs.forEach(doc => {
      const data = doc.data();
      // Solo contar anuncios activos
      if (!data.estado || data.estado === EstadoAnuncio.ACTIVO) {
        const cat = data.categoria;
        if (cat && conteo.hasOwnProperty(cat)) {
          conteo[cat]++;
          total++;
        }
      }
    });
    
    // Convertir a array ordenado por cantidad
    const categorias = Object.entries(conteo)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
    
    return NextResponse.json({ categorias, total });
  } catch (err) {
    console.error('API /categories error', err);
    return NextResponse.json({ categorias: [], total: 0 }, { status: 500 });
  }
}
