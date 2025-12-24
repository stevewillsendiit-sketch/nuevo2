import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();
const db = admin.firestore();

// ============================================
// AUTO-APROBAR ANUNCIO - Trigger al crear
// Se ejecuta cuando se crea un anuncio y programa la auto-aprobación
// ============================================
export const onAnuncioCreate = functions.firestore
  .document('anuncios/{anuncioId}')
  .onCreate(async (snap, context) => {
    const anuncioId = context.params.anuncioId;
    const data = snap.data();
    
    // Solo procesar si está en revisión
    if (data.estado !== 'En revisión') {
      return null;
    }
    
    console.log(`📝 Nuevo anuncio en revisión: ${anuncioId}`);
    
    // Esperar 30 segundos y luego auto-aprobar
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      // Verificar si sigue en revisión (no fue aprobado/rechazado manualmente)
      const anuncioDoc = await db.doc(`anuncios/${anuncioId}`).get();
      
      if (!anuncioDoc.exists) {
        console.log(`⚠️ Anuncio ${anuncioId} ya no existe`);
        return null;
      }
      
      const currentData = anuncioDoc.data();
      if (currentData?.estado === 'En revisión') {
        await db.doc(`anuncios/${anuncioId}`).update({
          estado: 'Activo',
          fechaAprobacionAuto: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log(`✅ Anuncio auto-aprobado: ${anuncioId}`);
      } else {
        console.log(`ℹ️ Anuncio ${anuncioId} ya fue procesado manualmente (estado: ${currentData?.estado})`);
      }
    } catch (error) {
      console.error(`❌ Error auto-aprobando anuncio ${anuncioId}:`, error);
    }
    
    return null;
  });

// Trigger when a message is created in 'mensajes' collection
export const onMessageCreate = functions.firestore
  .document('mensajes/{mensajeId}')
  .onCreate(async (snap) => {
    const data = snap.data();
    if (!data) return;

    const conversacionId = data.conversacionId;
    const remitenteId = data.remitenteId;
    const contenido = data.contenido;

    try {
      const convRef = db.doc(`conversaciones/${conversacionId}`);
      const convSnap = await convRef.get();
      if (!convSnap.exists) return;

      const convData = convSnap.data() as { participantes?: string[] } | undefined;
      const participantes: string[] = convData?.participantes || [];
      const destinatarios = participantes.filter(p => p !== remitenteId);

      const batch = db.batch();

      // Update ultimoMensaje and fechaUltimoMensaje on conversation
      batch.update(convRef, {
        ultimoMensaje: contenido,
        fechaUltimoMensaje: admin.firestore.FieldValue.serverTimestamp(),
      });

      for (const dest of destinatarios) {
        // Increment per-conversation unread counter
        const field = `noLeidos_${dest}`;
        batch.update(convRef, { [field]: admin.firestore.FieldValue.increment(1) });

        // Increment user's global counter
        const counterRef = db.doc(`counters/${dest}`);
        batch.set(counterRef, { totalNoLeidos: admin.firestore.FieldValue.increment(1) }, { merge: true });
      }

      await batch.commit();
      console.log('Cloud Function: updated conversation counters and user counters');
    } catch (err) {
      console.error('Cloud Function error:', err);
    }
  });
