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
  deleteDoc,
  setDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ============================================
// TIPOS
// ============================================

export interface CodigoDescuento {
  id?: string;
  codigo: string;
  tipo: 'porcentaje' | 'fijo'; // 20% o 5€
  valor: number;
  descripcion: string;
  aplicaA: 'todo' | 'promociones' | 'recargas'; // Donde se puede usar
  usosMaximos: number;
  usosActuales: number;
  fechaInicio: Date | Timestamp;
  fechaFin: Date | Timestamp;
  activo: boolean;
  creadoPor: string;
  fechaCreacion: Date | Timestamp;
}

export interface ConfiguracionPromociones {
  // Precios base de promociones
  precioVIP: number;
  precioPremium: number;
  precioDestacado: number;
  // Descuento global activo (0 = sin descuento)
  descuentoGlobalPorcentaje: number;
  descuentoGlobalActivo: boolean;
  // Mensaje promocional
  mensajePromo: string;
  mensajePromoActivo: boolean;
}

export interface HistorialCreditos {
  id?: string;
  usuarioId: string;
  tipo: 'recarga' | 'regalo_admin' | 'uso' | 'reembolso';
  cantidad: number;
  saldoAnterior: number;
  saldoNuevo: number;
  descripcion: string;
  fecha: Date | Timestamp;
  adminId?: string;
}

// ============================================
// CONFIGURACIÓN DE PROMOCIONES
// ============================================

const CONFIG_DOC_ID = 'promociones_config';

export async function getConfiguracionPromociones(): Promise<ConfiguracionPromociones> {
  try {
    const docRef = doc(db, 'configuracion', CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as ConfiguracionPromociones;
    }
    
    // Valores por defecto
    return {
      precioVIP: 10,
      precioPremium: 5,
      precioDestacado: 2,
      descuentoGlobalPorcentaje: 0,
      descuentoGlobalActivo: false,
      mensajePromo: '',
      mensajePromoActivo: false,
    };
  } catch (error) {
    console.error('Error getting promociones config:', error);
    return {
      precioVIP: 10,
      precioPremium: 5,
      precioDestacado: 2,
      descuentoGlobalPorcentaje: 0,
      descuentoGlobalActivo: false,
      mensajePromo: '',
      mensajePromoActivo: false,
    };
  }
}

export async function updateConfiguracionPromociones(
  config: Partial<ConfiguracionPromociones>
): Promise<boolean> {
  try {
    const docRef = doc(db, 'configuracion', CONFIG_DOC_ID);
    const existingDoc = await getDoc(docRef);
    
    if (existingDoc.exists()) {
      await updateDoc(docRef, config);
    } else {
      await setDoc(docRef, {
        precioVIP: 10,
        precioPremium: 5,
        precioDestacado: 2,
        descuentoGlobalPorcentaje: 0,
        descuentoGlobalActivo: false,
        mensajePromo: '',
        mensajePromoActivo: false,
        ...config,
      });
    }
    return true;
  } catch (error) {
    console.error('Error updating promociones config:', error);
    return false;
  }
}

// Calcular precio con descuento
export function calcularPrecioConDescuento(
  precioBase: number,
  config: ConfiguracionPromociones,
  codigoDescuento?: CodigoDescuento
): { precioFinal: number; descuentoAplicado: number; tieneDescuento: boolean } {
  let precioFinal = precioBase;
  let descuentoTotal = 0;
  
  // Aplicar descuento global si está activo
  if (config.descuentoGlobalActivo && config.descuentoGlobalPorcentaje > 0) {
    const descuento = precioBase * (config.descuentoGlobalPorcentaje / 100);
    precioFinal -= descuento;
    descuentoTotal += descuento;
  }
  
  // Aplicar código de descuento si existe
  if (codigoDescuento && codigoDescuento.activo) {
    if (codigoDescuento.tipo === 'porcentaje') {
      const descuento = precioFinal * (codigoDescuento.valor / 100);
      precioFinal -= descuento;
      descuentoTotal += descuento;
    } else {
      precioFinal -= codigoDescuento.valor;
      descuentoTotal += codigoDescuento.valor;
    }
  }
  
  // No permitir precios negativos
  precioFinal = Math.max(0, precioFinal);
  
  return {
    precioFinal: Math.round(precioFinal * 100) / 100,
    descuentoAplicado: Math.round(descuentoTotal * 100) / 100,
    tieneDescuento: descuentoTotal > 0,
  };
}

// ============================================
// CÓDIGOS DE DESCUENTO
// ============================================

export async function crearCodigoDescuento(codigo: Omit<CodigoDescuento, 'id' | 'fechaCreacion' | 'usosActuales'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'codigos_descuento'), {
      ...codigo,
      usosActuales: 0,
      fechaCreacion: Timestamp.now(),
      fechaInicio: codigo.fechaInicio instanceof Date ? Timestamp.fromDate(codigo.fechaInicio) : codigo.fechaInicio,
      fechaFin: codigo.fechaFin instanceof Date ? Timestamp.fromDate(codigo.fechaFin) : codigo.fechaFin,
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating discount code:', error);
    throw error;
  }
}

export async function getCodigosDescuento(): Promise<CodigoDescuento[]> {
  try {
    const q = query(collection(db, 'codigos_descuento'), orderBy('fechaCreacion', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fechaCreacion: doc.data().fechaCreacion?.toDate() || new Date(),
      fechaInicio: doc.data().fechaInicio?.toDate() || new Date(),
      fechaFin: doc.data().fechaFin?.toDate() || new Date(),
    })) as CodigoDescuento[];
  } catch (error) {
    console.error('Error getting discount codes:', error);
    return [];
  }
}

export async function validarCodigoDescuento(codigo: string): Promise<CodigoDescuento | null> {
  try {
    const q = query(
      collection(db, 'codigos_descuento'),
      where('codigo', '==', codigo.toUpperCase()),
      where('activo', '==', true)
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    const data = doc.data();
    const now = new Date();
    const fechaInicio = data.fechaInicio?.toDate() || new Date();
    const fechaFin = data.fechaFin?.toDate() || new Date();
    
    // Verificar fechas
    if (now < fechaInicio || now > fechaFin) return null;
    
    // Verificar usos
    if (data.usosMaximos > 0 && data.usosActuales >= data.usosMaximos) return null;
    
    return {
      id: doc.id,
      ...data,
      fechaCreacion: data.fechaCreacion?.toDate() || new Date(),
      fechaInicio,
      fechaFin,
    } as CodigoDescuento;
  } catch (error) {
    console.error('Error validating discount code:', error);
    return null;
  }
}

export async function usarCodigoDescuento(codigoId: string): Promise<boolean> {
  try {
    const docRef = doc(db, 'codigos_descuento', codigoId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return false;
    
    const data = docSnap.data();
    await updateDoc(docRef, {
      usosActuales: (data.usosActuales || 0) + 1,
    });
    
    return true;
  } catch (error) {
    console.error('Error using discount code:', error);
    return false;
  }
}

export async function toggleCodigoDescuento(codigoId: string, activo: boolean): Promise<boolean> {
  try {
    await updateDoc(doc(db, 'codigos_descuento', codigoId), { activo });
    return true;
  } catch (error) {
    console.error('Error toggling discount code:', error);
    return false;
  }
}

export async function eliminarCodigoDescuento(codigoId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'codigos_descuento', codigoId));
    return true;
  } catch (error) {
    console.error('Error deleting discount code:', error);
    return false;
  }
}

// ============================================
// CRÉDITOS MASIVOS
// ============================================

export async function darCreditosATodos(
  cantidad: number,
  motivo: string,
  adminId: string,
  usuariosIds: string[]
): Promise<{ exitosos: number; fallidos: number }> {
  let exitosos = 0;
  let fallidos = 0;
  
  const batch = writeBatch(db);
  
  for (const usuarioId of usuariosIds) {
    try {
      const creditosRef = doc(db, 'creditos_usuarios', usuarioId);
      const creditosSnap = await getDoc(creditosRef);
      
      const saldoActual = creditosSnap.exists() ? (creditosSnap.data().saldo || 0) : 0;
      const nuevoSaldo = saldoActual + cantidad;
      
      if (creditosSnap.exists()) {
        batch.update(creditosRef, { saldo: nuevoSaldo });
      } else {
        batch.set(creditosRef, {
          usuarioId,
          saldo: nuevoSaldo,
          ultimoReclamo: null,
          totalReclamado: 0,
        });
      }
      
      // Registrar en historial
      const historialRef = doc(collection(db, 'historial_creditos'));
      batch.set(historialRef, {
        usuarioId,
        tipo: 'regalo_admin',
        cantidad,
        saldoAnterior: saldoActual,
        saldoNuevo: nuevoSaldo,
        descripcion: motivo,
        fecha: Timestamp.now(),
        adminId,
      });
      
      exitosos++;
    } catch {
      fallidos++;
    }
  }
  
  try {
    await batch.commit();
  } catch (error) {
    console.error('Error committing batch:', error);
  }
  
  return { exitosos, fallidos };
}

// ============================================
// HISTORIAL
// ============================================

export async function getHistorialCreditos(usuarioId: string): Promise<HistorialCreditos[]> {
  try {
    const q = query(
      collection(db, 'historial_creditos'),
      where('usuarioId', '==', usuarioId),
      orderBy('fecha', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      fecha: doc.data().fecha?.toDate() || new Date(),
    })) as HistorialCreditos[];
  } catch (error) {
    console.error('Error getting credit history:', error);
    return [];
  }
}
