import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// POST /api/auto-aprobar
// Body: { anuncioId: string }
// Este endpoint verifica si un anuncio sigue en revisión y lo aprueba
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { anuncioId } = body;

    if (!anuncioId) {
      return NextResponse.json({ error: 'anuncioId es requerido' }, { status: 400 });
    }

    const anuncioRef = doc(db, 'anuncios', anuncioId);
    const anuncioDoc = await getDoc(anuncioRef);

    if (!anuncioDoc.exists()) {
      return NextResponse.json({ error: 'Anuncio no encontrado' }, { status: 404 });
    }

    const anuncioData = anuncioDoc.data();

    // Solo aprobar si sigue en revisión
    if (anuncioData.estado === 'En revisión') {
      await updateDoc(anuncioRef, {
        estado: 'Activo',
        fechaAprobacionAuto: new Date().toISOString()
      });

      console.log(`✅ Anuncio auto-aprobado via API: ${anuncioId}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Anuncio aprobado automáticamente',
        anuncioId 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: `Anuncio ya fue procesado (estado: ${anuncioData.estado})`,
        anuncioId 
      });
    }
  } catch (error) {
    console.error('Error en auto-aprobación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
