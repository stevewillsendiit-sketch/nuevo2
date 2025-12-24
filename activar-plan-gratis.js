// Script para activar plan Básico GRATIS
const planBasico = {
  id: Date.now(),
  userId: "test-user", // Cambia esto por tu userId real si es necesario
  tipo: "Básico",
  anunciosDisponibles: 3,
  anunciosUsados: 0,
  totalAnuncios: 3,
  precio: 0,
  totalInvertido: 0,
  diasDuracion: 7,
  fechaCompra: new Date().toISOString(),
  fechaExpiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
};

// Obtener planes existentes
let planesActivos = [];
try {
  const planesGuardados = localStorage.getItem('planesActivos');
  if (planesGuardados) {
    planesActivos = JSON.parse(planesGuardados);
  }
} catch (e) {
  console.log('No hay planes previos');
}

// Agregar plan básico
planesActivos.push(planBasico);

// Guardar
localStorage.setItem('planesActivos', JSON.stringify(planesActivos));

console.log('✅ Plan Básico GRATIS activado!');
console.log('📦 3 anuncios disponibles');
console.log('⏰ Válido por 7 días');
console.log('');
console.log('Recarga la página para ver los cambios');
