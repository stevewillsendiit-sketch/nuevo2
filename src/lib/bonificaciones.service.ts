import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  updateDoc, 
  doc, 
  getDoc,
  orderBy,
  Timestamp,
  writeBatch,
  serverTimestamp,
  setDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from './firebase';

// Interfaz para bonificaciones
export interface Bonificacion {
  id?: string;
  usuarioId: string;
  usuarioNombre?: string;
  usuarioEmail?: string;
  tipo: 'dias' | 'anuncios' | 'promocion_gratis' | 'descuento' | 'regalo';
  cantidad: number;
  motivo: string;
  fechaCreacion?: Date | Timestamp; // Opcional - se crea automáticamente en el servicio
  fechaExpiracion?: Date | Timestamp;
  estado: 'activa' | 'usada' | 'expirada' | 'cancelada';
  creadoPor: string; // ID del admin que la creó
  planTipo?: string; // Para promociones gratis (tipo de promo)
  porcentajeDescuento?: number; // Para descuentos
  codigoPromo?: string; // Código promocional
  notas?: string;
  paraTodos?: boolean; // Si fue creada para todos los usuarios
  leida?: boolean; // Si el usuario ya la vio
  fechaUsada?: Date | Timestamp; // Cuando se usó
}

// Función auxiliar para limpiar campos undefined de un objeto
function limpiarUndefined<T extends Record<string, unknown>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
}

// Crear una bonificación para un usuario específico
export async function crearBonificacion(bonificacion: Omit<Bonificacion, 'id' | 'fechaCreacion'>): Promise<string> {
  try {
    // Preparar datos para Firebase (convertir Date a Timestamp)
    const fechaExpiracion = bonificacion.fechaExpiracion 
      ? (bonificacion.fechaExpiracion instanceof Date 
          ? Timestamp.fromDate(bonificacion.fechaExpiracion)
          : bonificacion.fechaExpiracion)
      : null;

    // Limpiar campos undefined antes de enviar a Firebase
    const datosLimpios = limpiarUndefined({
      ...bonificacion,
      fechaCreacion: Timestamp.now(),
      fechaExpiracion,
      leida: false,
    });

    const docRef = await addDoc(collection(db, 'bonificaciones'), datosLimpios);
    console.log('✅ Bonificación creada:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error al crear bonificación:', error);
    throw error;
  }
}

// Crear bonificación masiva para todos los usuarios
export async function crearBonificacionMasiva(
  bonificacionBase: Omit<Bonificacion, 'id' | 'usuarioId' | 'fechaCreacion'>,
  usuarios: { id: string; nombre?: string; email?: string }[]
): Promise<{ exitosos: number; fallidos: number }> {
  const batch = writeBatch(db);
  let exitosos = 0;
  let fallidos = 0;
  
  // Preparar fecha de expiración
  const fechaExpiracion = bonificacionBase.fechaExpiracion 
    ? (bonificacionBase.fechaExpiracion instanceof Date 
        ? Timestamp.fromDate(bonificacionBase.fechaExpiracion)
        : bonificacionBase.fechaExpiracion)
    : null;
  
  try {
    for (const usuario of usuarios) {
      try {
        const docRef = doc(collection(db, 'bonificaciones'));
        // Limpiar campos undefined antes de enviar a Firebase
        const datosLimpios = limpiarUndefined({
          ...bonificacionBase,
          usuarioId: usuario.id,
          usuarioNombre: usuario.nombre || '',
          usuarioEmail: usuario.email || '',
          fechaCreacion: Timestamp.now(),
          fechaExpiracion,
          leida: false,
          paraTodos: true,
        });
        batch.set(docRef, datosLimpios);
        exitosos++;
      } catch (e) {
        fallidos++;
        console.error('Error añadiendo usuario al batch:', usuario.id, e);
      }
    }
    
    await batch.commit();
    console.log(`✅ Bonificación masiva creada: ${exitosos} exitosos, ${fallidos} fallidos`);
    return { exitosos, fallidos };
  } catch (error) {
    console.error('❌ Error en bonificación masiva:', error);
    throw error;
  }
}

// Obtener todas las bonificaciones (para admin)
export async function getAllBonificaciones(): Promise<Bonificacion[]> {
  try {
    const q = query(
      collection(db, 'bonificaciones'),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const bonificaciones: Bonificacion[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      bonificaciones.push({
        id: docSnap.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || new Date(data.fechaCreacion),
        fechaExpiracion: data.fechaExpiracion?.toDate?.() || (data.fechaExpiracion ? new Date(data.fechaExpiracion) : undefined),
        fechaUsada: data.fechaUsada?.toDate?.() || (data.fechaUsada ? new Date(data.fechaUsada) : undefined),
      } as Bonificacion);
    });
    
    return bonificaciones;
  } catch (error) {
    console.error('Error al obtener bonificaciones:', error);
    return [];
  }
}

// Obtener bonificaciones de un usuario específico
export async function getBonificacionesUsuario(usuarioId: string): Promise<Bonificacion[]> {
  try {
    console.log('🔍 Buscando bonificaciones para usuario:', usuarioId);
    const q = query(
      collection(db, 'bonificaciones'),
      where('usuarioId', '==', usuarioId),
      orderBy('fechaCreacion', 'desc')
    );
    const querySnapshot = await getDocs(q);
    console.log('📦 Documentos encontrados:', querySnapshot.size);
    
    const bonificaciones: Bonificacion[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      bonificaciones.push({
        id: docSnap.id,
        ...data,
        fechaCreacion: data.fechaCreacion?.toDate?.() || new Date(data.fechaCreacion),
        fechaExpiracion: data.fechaExpiracion?.toDate?.() || (data.fechaExpiracion ? new Date(data.fechaExpiracion) : undefined),
        fechaUsada: data.fechaUsada?.toDate?.() || (data.fechaUsada ? new Date(data.fechaUsada) : undefined),
      } as Bonificacion);
    });
    
    // Verificar y actualizar estados expirados
    const ahora = new Date();
    for (const bonif of bonificaciones) {
      if (bonif.estado === 'activa' && bonif.fechaExpiracion) {
        const fechaExp = bonif.fechaExpiracion instanceof Date 
          ? bonif.fechaExpiracion 
          : (bonif.fechaExpiracion as Timestamp).toDate();
        if (fechaExp < ahora) {
          await actualizarEstadoBonificacion(bonif.id!, 'expirada');
          bonif.estado = 'expirada';
        }
      }
    }
    
    return bonificaciones;
  } catch (error: unknown) {
    console.error('❌ Error al obtener bonificaciones del usuario:', error);
    // Si es error de índice, dar instrucciones
    if (error instanceof Error && error.message.includes('index')) {
      console.error('⚠️ FALTA CREAR ÍNDICE EN FIREBASE:');
      console.error('   Colección: bonificaciones');
      console.error('   Campo 1: usuarioId (Ascending)');
      console.error('   Campo 2: fechaCreacion (Descending)');
      console.error('   Haz clic en el enlace de arriba para crearlo automáticamente.');
    }
    return [];
  }
}

// Obtener bonificaciones no leídas de un usuario
export async function getBonificacionesNoLeidas(usuarioId: string): Promise<number> {
  try {
    const q = query(
      collection(db, 'bonificaciones'),
      where('usuarioId', '==', usuarioId),
      where('leida', '==', false)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('Error al contar bonificaciones no leídas:', error);
    return 0;
  }
}

// Marcar bonificación como leída
export async function marcarBonificacionLeida(bonificacionId: string): Promise<void> {
  try {
    const docRef = doc(db, 'bonificaciones', bonificacionId);
    await updateDoc(docRef, { leida: true });
    console.log('✅ Bonificación marcada como leída:', bonificacionId);
  } catch (error) {
    console.error('Error al marcar bonificación como leída:', error);
    throw error;
  }
}

// Actualizar estado de bonificación
export async function actualizarEstadoBonificacion(
  bonificacionId: string, 
  nuevoEstado: 'activa' | 'usada' | 'expirada' | 'cancelada'
): Promise<void> {
  try {
    const docRef = doc(db, 'bonificaciones', bonificacionId);
    const updateData: Record<string, unknown> = { estado: nuevoEstado };
    
    if (nuevoEstado === 'usada') {
      updateData.fechaUsada = serverTimestamp();
    }
    
    await updateDoc(docRef, updateData);
    console.log('✅ Estado de bonificación actualizado:', bonificacionId, nuevoEstado);
  } catch (error) {
    console.error('Error al actualizar estado de bonificación:', error);
    throw error;
  }
}

// Usar una bonificación (aplicar sus beneficios)
export async function usarBonificacion(bonificacionId: string, usuarioId: string): Promise<{
  success: boolean;
  mensaje: string;
  tipo?: string;
  cantidad?: number;
}> {
  try {
    // Obtener la bonificación
    const docRef = doc(db, 'bonificaciones', bonificacionId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return { success: false, mensaje: 'Bonificación no encontrada' };
    }
    
    const bonificacion = docSnap.data() as Bonificacion;
    
    // Verificar que pertenece al usuario
    if (bonificacion.usuarioId !== usuarioId) {
      return { success: false, mensaje: 'Esta bonificación no te pertenece' };
    }
    
    // Verificar estado
    if (bonificacion.estado !== 'activa') {
      return { success: false, mensaje: `Esta bonificación ya está ${bonificacion.estado}` };
    }
    
    // Verificar expiración
    if (bonificacion.fechaExpiracion) {
      const fechaExp = bonificacion.fechaExpiracion instanceof Timestamp 
        ? bonificacion.fechaExpiracion.toDate() 
        : new Date(bonificacion.fechaExpiracion);
      if (fechaExp < new Date()) {
        await actualizarEstadoBonificacion(bonificacionId, 'expirada');
        return { success: false, mensaje: 'Esta bonificación ha expirado' };
      }
    }
    
    // Aplicar según el tipo
    let mensaje = '';
    
    switch (bonificacion.tipo) {
      case 'dias':
        // Añadir días al plan activo del usuario
        mensaje = `¡Se han añadido ${bonificacion.cantidad} días extra a tu plan!`;
        break;
        
      case 'anuncios':
        // Añadir anuncios al plan activo del usuario
        mensaje = `¡Se han añadido ${bonificacion.cantidad} anuncios extra a tu plan!`;
        break;
        
      case 'promocion_gratis':
        mensaje = `¡Has recibido una promoción ${bonificacion.planTipo || 'Destacado'} gratis para usar en cualquier anuncio!`;
        break;
        
      case 'descuento':
        mensaje = `Tu descuento del ${bonificacion.porcentajeDescuento}% está listo para usar.`;
        break;
        
      case 'regalo':
        mensaje = '¡Has canjeado tu regalo especial!';
        break;
        
      default:
        mensaje = '¡Bonificación aplicada con éxito!';
    }
    
    // Marcar como usada
    await actualizarEstadoBonificacion(bonificacionId, 'usada');
    
    return { 
      success: true, 
      mensaje,
      tipo: bonificacion.tipo,
      cantidad: bonificacion.cantidad
    };
  } catch (error) {
    console.error('Error al usar bonificación:', error);
    return { success: false, mensaje: 'Error al procesar la bonificación' };
  }
}

// Obtener estadísticas de bonificaciones (para admin)
export async function getEstadisticasBonificaciones(): Promise<{
  total: number;
  activas: number;
  usadas: number;
  expiradas: number;
  porTipo: Record<string, number>;
}> {
  try {
    const bonificaciones = await getAllBonificaciones();
    
    const stats = {
      total: bonificaciones.length,
      activas: 0,
      usadas: 0,
      expiradas: 0,
      porTipo: {} as Record<string, number>
    };
    
    bonificaciones.forEach(b => {
      // Contar por estado
      if (b.estado === 'activa') stats.activas++;
      else if (b.estado === 'usada') stats.usadas++;
      else if (b.estado === 'expirada') stats.expiradas++;
      
      // Contar por tipo
      stats.porTipo[b.tipo] = (stats.porTipo[b.tipo] || 0) + 1;
    });
    
    return stats;
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return { total: 0, activas: 0, usadas: 0, expiradas: 0, porTipo: {} };
  }
}

// Cancelar bonificación
export async function cancelarBonificacion(bonificacionId: string): Promise<void> {
  await actualizarEstadoBonificacion(bonificacionId, 'cancelada');
}

// ==================== SISTEMA DE CRÉDITOS DIARIOS ====================

// Interfaz para el saldo de créditos del usuario
export interface CreditoUsuario {
  usuarioId: string;
  saldo: number;
  ultimoReclamo: Date | Timestamp | null;
  totalReclamado: number;
  historialReclamos: {
    fecha: Date | Timestamp;
    cantidad: number;
  }[];
}

// Obtener el saldo de créditos de un usuario
export async function getCreditosUsuario(usuarioId: string): Promise<CreditoUsuario | null> {
  try {
    const docRef = doc(db, 'creditos_usuarios', usuarioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      usuarioId: data.usuarioId,
      saldo: data.saldo || 0,
      ultimoReclamo: data.ultimoReclamo?.toDate?.() || data.ultimoReclamo || null,
      totalReclamado: data.totalReclamado || 0,
      historialReclamos: (data.historialReclamos || []).map((h: { fecha: Timestamp | Date; cantidad: number }) => ({
        fecha: h.fecha instanceof Timestamp ? h.fecha.toDate() : h.fecha,
        cantidad: h.cantidad
      }))
    };
  } catch (error) {
    console.error('Error al obtener créditos:', error);
    return null;
  }
}

// Verificar si el usuario puede reclamar créditos hoy
export async function puedeReclamarCreditos(usuarioId: string): Promise<{
  puede: boolean;
  proximoReclamo?: Date;
  horasRestantes?: number;
}> {
  try {
    const creditos = await getCreditosUsuario(usuarioId);
    
    if (!creditos || !creditos.ultimoReclamo) {
      return { puede: true };
    }
    
    const ultimoReclamo = creditos.ultimoReclamo instanceof Date 
      ? creditos.ultimoReclamo 
      : new Date(creditos.ultimoReclamo as unknown as string);
    
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
    const ultimoDia = new Date(ultimoReclamo.getFullYear(), ultimoReclamo.getMonth(), ultimoReclamo.getDate());
    
    // Si el último reclamo fue en un día diferente, puede reclamar
    if (hoy.getTime() > ultimoDia.getTime()) {
      return { puede: true };
    }
    
    // Calcular cuándo podrá reclamar (mañana a las 00:00)
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);
    
    const horasRestantes = Math.ceil((manana.getTime() - ahora.getTime()) / (1000 * 60 * 60));
    
    return {
      puede: false,
      proximoReclamo: manana,
      horasRestantes
    };
  } catch (error) {
    console.error('Error al verificar reclamo:', error);
    return { puede: false };
  }
}

// Reclamar créditos diarios
export async function reclamarCreditosDiarios(usuarioId: string, cantidadCreditos: number = 5): Promise<{
  success: boolean;
  mensaje: string;
  nuevoSaldo?: number;
  creditosReclamados?: number;
}> {
  try {
    // Verificar si puede reclamar
    const verificacion = await puedeReclamarCreditos(usuarioId);
    
    if (!verificacion.puede) {
      return {
        success: false,
        mensaje: `Ya reclamaste tus créditos hoy. Vuelve en ${verificacion.horasRestantes} horas.`
      };
    }
    
    const docRef = doc(db, 'creditos_usuarios', usuarioId);
    const docSnap = await getDoc(docRef);
    
    const ahora = new Date();
    
    if (!docSnap.exists()) {
      // Crear nuevo registro de créditos
      await setDoc(docRef, {
        usuarioId,
        saldo: cantidadCreditos,
        ultimoReclamo: Timestamp.now(),
        totalReclamado: cantidadCreditos,
        historialReclamos: [{
          fecha: Timestamp.now(),
          cantidad: cantidadCreditos
        }]
      });
      
      return {
        success: true,
        mensaje: `¡Felicidades! Has reclamado ${cantidadCreditos} créditos.`,
        nuevoSaldo: cantidadCreditos,
        creditosReclamados: cantidadCreditos
      };
    } else {
      // Actualizar registro existente
      const data = docSnap.data();
      const nuevoSaldo = (data.saldo || 0) + cantidadCreditos;
      
      await updateDoc(docRef, {
        saldo: nuevoSaldo,
        ultimoReclamo: Timestamp.now(),
        totalReclamado: (data.totalReclamado || 0) + cantidadCreditos,
        historialReclamos: arrayUnion({
          fecha: Timestamp.now(),
          cantidad: cantidadCreditos
        })
      });
      
      return {
        success: true,
        mensaje: `¡Felicidades! Has reclamado ${cantidadCreditos} créditos.`,
        nuevoSaldo,
        creditosReclamados: cantidadCreditos
      };
    }
  } catch (error: unknown) {
    console.error('Error al reclamar créditos:', error);
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    return {
      success: false,
      mensaje: `Error al reclamar créditos: ${errorMessage}`
    };
  }
}

// Usar créditos para promocionar
export async function usarCreditosParaPromocion(usuarioId: string, cantidadCreditos: number): Promise<{
  success: boolean;
  mensaje: string;
  saldoRestante?: number;
}> {
  try {
    const docRef = doc(db, 'creditos_usuarios', usuarioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        success: false,
        mensaje: 'No tienes créditos disponibles.'
      };
    }
    
    const data = docSnap.data();
    const saldoActual = data.saldo || 0;
    
    if (saldoActual < cantidadCreditos) {
      return {
        success: false,
        mensaje: `Créditos insuficientes. Tienes ${saldoActual} créditos y necesitas ${cantidadCreditos}.`
      };
    }
    
    const nuevoSaldo = saldoActual - cantidadCreditos;
    
    await updateDoc(docRef, {
      saldo: nuevoSaldo
    });
    
    return {
      success: true,
      mensaje: `Has usado ${cantidadCreditos} créditos para promocionar.`,
      saldoRestante: nuevoSaldo
    };
  } catch (error) {
    console.error('Error al usar créditos:', error);
    return {
      success: false,
      mensaje: 'Error al usar créditos. Inténtalo de nuevo.'
    };
  }
}

// Añadir créditos manualmente (para admin)
export async function addCreditosManual(usuarioId: string, cantidad: number, motivo: string): Promise<{
  success: boolean;
  nuevoSaldo?: number;
}> {
  try {
    const docRef = doc(db, 'creditos_usuarios', usuarioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, {
        usuarioId,
        saldo: cantidad,
        ultimoReclamo: null,
        totalReclamado: 0,
        historialReclamos: []
      });
      return { success: true, nuevoSaldo: cantidad };
    } else {
      const data = docSnap.data();
      const nuevoSaldo = (data.saldo || 0) + cantidad;
      await updateDoc(docRef, { saldo: nuevoSaldo });
      return { success: true, nuevoSaldo };
    }
  } catch (error) {
    console.error('Error al añadir créditos:', error);
    return { success: false };
  }
}

// Configuración de créditos
export interface ConfiguracionCreditos {
  creditosPorDia: number;          // Puntos que recibe el usuario diariamente
  valorPuntosEnEuros: number;      // Valor de cada punto en euros (ej: 0.10 = 10 céntimos)
  puntosMinimosParaCanjear: number; // Mínimo de puntos para canjear
  maxAnunciosPorCanje: number;     // Máximo de anuncios por canje (1-10)
  precioAnuncioEnEuros: number;    // Precio de 1 anuncio en euros (ej: 2€)
  juegoActivo: boolean;            // Si el sistema de puntos está activo
}

// Obtener configuración de créditos diarios
export async function getConfiguracionCreditos(): Promise<ConfiguracionCreditos> {
  try {
    const docRef = doc(db, 'configuracion', 'creditos');
    const docSnap = await getDoc(docRef);
    
    // Valores por defecto:
    // 1 punto = 0.10€
    // 1 anuncio = 2€ = 20 puntos
    // 5 puntos diarios = 0.50€/día = 1 anuncio cada 4 días
    const defaultConfig: ConfiguracionCreditos = {
      creditosPorDia: 5,
      valorPuntosEnEuros: 0.10,
      puntosMinimosParaCanjear: 20, // Mínimo para 1 anuncio
      maxAnunciosPorCanje: 10,
      precioAnuncioEnEuros: 2.00,
      juegoActivo: true
    };
    
    if (!docSnap.exists()) {
      return defaultConfig;
    }
    
    const data = docSnap.data();
    return {
      creditosPorDia: data.creditosPorDia || defaultConfig.creditosPorDia,
      valorPuntosEnEuros: data.valorPuntosEnEuros || defaultConfig.valorPuntosEnEuros,
      puntosMinimosParaCanjear: data.puntosMinimosParaCanjear || defaultConfig.puntosMinimosParaCanjear,
      maxAnunciosPorCanje: data.maxAnunciosPorCanje || defaultConfig.maxAnunciosPorCanje,
      precioAnuncioEnEuros: data.precioAnuncioEnEuros || defaultConfig.precioAnuncioEnEuros,
      juegoActivo: data.juegoActivo !== false // Por defecto activo si no existe
    };
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    return {
      creditosPorDia: 5,
      valorPuntosEnEuros: 0.10,
      puntosMinimosParaCanjear: 20,
      maxAnunciosPorCanje: 10,
      precioAnuncioEnEuros: 2.00,
      juegoActivo: true
    };
  }
}

// Activar/Desactivar el sistema de puntos
export async function toggleJuegoActivo(activo: boolean): Promise<boolean> {
  try {
    const docRef = doc(db, 'configuracion', 'creditos');
    await setDoc(docRef, { juegoActivo: activo }, { merge: true });
    console.log(`✅ Sistema de puntos ${activo ? 'activado' : 'desactivado'}`);
    return true;
  } catch (error) {
    console.error('Error al cambiar estado del juego:', error);
    return false;
  }
}

// Calcular puntos necesarios para X anuncios
export function calcularPuntosPorAnuncios(cantidadAnuncios: number, config: ConfiguracionCreditos): number {
  const precioTotal = cantidadAnuncios * config.precioAnuncioEnEuros;
  return Math.ceil(precioTotal / config.valorPuntosEnEuros);
}

// Calcular cuántos anuncios puede comprar con sus puntos
export function calcularAnunciosConPuntos(puntos: number, config: ConfiguracionCreditos): number {
  const valorEnEuros = puntos * config.valorPuntosEnEuros;
  return Math.floor(valorEnEuros / config.precioAnuncioEnEuros);
}

// Usar puntos para comprar anuncios extras
export async function comprarAnunciosConPuntos(
  usuarioId: string, 
  cantidadAnuncios: number,
  config: ConfiguracionCreditos
): Promise<{
  success: boolean;
  mensaje: string;
  saldoRestante?: number;
  anunciosComprados?: number;
}> {
  try {
    // Validaciones
    if (cantidadAnuncios < 1 || cantidadAnuncios > config.maxAnunciosPorCanje) {
      return {
        success: false,
        mensaje: `Puedes comprar entre 1 y ${config.maxAnunciosPorCanje} anuncios.`
      };
    }
    
    const puntosNecesarios = calcularPuntosPorAnuncios(cantidadAnuncios, config);
    
    const docRef = doc(db, 'creditos_usuarios', usuarioId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        success: false,
        mensaje: 'No tienes puntos disponibles.'
      };
    }
    
    const data = docSnap.data();
    const saldoActual = data.saldo || 0;
    
    if (saldoActual < puntosNecesarios) {
      const puntosQueFaltan = puntosNecesarios - saldoActual;
      const diasParaConseguirlos = Math.ceil(puntosQueFaltan / config.creditosPorDia);
      return {
        success: false,
        mensaje: `Puntos insuficientes. Necesitas ${puntosNecesarios} puntos y tienes ${saldoActual}. Te faltan ${puntosQueFaltan} puntos (≈${diasParaConseguirlos} días).`
      };
    }
    
    const nuevoSaldo = saldoActual - puntosNecesarios;
    
    await updateDoc(docRef, {
      saldo: nuevoSaldo
    });
    
    const valorEnEuros = (puntosNecesarios * config.valorPuntosEnEuros).toFixed(2);
    
    return {
      success: true,
      mensaje: `¡Has canjeado ${puntosNecesarios} puntos (${valorEnEuros}€) por ${cantidadAnuncios} anuncio(s) extra!`,
      saldoRestante: nuevoSaldo,
      anunciosComprados: cantidadAnuncios
    };
  } catch (error) {
    console.error('Error al comprar anuncios con puntos:', error);
    return {
      success: false,
      mensaje: 'Error al procesar el canje. Inténtalo de nuevo.'
    };
  }
}
