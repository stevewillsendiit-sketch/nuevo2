import { 
  doc, 
  getDoc, 
  setDoc,
  Timestamp,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  limit,
  increment,
} from 'firebase/firestore';
import { ref, deleteObject, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './firebase';

// Tipos de formato de anuncio
export type AdFormat = 'image' | 'video' | 'html' | 'adsense';

// Estados posibles de un anuncio
export type AdStatus = 'draft' | 'active' | 'paused' | 'expired' | 'deleted';

// Interface principal de Publicidad
export interface Publicidad {
  id: string;
  nombre: string;
  descripcion?: string;
  slot: AdSlot;
  formato: AdFormat;
  imagenUrl?: string;
  imagenMobile?: string;
  videoUrl?: string;
  htmlContent?: string;
  adsenseCode?: string;
  linkUrl?: string;
  linkTarget?: '_blank' | '_self';
  width?: number;
  height?: number;
  fechaInicio: Date;
  fechaFin?: Date;
  horariosActivos?: {
    dias: number[];
    horaInicio: string;
    horaFin: string;
  };
  segmentacion?: {
    categorias?: string[];
    paises?: string[];
    ubicaciones?: string[];
    dispositivos?: ('desktop' | 'tablet' | 'mobile')[];
  };
  estado: AdStatus;
  prioridad: number;
  peso: number;
  impresiones: number;
  clics: number;
  ctr: number;
  maxImpresiones?: number;
  maxClics?: number;
  presupuestoDiario?: number;
  creadoPor: string;
  fechaCreacion: Date;
  fechaActualizacion: Date;
  notas?: string;
  cliente?: {
    nombre: string;
    email?: string;
    telefono?: string;
    empresa?: string;
  };
  facturacion?: {
    precioPorImpresion?: number;
    precioPorClic?: number;
    precioFijo?: number;
    moneda: string;
  };
}

// Interface para crear/actualizar publicidad
export type PublicidadInput = Omit<Publicidad, 'id' | 'impresiones' | 'clics' | 'ctr' | 'fechaCreacion' | 'fechaActualizacion'>;

// Posiciones disponibles para publicidad
export type AdSlot = 
  | 'header_banner'      // Banner superior debajo del header
  | 'sidebar_top'        // Sidebar arriba
  | 'sidebar_bottom'     // Sidebar abajo
  | 'home_hero'          // Hero de la página principal
  | 'home_middle'        // Mitad de la página principal
  | 'search_top'         // Arriba de resultados de búsqueda
  | 'search_sidebar'     // Sidebar en búsqueda
  | 'detail_top'         // Arriba en detalle de anuncio
  | 'detail_sidebar'     // Sidebar en detalle de anuncio
  | 'footer_banner'      // Banner en footer
  | 'popup'              // Modal emergente
  | 'interstitial';      // Pantalla completa entre páginas

// Configuración de una posición de publicidad
export interface AdSlotConfig {
  slot: AdSlot;
  nombre: string;
  descripcion: string;
  adsenseCode: string;        // Código de Google AdSense
  activo: boolean;
  fechaActualizacion?: Date;
}

// Configuración global de publicidad
export interface PublicidadConfig {
  id: string;                 // siempre "config"
  adsensePublisherId: string; // ID del publisher (ca-pub-XXXX)
  slots: AdSlotConfig[];
  fechaActualizacion: Date;
}

// Lista de slots disponibles con info
export const SLOTS_INFO: { slot: AdSlot; nombre: string; descripcion: string }[] = [
  { slot: 'header_banner', nombre: 'Banner Header', descripcion: 'Banner horizontal debajo del header' },
  { slot: 'sidebar_top', nombre: 'Sidebar Superior', descripcion: 'Anuncio en la parte superior del sidebar' },
  { slot: 'sidebar_bottom', nombre: 'Sidebar Inferior', descripcion: 'Anuncio en la parte inferior del sidebar' },
  { slot: 'home_hero', nombre: 'Home Hero', descripcion: 'Anuncio grande en la página principal' },
  { slot: 'home_middle', nombre: 'Home Mitad', descripcion: 'Anuncio en medio de la página principal' },
  { slot: 'search_top', nombre: 'Búsqueda Superior', descripcion: 'Arriba de los resultados de búsqueda' },
  { slot: 'search_sidebar', nombre: 'Búsqueda Sidebar', descripcion: 'Sidebar en página de búsqueda' },
  { slot: 'detail_top', nombre: 'Detalle Superior', descripcion: 'Arriba en página de detalle' },
  { slot: 'detail_sidebar', nombre: 'Detalle Sidebar', descripcion: 'Sidebar en página de detalle' },
  { slot: 'footer_banner', nombre: 'Banner Footer', descripcion: 'Banner horizontal en el footer' },
];

// ============================================
// FUNCIONES DEL SERVICIO
// ============================================

/**
 * Obtiene la configuración de publicidad
 */
export async function getPublicidadConfig(): Promise<PublicidadConfig | null> {
  try {
    // Usar colección 'configuracion' que ya debería tener permisos
    const docRef = doc(db, 'configuracion', 'publicidad');
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return null;
    }
    
    const data = docSnap.data();
    return {
      id: 'publicidad',
      adsensePublisherId: data.adsensePublisherId || '',
      slots: (data.slots || []).map((s: Record<string, unknown>) => ({
        ...s,
        fechaActualizacion: s.fechaActualizacion instanceof Timestamp 
          ? s.fechaActualizacion.toDate() 
          : undefined,
      })),
      fechaActualizacion: data.fechaActualizacion instanceof Timestamp 
        ? data.fechaActualizacion.toDate() 
        : new Date(),
    };
  } catch (error) {
    console.error('Error obteniendo config de publicidad:', error);
    return null;
  }
}

/**
 * Guarda la configuración de publicidad
 */
export async function savePublicidadConfig(config: Omit<PublicidadConfig, 'id' | 'fechaActualizacion'>): Promise<void> {
  try {
    // Usar colección 'configuracion' que ya debería tener permisos
    const docRef = doc(db, 'configuracion', 'publicidad');
    
    // Limpiar slots para evitar valores undefined que Firestore no acepta
    const cleanSlots = (config.slots || []).map(slot => ({
      slot: slot.slot || '',
      nombre: slot.nombre || '',
      descripcion: slot.descripcion || '',
      adsenseCode: slot.adsenseCode || '',
      activo: slot.activo === true,
    }));
    
    await setDoc(docRef, {
      adsensePublisherId: config.adsensePublisherId || '',
      slots: cleanSlots,
      fechaActualizacion: new Date().toISOString(),
    }, { merge: true });
  } catch (error) {
    console.error('Error guardando config de publicidad:', error);
    throw error;
  }
}

/**
 * Obtiene el código AdSense para un slot específico
 */
export async function getAdCodeForSlot(slot: AdSlot): Promise<string | null> {
  try {
    const config = await getPublicidadConfig();
    if (!config) return null;
    
    const slotConfig = config.slots.find(s => s.slot === slot && s.activo);
    return slotConfig?.adsenseCode || null;
  } catch (error) {
    console.error('Error obteniendo código de ad:', error);
    return null;
  }
}

/**
 * Actualiza un slot específico
 */
export async function updateSlotConfig(slot: AdSlot, adsenseCode: string, activo: boolean): Promise<void> {
  try {
    const config = await getPublicidadConfig();
    const slotInfo = SLOTS_INFO.find(s => s.slot === slot);
    
    const newSlotConfig: AdSlotConfig = {
      slot,
      nombre: slotInfo?.nombre || slot,
      descripcion: slotInfo?.descripcion || '',
      adsenseCode,
      activo,
      fechaActualizacion: new Date(),
    };
    
    if (config) {
      // Actualizar slot existente o agregar nuevo
      const existingIndex = config.slots.findIndex(s => s.slot === slot);
      if (existingIndex >= 0) {
        config.slots[existingIndex] = newSlotConfig;
      } else {
        config.slots.push(newSlotConfig);
      }
      
      await savePublicidadConfig({
        adsensePublisherId: config.adsensePublisherId,
        slots: config.slots,
      });
    } else {
      // Crear nueva config
      await savePublicidadConfig({
        adsensePublisherId: '',
        slots: [newSlotConfig],
      });
    }
  } catch (error) {
    console.error('Error actualizando slot:', error);
    throw error;
  }
}

// Interface para estadísticas agregadas
export interface EstadisticasPublicidad {
  totalAnuncios: number;
  anunciosActivos: number;
  anunciosPausados: number;
  anunciosExpirados: number;
  totalImpresiones: number;
  totalClics: number;
  ctrPromedio: number;
  ingresosTotales: number;
  ingresosMes: number;
  topAnuncios: {
    id: string;
    nombre: string;
    impresiones: number;
    clics: number;
    ctr: number;
  }[];
  impresionesHoy: number;
  clicsHoy: number;
}

// Interface para log de eventos
export interface AdEvent {
  id: string;
  publicidadId: string;
  tipo: 'impression' | 'click';
  timestamp: Date;
  userAgent?: string;
  ip?: string;
  referer?: string;
  pagina?: string;
  dispositivo?: 'desktop' | 'tablet' | 'mobile';
}

const COLLECTION = 'publicidad';
const EVENTS_COLLECTION = 'publicidad_eventos';
const STATS_COLLECTION = 'publicidad_stats_diarias';

// Convertir documento de Firestore a Publicidad
function docToPublicidad(docData: DocumentData, id: string): Publicidad {
  return {
    id,
    nombre: docData.nombre || '',
    descripcion: docData.descripcion,
    slot: docData.slot || 'sidebar_top',
    formato: docData.formato || 'image',
    imagenUrl: docData.imagenUrl,
    imagenMobile: docData.imagenMobile,
    videoUrl: docData.videoUrl,
    htmlContent: docData.htmlContent,
    adsenseCode: docData.adsenseCode,
    linkUrl: docData.linkUrl,
    linkTarget: docData.linkTarget || '_blank',
    width: docData.width,
    height: docData.height,
    fechaInicio: docData.fechaInicio?.toDate?.() || new Date(),
    fechaFin: docData.fechaFin?.toDate?.(),
    horariosActivos: docData.horariosActivos,
    segmentacion: docData.segmentacion,
    estado: docData.estado || 'draft',
    prioridad: docData.prioridad || 50,
    peso: docData.peso || 1,
    impresiones: docData.impresiones || 0,
    clics: docData.clics || 0,
    ctr: docData.ctr || 0,
    maxImpresiones: docData.maxImpresiones,
    maxClics: docData.maxClics,
    presupuestoDiario: docData.presupuestoDiario,
    creadoPor: docData.creadoPor || '',
    fechaCreacion: docData.fechaCreacion?.toDate?.() || new Date(),
    fechaActualizacion: docData.fechaActualizacion?.toDate?.() || new Date(),
    notas: docData.notas,
    cliente: docData.cliente,
    facturacion: docData.facturacion,
  };
}

// ==================== CRUD ====================

// Obtener todas las publicidades
export async function getAllPublicidad(): Promise<Publicidad[]> {
  const q = query(
    collection(db, COLLECTION),
    orderBy('fechaCreacion', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => docToPublicidad(doc.data(), doc.id));
}

// Obtener publicidad por ID
export async function getPublicidadById(id: string): Promise<Publicidad | null> {
  const docRef = doc(db, COLLECTION, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return null;
  return docToPublicidad(docSnap.data(), docSnap.id);
}

// Obtener publicidades activas para un slot específico
export async function getPublicidadActiva(
  slot: AdSlot, 
  options?: {
    categoria?: string;
    ubicacion?: string;
    dispositivo?: 'desktop' | 'tablet' | 'mobile';
  }
): Promise<Publicidad[]> {
  const ahora = new Date();
  
  const q = query(
    collection(db, COLLECTION),
    where('slot', '==', slot),
    where('estado', '==', 'active'),
    orderBy('prioridad', 'desc'),
    limit(10)
  );
  
  const snapshot = await getDocs(q);
  let publicidades = snapshot.docs.map(doc => docToPublicidad(doc.data(), doc.id));
  
  // Filtrar por fecha
  publicidades = publicidades.filter(pub => {
    const inicioValido = pub.fechaInicio <= ahora;
    const finValido = !pub.fechaFin || pub.fechaFin >= ahora;
    return inicioValido && finValido;
  });
  
  // Filtrar por límites
  publicidades = publicidades.filter(pub => {
    if (pub.maxImpresiones && pub.impresiones >= pub.maxImpresiones) return false;
    if (pub.maxClics && pub.clics >= pub.maxClics) return false;
    return true;
  });
  
  // Filtrar por segmentación
  if (options) {
    publicidades = publicidades.filter(pub => {
      if (!pub.segmentacion) return true;
      
      if (options.categoria && pub.segmentacion.categorias?.length) {
        if (!pub.segmentacion.categorias.includes(options.categoria)) return false;
      }
      
      if (options.ubicacion && pub.segmentacion.ubicaciones?.length) {
        if (!pub.segmentacion.ubicaciones.includes(options.ubicacion)) return false;
      }
      
      if (options.dispositivo && pub.segmentacion.dispositivos?.length) {
        if (!pub.segmentacion.dispositivos.includes(options.dispositivo)) return false;
      }
      
      return true;
    });
  }
  
  return publicidades;
}

// Seleccionar publicidad aleatoria ponderada por peso
export async function getPublicidadRandom(
  slot: AdSlot,
  options?: {
    categoria?: string;
    ubicacion?: string;
    dispositivo?: 'desktop' | 'tablet' | 'mobile';
  }
): Promise<Publicidad | null> {
  const publicidades = await getPublicidadActiva(slot, options);
  if (publicidades.length === 0) return null;
  
  // Selección ponderada por peso
  const totalPeso = publicidades.reduce((sum, p) => sum + p.peso, 0);
  let random = Math.random() * totalPeso;
  
  for (const pub of publicidades) {
    random -= pub.peso;
    if (random <= 0) return pub;
  }
  
  return publicidades[0];
}

// Crear nueva publicidad
export async function crearPublicidad(
  data: PublicidadInput, 
  creadoPor: string
): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    fechaInicio: Timestamp.fromDate(data.fechaInicio),
    fechaFin: data.fechaFin ? Timestamp.fromDate(data.fechaFin) : null,
    impresiones: 0,
    clics: 0,
    ctr: 0,
    creadoPor,
    fechaCreacion: serverTimestamp(),
    fechaActualizacion: serverTimestamp(),
  });
  
  return docRef.id;
}

// Actualizar publicidad
export async function actualizarPublicidad(
  id: string, 
  data: Partial<PublicidadInput>
): Promise<void> {
  const docRef = doc(db, COLLECTION, id);
  
  const updateData: Record<string, unknown> = {
    ...data,
    fechaActualizacion: serverTimestamp(),
  };
  
  if (data.fechaInicio) {
    updateData.fechaInicio = Timestamp.fromDate(data.fechaInicio);
  }
  if (data.fechaFin) {
    updateData.fechaFin = Timestamp.fromDate(data.fechaFin);
  }
  
  await updateDoc(docRef, updateData);
}

// Eliminar publicidad
export async function eliminarPublicidad(id: string): Promise<void> {
  const pub = await getPublicidadById(id);
  
  // Eliminar imagen del storage si existe
  if (pub?.imagenUrl && pub.imagenUrl.includes('firebase')) {
    try {
      const imageRef = ref(storage, pub.imagenUrl);
      await deleteObject(imageRef);
    } catch (e) {
      console.error('Error eliminando imagen:', e);
    }
  }
  
  await deleteDoc(doc(db, COLLECTION, id));
}

// Pausar publicidad
export async function pausarPublicidad(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    estado: 'paused',
    fechaActualizacion: serverTimestamp(),
  });
}

// Activar publicidad
export async function activarPublicidad(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    estado: 'active',
    fechaActualizacion: serverTimestamp(),
  });
}

// Duplicar publicidad
export async function duplicarPublicidad(id: string, creadoPor: string): Promise<string> {
  const pub = await getPublicidadById(id);
  if (!pub) throw new Error('Publicidad no encontrada');
  
  const newData: PublicidadInput = {
    nombre: `${pub.nombre} (copia)`,
    descripcion: pub.descripcion,
    slot: pub.slot,
    formato: pub.formato,
    imagenUrl: pub.imagenUrl,
    imagenMobile: pub.imagenMobile,
    videoUrl: pub.videoUrl,
    htmlContent: pub.htmlContent,
    adsenseCode: pub.adsenseCode,
    linkUrl: pub.linkUrl,
    linkTarget: pub.linkTarget,
    width: pub.width,
    height: pub.height,
    fechaInicio: new Date(),
    fechaFin: pub.fechaFin,
    horariosActivos: pub.horariosActivos,
    segmentacion: pub.segmentacion,
    estado: 'draft',
    prioridad: pub.prioridad,
    peso: pub.peso,
    maxImpresiones: pub.maxImpresiones,
    maxClics: pub.maxClics,
    presupuestoDiario: pub.presupuestoDiario,
    notas: pub.notas,
    cliente: pub.cliente,
    facturacion: pub.facturacion,
    creadoPor: creadoPor,
  };
  
  return crearPublicidad(newData, creadoPor);
}

// ==================== EVENTOS Y ESTADÍSTICAS ====================

// Registrar impresión
export async function registrarImpresion(
  publicidadId: string,
  metadata?: {
    userAgent?: string;
    referer?: string;
    pagina?: string;
    dispositivo?: 'desktop' | 'tablet' | 'mobile';
  }
): Promise<void> {
  // Incrementar contador en publicidad
  await updateDoc(doc(db, COLLECTION, publicidadId), {
    impresiones: increment(1),
    fechaActualizacion: serverTimestamp(),
  });
  
  // Registrar evento
  await addDoc(collection(db, EVENTS_COLLECTION), {
    publicidadId,
    tipo: 'impression',
    timestamp: serverTimestamp(),
    ...metadata,
  });
  
  // Actualizar stats diarias
  const hoy = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, STATS_COLLECTION, `${publicidadId}_${hoy}`);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    await updateDoc(statsRef, {
      impresiones: increment(1),
    });
  } else {
    await addDoc(collection(db, STATS_COLLECTION), {
      publicidadId,
      fecha: hoy,
      impresiones: 1,
      clics: 0,
    });
  }
  
  // Actualizar CTR
  await actualizarCTR(publicidadId);
}

// Registrar clic
export async function registrarClic(
  publicidadId: string,
  metadata?: {
    userAgent?: string;
    referer?: string;
    pagina?: string;
    dispositivo?: 'desktop' | 'tablet' | 'mobile';
  }
): Promise<void> {
  // Incrementar contador en publicidad
  await updateDoc(doc(db, COLLECTION, publicidadId), {
    clics: increment(1),
    fechaActualizacion: serverTimestamp(),
  });
  
  // Registrar evento
  await addDoc(collection(db, EVENTS_COLLECTION), {
    publicidadId,
    tipo: 'click',
    timestamp: serverTimestamp(),
    ...metadata,
  });
  
  // Actualizar stats diarias
  const hoy = new Date().toISOString().split('T')[0];
  const statsRef = doc(db, STATS_COLLECTION, `${publicidadId}_${hoy}`);
  const statsSnap = await getDoc(statsRef);
  
  if (statsSnap.exists()) {
    await updateDoc(statsRef, {
      clics: increment(1),
    });
  } else {
    await addDoc(collection(db, STATS_COLLECTION), {
      publicidadId,
      fecha: hoy,
      impresiones: 0,
      clics: 1,
    });
  }
  
  // Actualizar CTR
  await actualizarCTR(publicidadId);
}

// Actualizar CTR
async function actualizarCTR(publicidadId: string): Promise<void> {
  const pub = await getPublicidadById(publicidadId);
  if (!pub) return;
  
  const ctr = pub.impresiones > 0 
    ? (pub.clics / pub.impresiones) * 100 
    : 0;
  
  await updateDoc(doc(db, COLLECTION, publicidadId), {
    ctr: Math.round(ctr * 100) / 100,
  });
}

// Obtener estadísticas generales
export async function getEstadisticasPublicidad(): Promise<EstadisticasPublicidad> {
  const publicidades = await getAllPublicidad();
  
  const activas = publicidades.filter(p => p.estado === 'active');
  const pausadas = publicidades.filter(p => p.estado === 'paused');
  const expiradas = publicidades.filter(p => p.estado === 'expired');
  
  const totalImpresiones = publicidades.reduce((sum, p) => sum + p.impresiones, 0);
  const totalClics = publicidades.reduce((sum, p) => sum + p.clics, 0);
  const ctrPromedio = totalImpresiones > 0 
    ? (totalClics / totalImpresiones) * 100 
    : 0;
  
  // Calcular ingresos
  let ingresosTotales = 0;
  publicidades.forEach(p => {
    if (p.facturacion) {
      if (p.facturacion.precioPorImpresion) {
        ingresosTotales += (p.impresiones / 1000) * p.facturacion.precioPorImpresion;
      }
      if (p.facturacion.precioPorClic) {
        ingresosTotales += p.clics * p.facturacion.precioPorClic;
      }
      if (p.facturacion.precioFijo) {
        ingresosTotales += p.facturacion.precioFijo;
      }
    }
  });
  
  // Top anuncios por CTR
  const topAnuncios = [...publicidades]
    .filter(p => p.impresiones >= 100)
    .sort((a, b) => b.ctr - a.ctr)
    .slice(0, 5)
    .map(p => ({
      id: p.id,
      nombre: p.nombre,
      impresiones: p.impresiones,
      clics: p.clics,
      ctr: p.ctr,
    }));
  
  // Stats de hoy
  const hoy = new Date().toISOString().split('T')[0];
  const statsHoy = await getDocs(
    query(
      collection(db, STATS_COLLECTION),
      where('fecha', '==', hoy)
    )
  );
  
  let impresionesHoy = 0;
  let clicsHoy = 0;
  statsHoy.forEach(doc => {
    const data = doc.data();
    impresionesHoy += data.impresiones || 0;
    clicsHoy += data.clics || 0;
  });
  
  return {
    totalAnuncios: publicidades.length,
    anunciosActivos: activas.length,
    anunciosPausados: pausadas.length,
    anunciosExpirados: expiradas.length,
    totalImpresiones,
    totalClics,
    ctrPromedio: Math.round(ctrPromedio * 100) / 100,
    ingresosTotales: Math.round(ingresosTotales * 100) / 100,
    ingresosMes: 0, // TODO: calcular por mes
    topAnuncios,
    impresionesHoy,
    clicsHoy,
  };
}

// ==================== UPLOAD DE IMÁGENES ====================

export async function uploadImagenPublicidad(
  file: File, 
  publicidadId: string,
  tipo: 'desktop' | 'mobile' = 'desktop'
): Promise<string> {
  const extension = file.name.split('.').pop();
  const filename = `publicidad/${publicidadId}/${tipo}_${Date.now()}.${extension}`;
  const storageRef = ref(storage, filename);
  
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  
  // Actualizar URL en publicidad
  const campo = tipo === 'desktop' ? 'imagenUrl' : 'imagenMobile';
  await updateDoc(doc(db, COLLECTION, publicidadId), {
    [campo]: url,
    fechaActualizacion: serverTimestamp(),
  });
  
  return url;
}

// ==================== UTILIDADES ====================

// Verificar y actualizar estados expirados
export async function verificarExpiraciones(): Promise<number> {
  const ahora = new Date();
  const q = query(
    collection(db, COLLECTION),
    where('estado', '==', 'active')
  );
  
  const snapshot = await getDocs(q);
  let actualizadas = 0;
  
  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const fechaFin = data.fechaFin?.toDate?.();
    
    if (fechaFin && fechaFin < ahora) {
      await updateDoc(doc(db, COLLECTION, docSnap.id), {
        estado: 'expired',
        fechaActualizacion: serverTimestamp(),
      });
      actualizadas++;
    }
    
    // Verificar límites
    if (data.maxImpresiones && data.impresiones >= data.maxImpresiones) {
      await updateDoc(doc(db, COLLECTION, docSnap.id), {
        estado: 'paused',
        fechaActualizacion: serverTimestamp(),
      });
      actualizadas++;
    }
    
    if (data.maxClics && data.clics >= data.maxClics) {
      await updateDoc(doc(db, COLLECTION, docSnap.id), {
        estado: 'paused',
        fechaActualizacion: serverTimestamp(),
      });
      actualizadas++;
    }
  }
  
  return actualizadas;
}

// Obtener slots disponibles con descripción
export function getSlotsDisponibles(): { value: AdSlot; label: string; descripcion: string; dimensiones: string }[] {
  return [
    { value: 'header_banner', label: 'Banner Header', descripcion: 'Banner superior en todas las páginas', dimensiones: '728x90 / 970x90' },
    { value: 'sidebar_top', label: 'Sidebar Superior', descripcion: 'Parte superior del sidebar', dimensiones: '300x250' },
    { value: 'sidebar_bottom', label: 'Sidebar Inferior', descripcion: 'Parte inferior del sidebar', dimensiones: '300x600' },
    { value: 'home_hero', label: 'Hero Principal', descripcion: 'Banner grande en página principal', dimensiones: '1200x400' },
    { value: 'home_middle', label: 'Home Medio', descripcion: 'Entre secciones de la página principal', dimensiones: '728x90' },
    { value: 'search_top', label: 'Búsqueda Superior', descripcion: 'Arriba de resultados de búsqueda', dimensiones: '728x90' },
    { value: 'search_sidebar', label: 'Búsqueda Sidebar', descripcion: 'Sidebar en página de búsqueda', dimensiones: '300x250' },
    { value: 'detail_sidebar', label: 'Detalle Sidebar', descripcion: 'Sidebar en detalle de anuncio', dimensiones: '300x250' },
    { value: 'footer_banner', label: 'Banner Footer', descripcion: 'Banner en el footer', dimensiones: '728x90' },
    { value: 'popup', label: 'Popup', descripcion: 'Modal emergente', dimensiones: '600x400' },
    { value: 'interstitial', label: 'Interstitial', descripcion: 'Pantalla completa entre páginas', dimensiones: '1920x1080' },
  ];
}
