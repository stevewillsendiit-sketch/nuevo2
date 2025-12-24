import { db } from './firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  Timestamp, 
  addDoc,
  updateDoc,
  increment,
  onSnapshot,
  startAfter,
  endAt,
  startAt
} from 'firebase/firestore';

// ==================== TIPOS ====================

export interface VisitaWeb {
  id?: string;
  ip: string;
  userAgent: string;
  pagina: string;
  referrer: string;
  fecha: Date;
  pais?: string;
  ciudad?: string;
  dispositivo: 'mobile' | 'tablet' | 'desktop';
  navegador: string;
  sistemaOperativo: string;
  usuarioId?: string;
  sesionId: string;
  duracion?: number; // segundos
}

export interface RegistroUsuario {
  id: string;
  email: string;
  nombre: string;
  fecha: Date;
  ip?: string;
  metodoRegistro: 'email' | 'google' | 'facebook';
  dispositivo?: string;
  pais?: string;
}

export interface EstadisticasRealTime {
  visitantesActivos: number;
  visitasHoy: number;
  visitasSemana: number;
  visitasMes: number;
  registrosHoy: number;
  registrosSemana: number;
  registrosMes: number;
  anunciosPublicadosHoy: number;
  mensajesHoy: number;
  paginasMasVisitadas: { pagina: string; visitas: number }[];
  dispositivosHoy: { tipo: string; cantidad: number }[];
  navegadoresHoy: { navegador: string; cantidad: number }[];
  paisesHoy: { pais: string; cantidad: number }[];
  horasPico: { hora: number; visitas: number }[];
  usuariosNuevosRecientes: RegistroUsuario[];
  visitasRecientes: VisitaWeb[];
}

export interface StatsResumen {
  totalUsuarios: number;
  totalAnuncios: number;
  totalMensajes: number;
  totalVisitas: number;
  promedioVisitasDiarias: number;
  tasaConversion: number; // visitantes que se registran
  tiempoPromedioSesion: number; // minutos
}

// ==================== REGISTRO DE VISITAS ====================

export async function registrarVisita(datos: Omit<VisitaWeb, 'id' | 'fecha'>): Promise<void> {
  try {
    const visitaRef = collection(db, 'visitas_web');
    
    // Filtrar campos undefined para evitar errores de Firestore
    const datosLimpios: Record<string, unknown> = {
      ip: datos.ip,
      userAgent: datos.userAgent,
      pagina: datos.pagina,
      referrer: datos.referrer,
      dispositivo: datos.dispositivo,
      navegador: datos.navegador,
      sistemaOperativo: datos.sistemaOperativo,
      sesionId: datos.sesionId,
      fecha: Timestamp.now()
    };
    
    // Solo agregar campos opcionales si tienen valor
    if (datos.usuarioId) datosLimpios.usuarioId = datos.usuarioId;
    if (datos.pais) datosLimpios.pais = datos.pais;
    if (datos.ciudad) datosLimpios.ciudad = datos.ciudad;
    if (datos.duracion !== undefined) datosLimpios.duracion = datos.duracion;
    
    await addDoc(visitaRef, datosLimpios);
    
    // Actualizar contador diario
    const hoy = new Date().toISOString().split('T')[0];
    const contadorRef = doc(db, 'contadores_diarios', hoy);
    const contadorDoc = await getDoc(contadorRef);
    
    if (contadorDoc.exists()) {
      await updateDoc(contadorRef, {
        visitas: increment(1),
        [`dispositivos.${datos.dispositivo}`]: increment(1),
        [`navegadores.${datos.navegador}`]: increment(1),
        [`paginas.${datos.pagina.replace(/\//g, '_')}`]: increment(1)
      });
    } else {
      await setDoc(contadorRef, {
        fecha: hoy,
        visitas: 1,
        registros: 0,
        anuncios: 0,
        mensajes: 0,
        dispositivos: { [datos.dispositivo]: 1 },
        navegadores: { [datos.navegador]: 1 },
        paginas: { [datos.pagina.replace(/\//g, '_')]: 1 },
        paises: {},
        horas: {}
      });
    }
    
    // Actualizar hora pico
    const hora = new Date().getHours();
    await updateDoc(contadorRef, {
      [`horas.h${hora}`]: increment(1)
    });
    
  } catch (error) {
    console.error('Error registrando visita:', error);
  }
}

export async function registrarUsuarioNuevo(usuario: Omit<RegistroUsuario, 'id' | 'fecha'>): Promise<void> {
  try {
    const registrosRef = collection(db, 'registros_usuarios');
    await addDoc(registrosRef, {
      ...usuario,
      fecha: Timestamp.now()
    });
    
    // Actualizar contador diario
    const hoy = new Date().toISOString().split('T')[0];
    const contadorRef = doc(db, 'contadores_diarios', hoy);
    const contadorDoc = await getDoc(contadorRef);
    
    if (contadorDoc.exists()) {
      await updateDoc(contadorRef, {
        registros: increment(1)
      });
    } else {
      await setDoc(contadorRef, {
        fecha: hoy,
        visitas: 0,
        registros: 1,
        anuncios: 0,
        mensajes: 0,
        dispositivos: {},
        navegadores: {},
        paginas: {},
        paises: {},
        horas: {}
      });
    }
  } catch (error) {
    console.error('Error registrando usuario nuevo:', error);
  }
}

// ==================== OBTENER ESTADÍSTICAS ====================

export async function getEstadisticasRealTime(): Promise<EstadisticasRealTime> {
  const ahora = new Date();
  const hoy = ahora.toISOString().split('T')[0];
  const hace7Dias = new Date(ahora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000);
  const hace5Minutos = new Date(ahora.getTime() - 5 * 60 * 1000);

  try {
    // Visitas de hoy
    const visitasHoyRef = collection(db, 'visitas_web');
    const visitasHoyQuery = query(
      visitasHoyRef,
      where('fecha', '>=', Timestamp.fromDate(new Date(hoy))),
      orderBy('fecha', 'desc'),
      limit(100)
    );
    const visitasHoySnap = await getDocs(visitasHoyQuery);
    const visitasHoy = visitasHoySnap.size;
    
    // Visitantes activos (últimos 5 minutos)
    const activosQuery = query(
      visitasHoyRef,
      where('fecha', '>=', Timestamp.fromDate(hace5Minutos))
    );
    const activosSnap = await getDocs(activosQuery);
    const visitantesActivos = new Set(activosSnap.docs.map(d => d.data().sesionId)).size;

    // Contador del día
    const contadorRef = doc(db, 'contadores_diarios', hoy);
    const contadorDoc = await getDoc(contadorRef);
    const contadorData = contadorDoc.exists() ? contadorDoc.data() : null;

    // Registros de hoy
    const registrosHoyRef = collection(db, 'registros_usuarios');
    const registrosHoyQuery = query(
      registrosHoyRef,
      where('fecha', '>=', Timestamp.fromDate(new Date(hoy))),
      orderBy('fecha', 'desc'),
      limit(20)
    );
    const registrosHoySnap = await getDocs(registrosHoyQuery);
    
    // Calcular estadísticas de la semana
    const contadoresRef = collection(db, 'contadores_diarios');
    const semanaQuery = query(
      contadoresRef,
      where('fecha', '>=', hace7Dias.toISOString().split('T')[0]),
      orderBy('fecha', 'desc')
    );
    const semanaSnap = await getDocs(semanaQuery);
    let visitasSemana = 0;
    let registrosSemana = 0;
    semanaSnap.docs.forEach(doc => {
      const data = doc.data();
      visitasSemana += data.visitas || 0;
      registrosSemana += data.registros || 0;
    });

    // Calcular estadísticas del mes
    const mesQuery = query(
      contadoresRef,
      where('fecha', '>=', hace30Dias.toISOString().split('T')[0]),
      orderBy('fecha', 'desc')
    );
    const mesSnap = await getDocs(mesQuery);
    let visitasMes = 0;
    let registrosMes = 0;
    mesSnap.docs.forEach(doc => {
      const data = doc.data();
      visitasMes += data.visitas || 0;
      registrosMes += data.registros || 0;
    });

    // Procesar datos del día
    const dispositivos = contadorData?.dispositivos || {};
    const navegadores = contadorData?.navegadores || {};
    const paginas = contadorData?.paginas || {};
    const horas = contadorData?.horas || {};
    const paises = contadorData?.paises || {};

    // Formatear dispositivos
    const dispositivosHoy = Object.entries(dispositivos).map(([tipo, cantidad]) => ({
      tipo,
      cantidad: cantidad as number
    })).sort((a, b) => b.cantidad - a.cantidad);

    // Formatear navegadores
    const navegadoresHoy = Object.entries(navegadores).map(([navegador, cantidad]) => ({
      navegador,
      cantidad: cantidad as number
    })).sort((a, b) => b.cantidad - a.cantidad);

    // Formatear páginas más visitadas
    const paginasMasVisitadas = Object.entries(paginas).map(([pagina, visitas]) => ({
      pagina: pagina.replace(/_/g, '/'),
      visitas: visitas as number
    })).sort((a, b) => b.visitas - a.visitas).slice(0, 10);

    // Formatear horas pico
    const horasPico = Object.entries(horas).map(([hora, visitas]) => ({
      hora: parseInt(hora.replace('h', '')),
      visitas: visitas as number
    })).sort((a, b) => a.hora - b.hora);

    // Formatear países
    const paisesHoy = Object.entries(paises).map(([pais, cantidad]) => ({
      pais,
      cantidad: cantidad as number
    })).sort((a, b) => b.cantidad - a.cantidad).slice(0, 10);

    // Usuarios nuevos recientes
    const usuariosNuevosRecientes: RegistroUsuario[] = registrosHoySnap.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        nombre: data.nombre,
        fecha: data.fecha?.toDate() || new Date(),
        ip: data.ip,
        metodoRegistro: data.metodoRegistro || 'email',
        dispositivo: data.dispositivo,
        pais: data.pais
      };
    });

    // Visitas recientes
    const visitasRecientes: VisitaWeb[] = visitasHoySnap.docs.slice(0, 20).map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ip: data.ip,
        userAgent: data.userAgent,
        pagina: data.pagina,
        referrer: data.referrer,
        fecha: data.fecha?.toDate() || new Date(),
        dispositivo: data.dispositivo,
        navegador: data.navegador,
        sistemaOperativo: data.sistemaOperativo,
        usuarioId: data.usuarioId,
        sesionId: data.sesionId
      };
    });

    // Anuncios publicados hoy
    const anunciosRef = collection(db, 'anuncios');
    const anunciosHoyQuery = query(
      anunciosRef,
      where('fechaPublicacion', '>=', Timestamp.fromDate(new Date(hoy)))
    );
    const anunciosHoySnap = await getDocs(anunciosHoyQuery);

    // Mensajes de hoy
    const mensajesRef = collection(db, 'mensajes');
    const mensajesHoyQuery = query(
      mensajesRef,
      where('fecha', '>=', Timestamp.fromDate(new Date(hoy)))
    );
    const mensajesHoySnap = await getDocs(mensajesHoyQuery);

    return {
      visitantesActivos,
      visitasHoy,
      visitasSemana,
      visitasMes,
      registrosHoy: registrosHoySnap.size,
      registrosSemana,
      registrosMes,
      anunciosPublicadosHoy: anunciosHoySnap.size,
      mensajesHoy: mensajesHoySnap.size,
      paginasMasVisitadas,
      dispositivosHoy,
      navegadoresHoy,
      paisesHoy,
      horasPico,
      usuariosNuevosRecientes,
      visitasRecientes
    };
  } catch (error) {
    console.error('Error obteniendo estadísticas en tiempo real:', error);
    return {
      visitantesActivos: 0,
      visitasHoy: 0,
      visitasSemana: 0,
      visitasMes: 0,
      registrosHoy: 0,
      registrosSemana: 0,
      registrosMes: 0,
      anunciosPublicadosHoy: 0,
      mensajesHoy: 0,
      paginasMasVisitadas: [],
      dispositivosHoy: [],
      navegadoresHoy: [],
      paisesHoy: [],
      horasPico: [],
      usuariosNuevosRecientes: [],
      visitasRecientes: []
    };
  }
}

export async function getResumenStats(): Promise<StatsResumen> {
  try {
    // Total usuarios
    const usuariosRef = collection(db, 'usuarios');
    const usuariosSnap = await getDocs(usuariosRef);
    const totalUsuarios = usuariosSnap.size;

    // Total anuncios
    const anunciosRef = collection(db, 'anuncios');
    const anunciosSnap = await getDocs(anunciosRef);
    const totalAnuncios = anunciosSnap.size;

    // Total mensajes
    const mensajesRef = collection(db, 'mensajes');
    const mensajesSnap = await getDocs(mensajesRef);
    const totalMensajes = mensajesSnap.size;

    // Total visitas (últimos 30 días)
    const hace30Dias = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const contadoresRef = collection(db, 'contadores_diarios');
    const contadoresQuery = query(
      contadoresRef,
      where('fecha', '>=', hace30Dias.toISOString().split('T')[0])
    );
    const contadoresSnap = await getDocs(contadoresQuery);
    let totalVisitas = 0;
    let totalRegistros = 0;
    contadoresSnap.docs.forEach(doc => {
      const data = doc.data();
      totalVisitas += data.visitas || 0;
      totalRegistros += data.registros || 0;
    });

    const diasConDatos = contadoresSnap.size || 1;
    const promedioVisitasDiarias = Math.round(totalVisitas / diasConDatos);
    const tasaConversion = totalVisitas > 0 ? (totalRegistros / totalVisitas) * 100 : 0;

    return {
      totalUsuarios,
      totalAnuncios,
      totalMensajes,
      totalVisitas,
      promedioVisitasDiarias,
      tasaConversion: Math.round(tasaConversion * 100) / 100,
      tiempoPromedioSesion: 3.5 // TODO: Calcular real
    };
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    return {
      totalUsuarios: 0,
      totalAnuncios: 0,
      totalMensajes: 0,
      totalVisitas: 0,
      promedioVisitasDiarias: 0,
      tasaConversion: 0,
      tiempoPromedioSesion: 0
    };
  }
}

// ==================== HISTORIAL DE VISITAS ====================

export async function getHistorialVisitas(dias: number = 30): Promise<{ fecha: string; visitas: number; registros: number }[]> {
  try {
    const fechaInicio = new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
    const contadoresRef = collection(db, 'contadores_diarios');
    const q = query(
      contadoresRef,
      where('fecha', '>=', fechaInicio.toISOString().split('T')[0]),
      orderBy('fecha', 'asc')
    );
    const snap = await getDocs(q);
    
    return snap.docs.map(doc => {
      const data = doc.data();
      return {
        fecha: data.fecha,
        visitas: data.visitas || 0,
        registros: data.registros || 0
      };
    });
  } catch (error) {
    console.error('Error obteniendo historial:', error);
    return [];
  }
}

// ==================== LISTENER EN TIEMPO REAL ====================

export function suscribirseAEstadisticasRealTime(
  callback: (stats: EstadisticasRealTime) => void
): () => void {
  const hoy = new Date().toISOString().split('T')[0];
  const contadorRef = doc(db, 'contadores_diarios', hoy);
  
  const unsubscribe = onSnapshot(contadorRef, async () => {
    const stats = await getEstadisticasRealTime();
    callback(stats);
  });
  
  return unsubscribe;
}

// ==================== UTILIDADES ====================

export function detectarDispositivo(userAgent: string): 'mobile' | 'tablet' | 'desktop' {
  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    return 'mobile';
  }
  if (/tablet|ipad/i.test(ua)) {
    return 'tablet';
  }
  return 'desktop';
}

export function detectarNavegador(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'Firefox';
  if (ua.includes('edg')) return 'Edge';
  if (ua.includes('chrome')) return 'Chrome';
  if (ua.includes('safari')) return 'Safari';
  if (ua.includes('opera') || ua.includes('opr')) return 'Opera';
  return 'Otro';
}

export function detectarSO(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac')) return 'macOS';
  if (ua.includes('linux')) return 'Linux';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
  return 'Otro';
}

export function generarSesionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
}
