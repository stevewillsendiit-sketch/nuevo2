import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  addDoc,
  Timestamp,
  getCountFromServer,
  startAfter,
  DocumentSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';
import { Usuario, Anuncio, EstadoAnuncio, EstadisticasSistema, ReporteAnuncio, LogAdmin, RolUsuario, Factura } from '@/types';

// ==================== TIPOS EXTENDIDOS ====================

export interface EstadisticasCompletas extends EstadisticasSistema {
  // Ingresos
  ingresosHoy: number;
  ingresosSemana: number;
  ingresosMes: number;
  ingresosTotal: number;
  
  // Promociones
  promocionesActivasHoy: number;
  promocionesCompradasHoy: number;
  promocionesCompradasSemana: number;
  promocionesCompradasMes: number;
  promocionesTotales: number;
  
  // Por tipo de promoción
  promocionesVIP: number;
  promocionesPremium: number;
  promocionesDestacado: number;
  
  // Usuarios detallados
  usuariosActivosHoy: number;
  usuariosActivosSemana: number;
  usuariosNuevosSemana: number;
  usuariosNuevosMes: number;
  
  // Anuncios detallados
  anunciosNuevosSemana: number;
  anunciosNuevosMes: number;
  
  // Conversiones
  tasaConversion: number;
  ticketPromedio: number;
}

export interface PromocionComprada {
  id: string;
  anuncioId: string;
  anuncioTitulo: string;
  userId: string;
  userEmail: string;
  tipo: 'VIP' | 'Premium' | 'Destacado';
  precio: number;
  duracion: number;
  fechaCompra: Date;
  fechaExpiracion: Date;
  estado: 'activa' | 'expirada' | 'cancelada';
}

export interface IngresosDiarios {
  fecha: string;
  total: number;
  promociones: number;
  cantidad: number;
}

export interface UsuarioDetallado extends Usuario {
  totalAnuncios: number;
  totalGastado: number;
  ultimaActividad?: Date;
}

export interface AnuncioExtraComprado {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  paquete: string;
  cantidad: number;
  precio: number;
  fechaCompra: Date;
  anunciosUsados: number;
  anunciosRestantes: number;
  estado: 'activo' | 'agotado' | 'expirado';
}

export interface ResumenIngresos {
  periodo: string;
  ingresos: number;
  promociones: number;
  anunciosExtra: number;
  transacciones: number;
}

export interface FacturaDetallada extends Factura {
  userName?: string;
  tipoCompra: 'promocion' | 'anuncios_extra' | 'otro';
  planTipo?: string;
}

// ==================== VERIFICACIÓN DE PERMISOS ====================

export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (!userDoc.exists()) return false;
    const rol = userDoc.data()?.rol as RolUsuario;
    return rol === 'admin' || rol === 'superadmin' || rol === 'moderator';
  } catch (error) {
    console.error('Error verificando admin:', error);
    return false;
  }
}

export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (!userDoc.exists()) return false;
    return userDoc.data()?.rol === 'superadmin';
  } catch (error) {
    return false;
  }
}

export async function getUserRole(userId: string): Promise<RolUsuario> {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (!userDoc.exists()) return 'user';
    return (userDoc.data()?.rol as RolUsuario) || 'user';
  } catch (error) {
    return 'user';
  }
}

// ==================== LOGS DE ACTIVIDAD ====================

export async function logAdminAction(
  adminId: string,
  adminEmail: string,
  accion: string,
  entidad: 'usuario' | 'anuncio' | 'reporte' | 'sistema',
  entidadId?: string,
  detalles?: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'admin_logs'), {
      adminId,
      adminEmail,
      accion,
      entidad,
      entidadId,
      detalles,
      fecha: Timestamp.now(),
    });
  } catch (error) {
    console.error('Error guardando log:', error);
  }
}

export async function getAdminLogs(limitCount: number = 100): Promise<LogAdmin[]> {
  try {
    const q = query(
      collection(db, 'admin_logs'),
      orderBy('fecha', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as LogAdmin[];
  } catch (error) {
    console.error('Error obteniendo logs:', error);
    return [];
  }
}

// ==================== ESTADÍSTICAS ====================

export async function getEstadisticasSistema(): Promise<EstadisticasSistema> {
  try {
    // Contar usuarios
    const usuariosSnapshot = await getCountFromServer(collection(db, 'usuarios'));
    const totalUsuarios = usuariosSnapshot.data().count;

    // Contar anuncios por estado
    const anunciosRef = collection(db, 'anuncios');
    const totalAnunciosSnapshot = await getCountFromServer(anunciosRef);
    const totalAnuncios = totalAnunciosSnapshot.data().count;

    // Anuncios activos
    const activosQuery = query(anunciosRef, where('estado', '==', EstadoAnuncio.ACTIVO));
    const activosSnapshot = await getCountFromServer(activosQuery);
    const anunciosActivos = activosSnapshot.data().count;

    // Anuncios en revisión
    const pendientesQuery = query(anunciosRef, where('estado', '==', EstadoAnuncio.EN_REVISION));
    const pendientesSnapshot = await getCountFromServer(pendientesQuery);
    const anunciosPendientes = pendientesSnapshot.data().count;

    // Anuncios rechazados
    const rechazadosQuery = query(anunciosRef, where('estado', '==', EstadoAnuncio.RECHAZADO));
    const rechazadosSnapshot = await getCountFromServer(rechazadosQuery);
    const anunciosRechazados = rechazadosSnapshot.data().count;

    // Contar mensajes
    const mensajesSnapshot = await getCountFromServer(collection(db, 'mensajes'));
    const totalMensajes = mensajesSnapshot.data().count;

    // Usuarios nuevos hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const usuariosHoyQuery = query(
      collection(db, 'usuarios'),
      where('fechaRegistro', '>=', Timestamp.fromDate(hoy))
    );
    const usuariosHoySnapshot = await getCountFromServer(usuariosHoyQuery);
    const usuariosNuevosHoy = usuariosHoySnapshot.data().count;

    // Anuncios nuevos hoy
    const anunciosHoyQuery = query(
      anunciosRef,
      where('fechaPublicacion', '>=', Timestamp.fromDate(hoy))
    );
    const anunciosHoySnapshot = await getCountFromServer(anunciosHoyQuery);
    const anunciosNuevosHoy = anunciosHoySnapshot.data().count;

    return {
      totalUsuarios,
      totalAnuncios,
      anunciosActivos,
      anunciosPendientes,
      anunciosRechazados,
      totalMensajes,
      usuariosNuevosHoy,
      anunciosNuevosHoy,
      visitasHoy: 0, // Implementar con Analytics
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return {
      totalUsuarios: 0,
      totalAnuncios: 0,
      anunciosActivos: 0,
      anunciosPendientes: 0,
      anunciosRechazados: 0,
      totalMensajes: 0,
      usuariosNuevosHoy: 0,
      anunciosNuevosHoy: 0,
      visitasHoy: 0,
    };
  }
}

// ==================== ESTADÍSTICAS COMPLETAS ====================

export async function getEstadisticasCompletas(): Promise<EstadisticasCompletas> {
  try {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const hace7Dias = new Date(hoy);
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    
    const hace30Dias = new Date(hoy);
    hace30Dias.setDate(hace30Dias.getDate() - 30);

    // Estadísticas básicas
    const basicStats = await getEstadisticasSistema();

    // ===== FACTURAS E INGRESOS =====
    const facturasRef = collection(db, 'facturas');
    const facturasSnapshot = await getDocs(facturasRef);
    
    let ingresosHoy = 0;
    let ingresosSemana = 0;
    let ingresosMes = 0;
    let ingresosTotal = 0;
    
    facturasSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const total = data.total || 0;
      const fecha = data.fecha?.toDate?.() || new Date(data.fecha);
      
      ingresosTotal += total;
      
      if (fecha >= hoy) {
        ingresosHoy += total;
      }
      if (fecha >= hace7Dias) {
        ingresosSemana += total;
      }
      if (fecha >= hace30Dias) {
        ingresosMes += total;
      }
    });

    // ===== PROMOCIONES (NUEVO SISTEMA - desde anuncios con destacado=true) =====
    let promocionesActivasHoy = 0;
    let promocionesCompradasHoy = 0;
    let promocionesCompradasSemana = 0;
    let promocionesCompradasMes = 0;
    let promocionesTotales = 0;
    let promocionesVIP = 0;
    let promocionesPremium = 0;
    let promocionesDestacado = 0;
    
    try {
      // Buscar anuncios con promoción activa (destacado = true)
      const anunciosPromocionadosSnapshot = await getDocs(query(
        collection(db, 'anuncios'),
        where('destacado', '==', true)
      ));
      
      anunciosPromocionadosSnapshot.docs.forEach(doc => {
        const data = doc.data();
        const fechaPromocion = data.fechaPromocion ? new Date(data.fechaPromocion) : null;
        const diasPromocion = data.diasPromocion || 7;
        const tipo = (data.planPromocion || 'Destacado').toLowerCase();
        
        promocionesTotales++;
        
        // Contar por tipo
        if (tipo === 'vip') promocionesVIP++;
        else if (tipo === 'premium') promocionesPremium++;
        else promocionesDestacado++;
        
        // Calcular si está activa (no ha expirado)
        if (fechaPromocion) {
          const fechaExpiracion = new Date(fechaPromocion);
          fechaExpiracion.setDate(fechaExpiracion.getDate() + diasPromocion);
          
          if (fechaExpiracion >= hoy) {
            promocionesActivasHoy++;
          }
          
          // Promociones compradas por período
          if (fechaPromocion >= hoy) {
            promocionesCompradasHoy++;
          }
          if (fechaPromocion >= hace7Dias) {
            promocionesCompradasSemana++;
          }
          if (fechaPromocion >= hace30Dias) {
            promocionesCompradasMes++;
          }
        } else {
          // Si no tiene fecha, considerarla activa
          promocionesActivasHoy++;
        }
      });
    } catch (e) {
      console.log('Error buscando anuncios promocionados:', e);
    }

    // También contar desde facturas con planTipo (historial)
    try {
      const facturasSnapshot = await getDocs(collection(db, 'facturas'));
      facturasSnapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.planTipo) {
          const fechaCompra = data.fecha?.toDate?.() || new Date(data.fecha);
          
          if (fechaCompra >= hoy) promocionesCompradasHoy++;
          if (fechaCompra >= hace7Dias) promocionesCompradasSemana++;
          if (fechaCompra >= hace30Dias) promocionesCompradasMes++;
        }
      });
    } catch (e) {}

    // ===== USUARIOS DETALLADOS =====
    const usuariosRef = collection(db, 'usuarios');
    const usuariosSnapshot = await getDocs(usuariosRef);
    
    let usuariosNuevosSemana = 0;
    let usuariosNuevosMes = 0;
    
    usuariosSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const fechaRegistro = data.fechaRegistro?.toDate?.() || new Date(data.fechaRegistro);
      
      if (fechaRegistro >= hace7Dias) {
        usuariosNuevosSemana++;
      }
      if (fechaRegistro >= hace30Dias) {
        usuariosNuevosMes++;
      }
    });

    // ===== ANUNCIOS DETALLADOS =====
    const anunciosRef = collection(db, 'anuncios');
    const anunciosSnapshot = await getDocs(anunciosRef);
    
    let anunciosNuevosSemana = 0;
    let anunciosNuevosMes = 0;
    
    anunciosSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const fechaPublicacion = data.fechaPublicacion?.toDate?.() || new Date(data.fechaPublicacion);
      
      if (fechaPublicacion >= hace7Dias) {
        anunciosNuevosSemana++;
      }
      if (fechaPublicacion >= hace30Dias) {
        anunciosNuevosMes++;
      }
    });

    // Calcular métricas
    const tasaConversion = basicStats.totalUsuarios > 0 
      ? (promocionesTotales / basicStats.totalUsuarios) * 100 
      : 0;
    const ticketPromedio = promocionesTotales > 0 
      ? ingresosTotal / promocionesTotales 
      : 0;

    return {
      ...basicStats,
      ingresosHoy,
      ingresosSemana,
      ingresosMes,
      ingresosTotal,
      promocionesActivasHoy,
      promocionesCompradasHoy,
      promocionesCompradasSemana,
      promocionesCompradasMes,
      promocionesTotales,
      promocionesVIP,
      promocionesPremium,
      promocionesDestacado,
      usuariosActivosHoy: basicStats.usuariosNuevosHoy, // Placeholder
      usuariosActivosSemana: usuariosNuevosSemana,
      usuariosNuevosSemana,
      usuariosNuevosMes,
      anunciosNuevosSemana,
      anunciosNuevosMes,
      tasaConversion,
      ticketPromedio,
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas completas:', error);
    const basicStats = await getEstadisticasSistema();
    return {
      ...basicStats,
      ingresosHoy: 0,
      ingresosSemana: 0,
      ingresosMes: 0,
      ingresosTotal: 0,
      promocionesActivasHoy: 0,
      promocionesCompradasHoy: 0,
      promocionesCompradasSemana: 0,
      promocionesCompradasMes: 0,
      promocionesTotales: 0,
      promocionesVIP: 0,
      promocionesPremium: 0,
      promocionesDestacado: 0,
      usuariosActivosHoy: 0,
      usuariosActivosSemana: 0,
      usuariosNuevosSemana: 0,
      usuariosNuevosMes: 0,
      anunciosNuevosSemana: 0,
      anunciosNuevosMes: 0,
      tasaConversion: 0,
      ticketPromedio: 0,
    };
  }
}

// ==================== INGRESOS DETALLADOS ====================

export async function getIngresosPorPeriodo(dias: number = 30): Promise<IngresosDiarios[]> {
  try {
    const fechaInicio = new Date();
    fechaInicio.setDate(fechaInicio.getDate() - dias);
    fechaInicio.setHours(0, 0, 0, 0);

    const facturasRef = collection(db, 'facturas');
    const facturasSnapshot = await getDocs(facturasRef);
    
    const ingresosPorDia: Record<string, IngresosDiarios> = {};
    
    // Inicializar todos los días
    for (let i = 0; i < dias; i++) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const key = fecha.toISOString().split('T')[0];
      ingresosPorDia[key] = { fecha: key, total: 0, promociones: 0, cantidad: 0 };
    }
    
    facturasSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const fecha = data.fecha?.toDate?.() || new Date(data.fecha);
      const key = fecha.toISOString().split('T')[0];
      
      if (ingresosPorDia[key]) {
        ingresosPorDia[key].total += data.total || 0;
        ingresosPorDia[key].cantidad++;
        if (data.planTipo) {
          ingresosPorDia[key].promociones++;
        }
      }
    });
    
    return Object.values(ingresosPorDia).sort((a, b) => a.fecha.localeCompare(b.fecha));
  } catch (error) {
    console.error('Error obteniendo ingresos:', error);
    return [];
  }
}

// ==================== PROMOCIONES ====================

export async function getPromocionesActivas(): Promise<PromocionComprada[]> {
  try {
    const hoy = new Date();
    const promociones: PromocionComprada[] = [];
    
    // NUEVO: Buscar anuncios con promoción activa (destacado = true)
    try {
      const anunciosSnapshot = await getDocs(query(
        collection(db, 'anuncios'),
        where('destacado', '==', true)
      ));
      
      for (const docSnap of anunciosSnapshot.docs) {
        const data = docSnap.data();
        
        // Calcular fecha de expiración
        const fechaPromocion = data.fechaPromocion ? new Date(data.fechaPromocion) : new Date();
        const diasPromocion = data.diasPromocion || 7;
        const fechaExpiracion = new Date(fechaPromocion);
        fechaExpiracion.setDate(fechaExpiracion.getDate() + diasPromocion);
        
        // Solo incluir si no ha expirado
        if (fechaExpiracion >= hoy) {
          let userEmail = 'Usuario desconocido';
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', data.usuarioId));
            if (userDoc.exists()) {
              userEmail = userDoc.data().email;
            }
          } catch (e) {}
          
          promociones.push({
            id: `anuncio-${docSnap.id}`,
            anuncioId: docSnap.id,
            anuncioTitulo: data.titulo || 'Sin título',
            userId: data.usuarioId,
            userEmail,
            tipo: data.planPromocion || 'Destacado',
            precio: data.planPromocion === 'VIP' ? 10 : data.planPromocion === 'Premium' ? 5 : 2,
            duracion: diasPromocion,
            fechaCompra: fechaPromocion,
            fechaExpiracion,
            estado: 'activa',
          });
        }
      }
    } catch (e) {
      console.error('Error buscando anuncios promocionados activos:', e);
    }
    
    return promociones.sort((a, b) => b.fechaCompra.getTime() - a.fechaCompra.getTime());
  } catch (error) {
    console.error('Error obteniendo promociones activas:', error);
    return [];
  }
}

// Cancelar/Borrar una promoción de un anuncio
export async function cancelarPromocion(anuncioId: string): Promise<boolean> {
  try {
    // Quitar la promoción del anuncio
    await updateDoc(doc(db, 'anuncios', anuncioId), {
      destacado: false,
      planPromocion: null,
      fechaPromocion: null,
      diasPromocion: null
    });
    
    console.log('✅ Promoción cancelada para anuncio:', anuncioId);
    return true;
  } catch (error) {
    console.error('Error cancelando promoción:', error);
    return false;
  }
}

export async function getTodasPromociones(limitCount: number = 100): Promise<PromocionComprada[]> {
  try {
    const promociones: PromocionComprada[] = [];
    const hoy = new Date();
    
    // NUEVO: Buscar anuncios con promoción activa (destacado = true)
    try {
      const anunciosSnapshot = await getDocs(query(
        collection(db, 'anuncios'),
        where('destacado', '==', true),
        limit(limitCount)
      ));
      
      for (const docSnap of anunciosSnapshot.docs) {
        const data = docSnap.data();
        
        // Calcular fecha de expiración
        const fechaPromocion = data.fechaPromocion ? new Date(data.fechaPromocion) : new Date();
        const diasPromocion = data.diasPromocion || 7;
        const fechaExpiracion = new Date(fechaPromocion);
        fechaExpiracion.setDate(fechaExpiracion.getDate() + diasPromocion);
        
        let userEmail = 'Usuario desconocido';
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', data.usuarioId));
          if (userDoc.exists()) {
            userEmail = userDoc.data().email;
          }
        } catch (e) {}
        
        promociones.push({
          id: `anuncio-${docSnap.id}`,
          anuncioId: docSnap.id,
          anuncioTitulo: data.titulo || 'Sin título',
          userId: data.usuarioId,
          userEmail,
          tipo: data.planPromocion || 'Destacado',
          precio: data.planPromocion === 'VIP' ? 10 : data.planPromocion === 'Premium' ? 5 : 2,
          duracion: diasPromocion,
          fechaCompra: fechaPromocion,
          fechaExpiracion,
          estado: fechaExpiracion >= hoy ? 'activa' : 'expirada',
        });
      }
    } catch (e) {
      console.error('Error buscando anuncios promocionados:', e);
    }
    
    // También buscar en facturas con planTipo (historial de compras)
    try {
      const facturasSnapshot = await getDocs(query(collection(db, 'facturas'), limit(limitCount)));
      
      for (const docSnap of facturasSnapshot.docs) {
        const data = docSnap.data();
        if (data.planTipo) {
          // Evitar duplicados - verificar si ya existe una promoción para este concepto
          const yaExiste = promociones.some(p => 
            p.userEmail === data.clienteEmail && 
            p.tipo === data.planTipo &&
            Math.abs(p.fechaCompra.getTime() - (data.fecha?.toDate?.()?.getTime() || 0)) < 60000
          );
          
          if (!yaExiste) {
            const fechaCompra = data.fecha?.toDate?.() || new Date(data.fecha);
            const diasDuracion = parseInt(data.descripcion?.match(/(\d+) días/)?.[1] || '7');
            const fechaExpiracion = new Date(fechaCompra);
            fechaExpiracion.setDate(fechaExpiracion.getDate() + diasDuracion);
            
            promociones.push({
              id: docSnap.id,
              anuncioId: data.planId || '',
              anuncioTitulo: data.descripcion || data.concepto || 'Promoción',
              userId: data.userId,
              userEmail: data.clienteEmail,
              tipo: data.planTipo as any,
              precio: data.total || 0,
              duracion: diasDuracion,
              fechaCompra,
              fechaExpiracion,
              estado: fechaExpiracion >= hoy ? 'activa' : 'expirada',
            });
          }
        }
      }
    } catch (e) {}
    
    return promociones.sort((a, b) => b.fechaCompra.getTime() - a.fechaCompra.getTime());
  } catch (error) {
    console.error('Error obteniendo todas las promociones:', error);
    return [];
  }
}

// ==================== USUARIOS DETALLADOS ====================

export async function getUsuariosDetallados(limitCount: number = 100): Promise<UsuarioDetallado[]> {
  try {
    const q = query(
      collection(db, 'usuarios'),
      orderBy('fechaRegistro', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    const usuarios: UsuarioDetallado[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Contar anuncios del usuario
      let totalAnuncios = 0;
      try {
        const anunciosQuery = query(
          collection(db, 'anuncios'),
          where('vendedorId', '==', docSnap.id)
        );
        const anunciosSnapshot = await getCountFromServer(anunciosQuery);
        totalAnuncios = anunciosSnapshot.data().count;
      } catch (e) {}
      
      // Calcular total gastado
      let totalGastado = 0;
      try {
        const facturasQuery = query(
          collection(db, 'facturas'),
          where('userId', '==', docSnap.id)
        );
        const facturasSnapshot = await getDocs(facturasQuery);
        facturasSnapshot.docs.forEach(f => {
          totalGastado += f.data().total || 0;
        });
      } catch (e) {}
      
      usuarios.push({
        id: docSnap.id,
        ...data,
        fechaRegistro: data.fechaRegistro?.toDate?.() || new Date(data.fechaRegistro),
        totalAnuncios,
        totalGastado,
      } as UsuarioDetallado);
    }
    
    return usuarios;
  } catch (error) {
    console.error('Error obteniendo usuarios detallados:', error);
    return [];
  }
}

// ==================== FACTURAS ====================

export async function getAllFacturas(limitCount: number = 100): Promise<Factura[]> {
  try {
    const q = query(
      collection(db, 'facturas'),
      orderBy('fecha', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate?.() || new Date(doc.data().fecha),
    })) as Factura[];
  } catch (error) {
    console.error('Error obteniendo facturas:', error);
    return [];
  }
}

// ==================== GESTIÓN DE USUARIOS ====================

export async function getAllUsuarios(limitCount: number = 100): Promise<Usuario[]> {
  try {
    const q = query(
      collection(db, 'usuarios'),
      orderBy('fechaRegistro', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaRegistro: doc.data().fechaRegistro?.toDate() || new Date(),
    })) as Usuario[];
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    return [];
  }
}

export async function searchUsuarios(searchTerm: string): Promise<Usuario[]> {
  try {
    // Firestore no soporta búsqueda de texto completo, hacemos búsqueda por email exacto o cargamos todos
    const snapshot = await getDocs(collection(db, 'usuarios'));
    const usuarios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaRegistro: doc.data().fechaRegistro?.toDate() || new Date(),
    })) as Usuario[];
    
    const term = searchTerm.toLowerCase();
    return usuarios.filter(u => 
      u.email?.toLowerCase().includes(term) ||
      u.nombre?.toLowerCase().includes(term) ||
      u.id?.toLowerCase().includes(term)
    );
  } catch (error) {
    console.error('Error buscando usuarios:', error);
    return [];
  }
}

export async function updateUsuarioRol(userId: string, rol: RolUsuario): Promise<void> {
  await updateDoc(doc(db, 'usuarios', userId), { rol });
}

export async function suspenderUsuario(
  userId: string, 
  motivo: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'usuarios', userId), {
    suspendido: true,
    motivoSuspension: motivo,
    fechaSuspension: Timestamp.now(),
  });
  
  await logAdminAction(
    adminId, 
    adminEmail, 
    'Suspender usuario', 
    'usuario', 
    userId, 
    `Motivo: ${motivo}`
  );
}

export async function reactivarUsuario(
  userId: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'usuarios', userId), {
    suspendido: false,
    motivoSuspension: null,
    fechaSuspension: null,
  });
  
  await logAdminAction(adminId, adminEmail, 'Reactivar usuario', 'usuario', userId);
}

export async function verificarUsuario(
  userId: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'usuarios', userId), { verificado: true });
  await logAdminAction(adminId, adminEmail, 'Verificar usuario', 'usuario', userId);
}

export async function eliminarUsuario(
  userId: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  // Primero eliminar todos los anuncios del usuario
  const anunciosQuery = query(
    collection(db, 'anuncios'),
    where('vendedorId', '==', userId)
  );
  const anunciosSnapshot = await getDocs(anunciosQuery);
  
  for (const anuncioDoc of anunciosSnapshot.docs) {
    await deleteDoc(anuncioDoc.ref);
  }
  
  // Eliminar el usuario
  await deleteDoc(doc(db, 'usuarios', userId));
  
  await logAdminAction(
    adminId, 
    adminEmail, 
    'Eliminar usuario', 
    'usuario', 
    userId,
    `Eliminados ${anunciosSnapshot.size} anuncios asociados`
  );
}

// ==================== GESTIÓN DE ANUNCIOS ====================

export async function getAllAnuncios(limitCount: number = 100): Promise<Anuncio[]> {
  try {
    const q = query(
      collection(db, 'anuncios'),
      orderBy('fechaPublicacion', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
    })) as Anuncio[];
  } catch (error) {
    console.error('Error obteniendo anuncios:', error);
    return [];
  }
}

export async function getAnunciosPendientes(): Promise<Anuncio[]> {
  try {
    const q = query(
      collection(db, 'anuncios'),
      where('estado', '==', EstadoAnuncio.EN_REVISION),
      orderBy('fechaPublicacion', 'asc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
    })) as Anuncio[];
  } catch (error) {
    console.error('Error obteniendo anuncios pendientes:', error);
    return [];
  }
}

export async function getAnunciosReportados(): Promise<Anuncio[]> {
  try {
    const q = query(
      collection(db, 'anuncios'),
      where('reportes', '>', 0),
      orderBy('reportes', 'desc'),
      limit(50)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaPublicacion: doc.data().fechaPublicacion?.toDate() || new Date(),
    })) as Anuncio[];
  } catch (error) {
    console.error('Error obteniendo anuncios reportados:', error);
    return [];
  }
}

export async function aprobarAnuncio(
  anuncioId: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'anuncios', anuncioId), {
    estado: EstadoAnuncio.ACTIVO,
  });
  await logAdminAction(adminId, adminEmail, 'Aprobar anuncio', 'anuncio', anuncioId);
}

export async function rechazarAnuncio(
  anuncioId: string,
  motivo: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'anuncios', anuncioId), {
    estado: EstadoAnuncio.RECHAZADO,
    motivoRechazo: motivo,
  });
  await logAdminAction(
    adminId, 
    adminEmail, 
    'Rechazar anuncio', 
    'anuncio', 
    anuncioId,
    `Motivo: ${motivo}`
  );
}

export async function pausarAnuncio(
  anuncioId: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'anuncios', anuncioId), {
    estado: EstadoAnuncio.PAUSADO,
  });
  await logAdminAction(adminId, adminEmail, 'Pausar anuncio', 'anuncio', anuncioId);
}

export async function eliminarAnuncioAdmin(
  anuncioId: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  // Obtener el anuncio para saber el vendedor
  const anuncioDoc = await getDoc(doc(db, 'anuncios', anuncioId));
  if (anuncioDoc.exists()) {
    const vendedorId = anuncioDoc.data().vendedorId;
    
    // Eliminar del array del usuario
    if (vendedorId) {
      try {
        const { arrayRemove } = await import('firebase/firestore');
        await updateDoc(doc(db, 'usuarios', vendedorId), {
          anunciosPublicados: arrayRemove(anuncioId),
        });
      } catch (e) {
        console.error('Error actualizando usuario:', e);
      }
    }
  }
  
  await deleteDoc(doc(db, 'anuncios', anuncioId));
  await logAdminAction(adminId, adminEmail, 'Eliminar anuncio', 'anuncio', anuncioId);
}

export async function destacarAnuncio(
  anuncioId: string,
  destacado: boolean,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'anuncios', anuncioId), { destacado });
  await logAdminAction(
    adminId, 
    adminEmail, 
    destacado ? 'Destacar anuncio' : 'Quitar destacado', 
    'anuncio', 
    anuncioId
  );
}

// ==================== GESTIÓN DE REPORTES ====================

export async function crearReporte(reporte: Omit<ReporteAnuncio, 'id' | 'fecha' | 'estado'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'reportes'), {
    ...reporte,
    fecha: Timestamp.now(),
    estado: 'pendiente',
  });
  
  // Incrementar contador de reportes en el anuncio
  const { increment } = await import('firebase/firestore');
  await updateDoc(doc(db, 'anuncios', reporte.anuncioId), {
    reportes: increment(1),
  });
  
  return docRef.id;
}

export async function getReportesPendientes(): Promise<ReporteAnuncio[]> {
  try {
    const q = query(
      collection(db, 'reportes'),
      where('estado', '==', 'pendiente'),
      orderBy('fecha', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as ReporteAnuncio[];
  } catch (error) {
    console.error('Error obteniendo reportes:', error);
    return [];
  }
}

export async function resolverReporte(
  reporteId: string,
  estado: 'resuelto' | 'descartado',
  accionTomada: string,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await updateDoc(doc(db, 'reportes', reporteId), {
    estado,
    accionTomada,
    revisadoPor: adminId,
  });
  await logAdminAction(
    adminId, 
    adminEmail, 
    `Resolver reporte: ${estado}`, 
    'reporte', 
    reporteId,
    accionTomada
  );
}

// ==================== CONFIGURACIÓN DEL SISTEMA ====================

export async function getConfiguracion(): Promise<Record<string, any>> {
  try {
    const configDoc = await getDoc(doc(db, 'configuracion', 'general'));
    return configDoc.exists() ? configDoc.data() : {};
  } catch (error) {
    console.error('Error obteniendo configuración:', error);
    return {};
  }
}

export async function updateConfiguracion(
  config: Record<string, any>,
  adminId: string,
  adminEmail: string
): Promise<void> {
  await setDoc(doc(db, 'configuracion', 'general'), config, { merge: true });
  await logAdminAction(
    adminId, 
    adminEmail, 
    'Actualizar configuración', 
    'sistema',
    undefined,
    JSON.stringify(config)
  );
}

// ==================== UTILIDADES ====================

export async function makeUserAdmin(userId: string, superAdminId: string): Promise<void> {
  // Solo superadmin puede crear admins
  const isSuperAdminUser = await isSuperAdmin(superAdminId);
  if (!isSuperAdminUser) {
    throw new Error('Solo superadmin puede asignar roles de admin');
  }
  
  await updateDoc(doc(db, 'usuarios', userId), { rol: 'admin' });
}

export async function makeUserModerator(userId: string, adminId: string): Promise<void> {
  const adminRole = await getUserRole(adminId);
  if (adminRole !== 'admin' && adminRole !== 'superadmin') {
    throw new Error('Solo admin o superadmin puede asignar moderadores');
  }
  
  await updateDoc(doc(db, 'usuarios', userId), { rol: 'moderator' });
}

// Script inicial para crear el primer superadmin (ejecutar una sola vez)
export async function createInitialSuperAdmin(userId: string, secretKey: string): Promise<boolean> {
  // Clave secreta para crear el primer superadmin (cambiar en producción)
  const SETUP_SECRET = process.env.NEXT_PUBLIC_ADMIN_SETUP_KEY || 'setup-admin-2024';
  
  if (secretKey !== SETUP_SECRET) {
    console.error('Clave secreta incorrecta');
    return false;
  }
  
  try {
    await updateDoc(doc(db, 'usuarios', userId), { rol: 'superadmin' });
    console.log('✅ Superadmin creado exitosamente');
    return true;
  } catch (error) {
    console.error('Error creando superadmin:', error);
    return false;
  }
}

// ==================== ANUNCIOS EXTRA ====================

export async function getAnunciosExtraComprados(limitCount: number = 100): Promise<AnuncioExtraComprado[]> {
  try {
    const extras: AnuncioExtraComprado[] = [];
    
    // Buscar en facturas con concepto de anuncios extra
    const facturasRef = collection(db, 'facturas');
    const snapshot = await getDocs(query(facturasRef, orderBy('fecha', 'desc'), limit(limitCount)));
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const concepto = (data.concepto || '').toLowerCase();
      
      // Detectar compras de anuncios extra
      if (concepto.includes('anuncio') && (concepto.includes('extra') || concepto.includes('paquete') || concepto.includes('adicional'))) {
        let userName = 'Usuario desconocido';
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', data.userId));
          if (userDoc.exists()) {
            userName = userDoc.data().nombre || data.clienteNombre;
          }
        } catch (e) {}
        
        extras.push({
          id: docSnap.id,
          userId: data.userId,
          userEmail: data.clienteEmail || '',
          userName,
          paquete: data.concepto || 'Paquete de anuncios',
          cantidad: data.cantidad || 1,
          precio: data.total || 0,
          fechaCompra: data.fecha?.toDate?.() || new Date(data.fecha),
          anunciosUsados: 0, // Esto se podría calcular con más lógica
          anunciosRestantes: data.cantidad || 1,
          estado: 'activo',
        });
      }
    }
    
    // También buscar en colección dedicada de anuncios_extra si existe
    try {
      const extrasRef = collection(db, 'anuncios_extra');
      const extrasSnapshot = await getDocs(query(extrasRef, orderBy('fechaCompra', 'desc'), limit(limitCount)));
      
      for (const docSnap of extrasSnapshot.docs) {
        const data = docSnap.data();
        const fechaCompra = data.fechaCompra?.toDate?.() || new Date(data.fechaCompra);
        
        let userName = 'Usuario desconocido';
        let userEmail = '';
        try {
          const userDoc = await getDoc(doc(db, 'usuarios', data.userId));
          if (userDoc.exists()) {
            userName = userDoc.data().nombre;
            userEmail = userDoc.data().email;
          }
        } catch (e) {}
        
        extras.push({
          id: docSnap.id,
          userId: data.userId,
          userEmail,
          userName,
          paquete: data.paquete || data.nombre || 'Paquete de anuncios',
          cantidad: data.cantidad || data.anunciosTotal || 1,
          precio: data.precio || data.total || 0,
          fechaCompra,
          anunciosUsados: data.anunciosUsados || 0,
          anunciosRestantes: data.anunciosRestantes || data.cantidad || 1,
          estado: data.estado || (data.anunciosRestantes > 0 ? 'activo' : 'agotado'),
        });
      }
    } catch (e) {
      // La colección puede no existir
    }
    
    // También revisar planes de usuarios para anuncios extra
    try {
      const planesRef = collection(db, 'planes');
      const planesSnapshot = await getDocs(planesRef);
      
      for (const docSnap of planesSnapshot.docs) {
        const data = docSnap.data();
        if (data.anunciosExtra && data.anunciosExtra > 0) {
          let userName = 'Usuario desconocido';
          let userEmail = '';
          try {
            const userDoc = await getDoc(doc(db, 'usuarios', data.userId));
            if (userDoc.exists()) {
              userName = userDoc.data().nombre;
              userEmail = userDoc.data().email;
            }
          } catch (e) {}
          
          const fechaCompra = data.fechaCompra ? new Date(data.fechaCompra) : new Date();
          
          extras.push({
            id: docSnap.id,
            userId: data.userId,
            userEmail,
            userName,
            paquete: `Plan ${data.nombre || 'Premium'} - Anuncios Extra`,
            cantidad: data.anunciosExtra || 0,
            precio: data.precio || 0,
            fechaCompra,
            anunciosUsados: data.anunciosUsados || 0,
            anunciosRestantes: (data.anunciosExtra || 0) - (data.anunciosUsados || 0),
            estado: data.activo ? 'activo' : 'expirado',
          });
        }
      }
    } catch (e) {}
    
    // Eliminar duplicados y ordenar
    const uniqueExtras = extras.reduce((acc, curr) => {
      const exists = acc.find(e => e.id === curr.id);
      if (!exists) acc.push(curr);
      return acc;
    }, [] as AnuncioExtraComprado[]);
    
    return uniqueExtras.sort((a, b) => b.fechaCompra.getTime() - a.fechaCompra.getTime());
  } catch (error) {
    console.error('Error obteniendo anuncios extra:', error);
    return [];
  }
}

export async function getFacturasDetalladas(limitCount: number = 100): Promise<FacturaDetallada[]> {
  try {
    const q = query(
      collection(db, 'facturas'),
      orderBy('fecha', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    
    const facturas: FacturaDetallada[] = [];
    
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      
      // Obtener nombre del usuario
      let userName = data.clienteNombre || 'Usuario desconocido';
      try {
        const userDoc = await getDoc(doc(db, 'usuarios', data.userId));
        if (userDoc.exists()) {
          userName = userDoc.data().nombre || userName;
        }
      } catch (e) {}
      
      // Determinar tipo de compra
      let tipoCompra: 'promocion' | 'anuncios_extra' | 'otro' = 'otro';
      const concepto = (data.concepto || '').toLowerCase();
      
      if (data.planTipo || concepto.includes('vip') || concepto.includes('premium') || concepto.includes('destacado') || concepto.includes('promocion') || concepto.includes('promoción')) {
        tipoCompra = 'promocion';
      } else if (concepto.includes('anuncio') || concepto.includes('extra') || concepto.includes('paquete')) {
        tipoCompra = 'anuncios_extra';
      }
      
      facturas.push({
        id: docSnap.id,
        ...data,
        fecha: data.fecha?.toDate?.() || new Date(data.fecha),
        userName,
        tipoCompra,
        planTipo: data.planTipo || undefined,
      } as FacturaDetallada);
    }
    
    return facturas;
  } catch (error) {
    console.error('Error obteniendo facturas detalladas:', error);
    return [];
  }
}

export async function getResumenIngresosPorMes(meses: number = 12): Promise<ResumenIngresos[]> {
  try {
    const facturasRef = collection(db, 'facturas');
    const snapshot = await getDocs(facturasRef);
    
    const resumenPorMes: Record<string, ResumenIngresos> = {};
    
    // Inicializar meses
    for (let i = 0; i < meses; i++) {
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - i);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      resumenPorMes[key] = {
        periodo: key,
        ingresos: 0,
        promociones: 0,
        anunciosExtra: 0,
        transacciones: 0,
      };
    }
    
    snapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const fecha = data.fecha?.toDate?.() || new Date(data.fecha);
      const key = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
      
      if (resumenPorMes[key]) {
        const total = data.total || 0;
        resumenPorMes[key].ingresos += total;
        resumenPorMes[key].transacciones++;
        
        const concepto = (data.concepto || '').toLowerCase();
        if (data.planTipo || concepto.includes('vip') || concepto.includes('premium') || concepto.includes('destacado')) {
          resumenPorMes[key].promociones += total;
        } else if (concepto.includes('anuncio') || concepto.includes('extra')) {
          resumenPorMes[key].anunciosExtra += total;
        }
      }
    });
    
    return Object.values(resumenPorMes).sort((a, b) => a.periodo.localeCompare(b.periodo));
  } catch (error) {
    console.error('Error obteniendo resumen de ingresos:', error);
    return [];
  }
}

export async function getPromocionesCompradasPorUsuario(userId: string): Promise<PromocionComprada[]> {
  try {
    const promociones: PromocionComprada[] = [];
    
    // Buscar en promociones
    try {
      const q = query(collection(db, 'promociones'), where('userId', '==', userId));
      const snapshot = await getDocs(q);
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const fechaExpiracion = data.fechaExpiracion?.toDate?.() || new Date(data.fechaExpiracion);
        
        let anuncioTitulo = 'Anuncio eliminado';
        try {
          const anuncioDoc = await getDoc(doc(db, 'anuncios', data.anuncioId));
          if (anuncioDoc.exists()) {
            anuncioTitulo = anuncioDoc.data().titulo;
          }
        } catch (e) {}
        
        promociones.push({
          id: docSnap.id,
          anuncioId: data.anuncioId,
          anuncioTitulo,
          userId: data.userId,
          userEmail: '',
          tipo: data.tipo,
          precio: data.precio || 0,
          duracion: data.duracion || 7,
          fechaCompra: data.fechaCompra?.toDate?.() || new Date(data.fechaCompra),
          fechaExpiracion,
          estado: fechaExpiracion >= new Date() ? 'activa' : 'expirada',
        });
      }
    } catch (e) {}
    
    return promociones.sort((a, b) => b.fechaCompra.getTime() - a.fechaCompra.getTime());
  } catch (error) {
    console.error('Error obteniendo promociones del usuario:', error);
    return [];
  }
}

// ==================== DETALLES COMPLETOS DE USUARIO ====================

export interface PlanUsuario {
  id: string;
  tipo: string;
  anunciosDisponibles: number;
  anunciosUsados: number;
  totalAnuncios: number;
  precio: number;
  totalInvertido: number;
  diasDuracion: number;
  fechaCompra: Date;
  fechaExpiracion: Date;
  diasRestantes: number;
  estado: 'activo' | 'expirado' | 'agotado';
  porcentajeUso: number;
}

export interface AnuncioPromocionado {
  id: string;
  titulo: string;
  imagen: string;
  precio: number;
  tipoPromocion: string;
  fechaPromocion: Date;
  fechaExpiracion: Date;
  estado: 'activa' | 'expirada';
  diasRestantes: number;
}

export interface HistorialCompra {
  id: string;
  tipo: 'plan' | 'promocion' | 'anuncios_extra';
  concepto: string;
  precio: number;
  fecha: Date;
  detalles: string;
}

export interface DetallesUsuarioCompleto {
  // Info básica
  usuario: Usuario;
  
  // Plan actual
  planActivo: PlanUsuario | null;
  planesHistoricos: PlanUsuario[];
  
  // Anuncios
  totalAnuncios: number;
  anunciosActivos: number;
  anunciosPublicados: Anuncio[];
  anunciosRestantes: number;
  
  // Promociones
  promocionesActivas: AnuncioPromocionado[];
  promocionesHistoricas: PromocionComprada[];
  totalPromocionesCompradas: number;
  
  // Financiero
  totalGastado: number;
  historialCompras: HistorialCompra[];
  facturas: Factura[];
  
  // Actividad
  ultimaActividad: Date | null;
  fechaRegistro: Date;
  diasComoUsuario: number;
}

export async function getDetallesUsuarioCompleto(userId: string): Promise<DetallesUsuarioCompleto | null> {
  try {
    const hoy = new Date();
    
    // 1. Obtener usuario
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    const usuario: Usuario = {
      id: userId,
      ...userData,
      fechaRegistro: userData.fechaRegistro?.toDate?.() || new Date(userData.fechaRegistro),
    } as Usuario;
    
    // 2. Obtener planes del usuario
    const planesQuery = query(collection(db, 'planes'), where('userId', '==', userId));
    const planesSnapshot = await getDocs(planesQuery);
    
    const planes: PlanUsuario[] = [];
    
    for (const docSnap of planesSnapshot.docs) {
      const data = docSnap.data();
      const fechaCompra = data.fechaCompra ? new Date(data.fechaCompra) : new Date();
      const fechaExpiracion = data.fechaExpiracion ? new Date(data.fechaExpiracion) : new Date();
      const diasRestantes = Math.max(0, Math.ceil((fechaExpiracion.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
      const anunciosDisponibles = data.anunciosDisponibles || data.totalAnuncios || 0;
      const anunciosUsados = data.anunciosUsados || 0;
      
      let estado: 'activo' | 'expirado' | 'agotado' = 'activo';
      if (fechaExpiracion < hoy) estado = 'expirado';
      else if (anunciosDisponibles <= 0) estado = 'agotado';
      
      const plan: PlanUsuario = {
        id: docSnap.id,
        tipo: data.tipo || data.nombre || 'Plan',
        anunciosDisponibles,
        anunciosUsados,
        totalAnuncios: data.totalAnuncios || anunciosDisponibles + anunciosUsados,
        precio: data.precio || 0,
        totalInvertido: data.totalInvertido || data.precio || 0,
        diasDuracion: data.diasDuracion || 30,
        fechaCompra,
        fechaExpiracion,
        diasRestantes,
        estado,
        porcentajeUso: data.totalAnuncios > 0 
          ? Math.round((anunciosUsados / data.totalAnuncios) * 100) 
          : 0,
      };
      
      planes.push(plan);
    }
    
    // Encontrar el plan activo (el que no ha expirado y tiene la fecha de expiración más lejana)
    const planActivo: PlanUsuario | null = planes
      .filter(p => p.estado === 'activo')
      .sort((a, b) => b.fechaExpiracion.getTime() - a.fechaExpiracion.getTime())[0] || null;
    
    // 3. Obtener anuncios del usuario
    const anunciosQuery = query(collection(db, 'anuncios'), where('vendedorId', '==', userId));
    const anunciosSnapshot = await getDocs(anunciosQuery);
    
    const anunciosPublicados: Anuncio[] = [];
    const promocionesActivas: AnuncioPromocionado[] = [];
    let anunciosActivos = 0;
    
    anunciosSnapshot.docs.forEach(docSnap => {
      const data = docSnap.data();
      const anuncio: Anuncio = {
        id: docSnap.id,
        ...data,
        fechaPublicacion: data.fechaPublicacion?.toDate?.() || new Date(data.fechaPublicacion),
      } as Anuncio;
      
      anunciosPublicados.push(anuncio);
      
      if (data.estado === 'Activo') anunciosActivos++;
      
      // Verificar si tiene promoción activa
      if (data.planPromocion || data.promocion || data.destacado || data.promovado) {
        const fechaPromocion = data.fechaPromocion ? new Date(data.fechaPromocion) : new Date();
        const tipoPromo = data.planPromocion || data.promocion?.tipo || (data.destacado ? 'Destacado' : 'Promoción');
        const diasPromo = data.promocion?.diasRestantes || 7;
        const fechaExpPromo = new Date(fechaPromocion);
        fechaExpPromo.setDate(fechaExpPromo.getDate() + diasPromo);
        
        const diasRestantesPromo = Math.max(0, Math.ceil((fechaExpPromo.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
        
        promocionesActivas.push({
          id: docSnap.id,
          titulo: data.titulo,
          imagen: data.imagenes?.[0] || '',
          precio: data.precio || 0,
          tipoPromocion: tipoPromo,
          fechaPromocion,
          fechaExpiracion: fechaExpPromo,
          estado: fechaExpPromo >= hoy ? 'activa' : 'expirada',
          diasRestantes: diasRestantesPromo,
        });
      }
    });
    
    // 4. Obtener promociones históricas
    const promocionesHistoricas = await getPromocionesCompradasPorUsuario(userId);
    
    // 5. Obtener facturas
    const facturasQuery = query(collection(db, 'facturas'), where('userId', '==', userId), orderBy('fecha', 'desc'));
    let facturasData: Factura[] = [];
    let totalGastado = 0;
    const historialCompras: HistorialCompra[] = [];
    
    try {
      const facturasSnapshot = await getDocs(facturasQuery);
      facturasData = facturasSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        totalGastado += data.total || 0;
        
        // Agregar al historial de compras
        const concepto = (data.concepto || '').toLowerCase();
        let tipo: 'plan' | 'promocion' | 'anuncios_extra' = 'promocion';
        if (concepto.includes('plan') || concepto.includes('suscripción') || concepto.includes('suscripcion')) {
          tipo = 'plan';
        } else if (concepto.includes('extra') || concepto.includes('paquete')) {
          tipo = 'anuncios_extra';
        }
        
        historialCompras.push({
          id: docSnap.id,
          tipo,
          concepto: data.concepto || 'Compra',
          precio: data.total || 0,
          fecha: data.fecha?.toDate?.() || new Date(data.fecha),
          detalles: data.descripcion || '',
        });
        
        return {
          id: docSnap.id,
          ...data,
          fecha: data.fecha?.toDate?.() || new Date(data.fecha),
        } as Factura;
      });
    } catch (e) {
      // Puede que no haya índice para la query
      const facturasSnapshot = await getDocs(query(collection(db, 'facturas'), where('userId', '==', userId)));
      facturasData = facturasSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        totalGastado += data.total || 0;
        return {
          id: docSnap.id,
          ...data,
          fecha: data.fecha?.toDate?.() || new Date(data.fecha),
        } as Factura;
      });
    }
    
    // 6. Calcular anuncios restantes (del plan activo)
    const anunciosRestantes = planActivo ? planActivo.anunciosDisponibles : 0;
    
    // 7. Calcular días como usuario
    const fechaRegistro = usuario.fechaRegistro || new Date();
    const diasComoUsuario = Math.ceil((hoy.getTime() - fechaRegistro.getTime()) / (1000 * 60 * 60 * 24));
    
    // 8. Última actividad (fecha del último anuncio o último mensaje)
    let ultimaActividad: Date | null = null;
    if (anunciosPublicados.length > 0) {
      ultimaActividad = anunciosPublicados.reduce((max, a) => 
        a.fechaPublicacion > max ? a.fechaPublicacion : max, 
        anunciosPublicados[0].fechaPublicacion
      );
    }
    
    return {
      usuario,
      planActivo,
      planesHistoricos: planes.sort((a, b) => b.fechaCompra.getTime() - a.fechaCompra.getTime()),
      totalAnuncios: anunciosPublicados.length,
      anunciosActivos,
      anunciosPublicados: anunciosPublicados.sort((a, b) => b.fechaPublicacion.getTime() - a.fechaPublicacion.getTime()),
      anunciosRestantes,
      promocionesActivas: promocionesActivas.filter(p => p.estado === 'activa'),
      promocionesHistoricas,
      totalPromocionesCompradas: promocionesHistoricas.length,
      totalGastado,
      historialCompras: historialCompras.sort((a, b) => b.fecha.getTime() - a.fecha.getTime()),
      facturas: facturasData,
      ultimaActividad,
      fechaRegistro,
      diasComoUsuario,
    };
  } catch (error) {
    console.error('Error obteniendo detalles del usuario:', error);
    return null;
  }
}

// Extender tiempo del plan a un usuario (cuando compra antes de que expire)
export async function extenderPlanUsuario(
  planId: string,
  diasAdicionales: number,
  adminId: string,
  adminEmail: string
): Promise<void> {
  try {
    const planDoc = await getDoc(doc(db, 'planes', planId));
    if (!planDoc.exists()) throw new Error('Plan no encontrado');
    
    const data = planDoc.data();
    const fechaExpiracionActual = data.fechaExpiracion ? new Date(data.fechaExpiracion) : new Date();
    const nuevaFechaExpiracion = new Date(fechaExpiracionActual);
    nuevaFechaExpiracion.setDate(nuevaFechaExpiracion.getDate() + diasAdicionales);
    
    await updateDoc(doc(db, 'planes', planId), {
      fechaExpiracion: nuevaFechaExpiracion.toISOString(),
      diasDuracion: (data.diasDuracion || 30) + diasAdicionales,
    });
    
    await logAdminAction(
      adminId,
      adminEmail,
      'Extender plan de usuario',
      'usuario',
      data.userId,
      `Plan ${planId} extendido ${diasAdicionales} días hasta ${nuevaFechaExpiracion.toLocaleDateString()}`
    );
  } catch (error) {
    console.error('Error extendiendo plan:', error);
    throw error;
  }
}

// Agregar anuncios extra a un usuario
export async function agregarAnunciosExtraUsuario(
  planId: string,
  anunciosExtra: number,
  adminId: string,
  adminEmail: string
): Promise<void> {
  try {
    const planDoc = await getDoc(doc(db, 'planes', planId));
    if (!planDoc.exists()) throw new Error('Plan no encontrado');
    
    const data = planDoc.data();
    const nuevosDisponibles = (data.anunciosDisponibles || 0) + anunciosExtra;
    const nuevoTotal = (data.totalAnuncios || 0) + anunciosExtra;
    
    await updateDoc(doc(db, 'planes', planId), {
      anunciosDisponibles: nuevosDisponibles,
      totalAnuncios: nuevoTotal,
    });
    
    await logAdminAction(
      adminId,
      adminEmail,
      'Agregar anuncios extra',
      'usuario',
      data.userId,
      `Agregados ${anunciosExtra} anuncios al plan ${planId}. Total disponibles: ${nuevosDisponibles}`
    );
  } catch (error) {
    console.error('Error agregando anuncios:', error);
    throw error;
  }
}
