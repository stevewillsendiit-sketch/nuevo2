// Script para agregar créditos a un usuario en Firebase
// Ejecutar en la consola de Firebase o con Node.js

// INSTRUCCIONES:
// 1. Ve a Firebase Console > Firestore
// 2. Busca la colección "creditos_usuarios"
// 3. Busca el documento con el ID del usuario
// 4. Si no existe, créalo con estos campos:
//    - usuarioId: "ID_DEL_USUARIO"
//    - saldo: 1 (o la cantidad que pagó)
//    - ultimoReclamo: null
//    - totalReclamado: 0
//    - historialReclamos: []
// 5. Si existe, simplemente suma 1 al campo "saldo"

// ==========================================
// ALTERNATIVA: Ejecutar esto en la consola del navegador
// cuando estés logueado como admin en vindel.ro
// ==========================================

/*
// Pega esto en la consola del navegador (F12):

const userId = "PEGA_AQUI_EL_UID_DEL_USUARIO"; // El UID del usuario
const cantidad = 1; // Euros a agregar

// Importar Firebase (ya debería estar disponible en la página)
const { doc, getDoc, setDoc, updateDoc } = await import('firebase/firestore');
const { db } = await import('/src/lib/firebase');

const docRef = doc(db, 'creditos_usuarios', userId);
const docSnap = await getDoc(docRef);

if (!docSnap.exists()) {
  await setDoc(docRef, {
    usuarioId: userId,
    saldo: cantidad,
    ultimoReclamo: null,
    totalReclamado: 0,
    historialReclamos: []
  });
  console.log(`✅ Creado documento con ${cantidad}€ para usuario ${userId}`);
} else {
  const data = docSnap.data();
  const nuevoSaldo = (data.saldo || 0) + cantidad;
  await updateDoc(docRef, { saldo: nuevoSaldo });
  console.log(`✅ Actualizado saldo a ${nuevoSaldo}€ para usuario ${userId}`);
}

*/

console.log('Lee las instrucciones en este archivo para agregar créditos manualmente');
