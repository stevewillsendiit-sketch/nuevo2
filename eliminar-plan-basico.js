// Script para eliminar plan Básico de Firebase
// Abre la consola del navegador (F12) y pega este código

(async function eliminarPlanBasico() {
  try {
    // Obtener el usuario actual
    const auth = window.firebase?.auth();
    if (!auth) {
      console.error('❌ Firebase Auth no encontrado');
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      console.error('❌ No hay usuario autenticado');
      return;
    }

    console.log('👤 Usuario:', user.email);

    // Obtener Firestore
    const db = window.firebase?.firestore();
    if (!db) {
      console.error('❌ Firestore no encontrado');
      return;
    }

    // Buscar planes del usuario
    const planesRef = db.collection('planes');
    const snapshot = await planesRef.where('userId', '==', user.uid).get();

    console.log(`📦 Total planes encontrados: ${snapshot.size}`);

    let planesBasicosEliminados = 0;

    // Eliminar todos los planes Básicos
    const batch = db.batch();
    
    snapshot.forEach((doc) => {
      const planData = doc.data();
      console.log(`📋 Plan encontrado:`, {
        id: doc.id,
        tipo: planData.tipo,
        anuncios: planData.anunciosDisponibles
      });

      if (planData.tipo === 'Básico') {
        console.log(`🗑️ Eliminando plan Básico: ${doc.id}`);
        batch.delete(doc.ref);
        planesBasicosEliminados++;
      }
    });

    if (planesBasicosEliminados > 0) {
      await batch.commit();
      console.log(`✅ ${planesBasicosEliminados} plan(es) Básico(s) eliminado(s) correctamente`);
      console.log('🔄 Recarga la página para ver los cambios');
      
      // Recargar la página automáticamente después de 2 segundos
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } else {
      console.log('ℹ️ No se encontraron planes Básicos para eliminar');
    }

  } catch (error) {
    console.error('❌ Error al eliminar plan:', error);
  }
})();
