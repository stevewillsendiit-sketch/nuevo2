import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface Plan {
  id: string;
  userId: string;
  tipo: string;
  anunciosDisponibles: number;
  anunciosUsados: number;
  totalAnuncios: number;
  precio: number;
  totalInvertido: number;
  diasDuracion: number;
  fechaCompra: string;
  fechaExpiracion: string;
  // Campos adicionales para tracking
  diasBonificados?: number; // Días añadidos del plan anterior
  anunciosBonificados?: number; // Anuncios añadidos del plan anterior
}

// Obtener planes de un usuario
export async function getPlanesUsuario(userId: string): Promise<Plan[]> {
  try {
    const q = query(collection(db, 'planes'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    
    const planes: Plan[] = [];
    querySnapshot.forEach((doc) => {
      planes.push({ id: doc.id, ...doc.data() } as Plan);
    });
    
    return planes;
  } catch (error) {
    console.error('Error al obtener planes:', error);
    return [];
  }
}

// Obtener el plan activo de un usuario (el más reciente que no ha expirado)
export async function getPlanActivoUsuario(userId: string): Promise<Plan | null> {
  try {
    const planes = await getPlanesUsuario(userId);
    const hoy = new Date();
    
    // Filtrar planes activos (no expirados y con anuncios disponibles)
    const planesActivos = planes.filter(plan => {
      const fechaExp = new Date(plan.fechaExpiracion);
      return fechaExp >= hoy && plan.anunciosDisponibles > 0;
    });
    
    if (planesActivos.length === 0) return null;
    
    // Retornar el plan con fecha de expiración más lejana
    return planesActivos.sort((a, b) => 
      new Date(b.fechaExpiracion).getTime() - new Date(a.fechaExpiracion).getTime()
    )[0];
  } catch (error) {
    console.error('Error al obtener plan activo:', error);
    return null;
  }
}

// Calcular días restantes de un plan
export function calcularDiasRestantes(fechaExpiracion: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fechaExp = new Date(fechaExpiracion);
  fechaExp.setHours(0, 0, 0, 0);
  
  const diferencia = fechaExp.getTime() - hoy.getTime();
  const diasRestantes = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diasRestantes);
}

// Crear un nuevo plan (sumando días y anuncios restantes del plan anterior)
export async function crearPlan(plan: Omit<Plan, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'planes'), plan);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear plan:', error);
    throw error;
  }
}

// Crear un nuevo plan CON BONIFICACIÓN de días y anuncios del plan anterior
export async function crearPlanConBonificacion(
  userId: string,
  nuevoPlan: {
    tipo: string;
    anunciosTotal: number;
    precio: number;
    diasDuracion: number;
  }
): Promise<{ planId: string; diasBonificados: number; anunciosBonificados: number }> {
  try {
    const hoy = new Date();
    let diasBonificados = 0;
    let anunciosBonificados = 0;
    
    // 1. Buscar plan activo del usuario
    const planActivo = await getPlanActivoUsuario(userId);
    
    if (planActivo) {
      // 2. Calcular días restantes del plan anterior
      diasBonificados = calcularDiasRestantes(planActivo.fechaExpiracion);
      
      // 3. Calcular anuncios restantes del plan anterior
      anunciosBonificados = planActivo.anunciosDisponibles;
      
      // 4. Marcar el plan anterior como migrado/expirado
      await actualizarPlan(planActivo.id, {
        anunciosDisponibles: 0,
        fechaExpiracion: hoy.toISOString(), // Expirar inmediatamente
      });
    }
    
    // 5. Calcular fecha de expiración del nuevo plan (días del plan + días bonificados)
    const totalDias = nuevoPlan.diasDuracion + diasBonificados;
    const fechaExpiracion = new Date(hoy);
    fechaExpiracion.setDate(fechaExpiracion.getDate() + totalDias);
    
    // 6. Calcular total de anuncios (anuncios del plan + anuncios bonificados)
    const totalAnuncios = nuevoPlan.anunciosTotal + anunciosBonificados;
    
    // 7. Crear el nuevo plan con los valores bonificados
    const planData: Omit<Plan, 'id'> = {
      userId,
      tipo: nuevoPlan.tipo,
      anunciosDisponibles: totalAnuncios,
      anunciosUsados: 0,
      totalAnuncios: totalAnuncios,
      precio: nuevoPlan.precio,
      totalInvertido: nuevoPlan.precio + (planActivo?.totalInvertido || 0),
      diasDuracion: totalDias,
      fechaCompra: hoy.toISOString(),
      fechaExpiracion: fechaExpiracion.toISOString(),
      diasBonificados,
      anunciosBonificados,
    };
    
    const planId = await crearPlan(planData);
    
    return {
      planId,
      diasBonificados,
      anunciosBonificados,
    };
  } catch (error) {
    console.error('Error al crear plan con bonificación:', error);
    throw error;
  }
}

// Simular la compra de un plan (para preview antes de confirmar)
export async function simularCompraPlan(
  userId: string,
  nuevoPlan: {
    tipo: string;
    anunciosTotal: number;
    precio: number;
    diasDuracion: number;
  }
): Promise<{
  diasTotales: number;
  anunciosTotales: number;
  diasBonificados: number;
  anunciosBonificados: number;
  fechaExpiracion: Date;
}> {
  try {
    const hoy = new Date();
    let diasBonificados = 0;
    let anunciosBonificados = 0;
    
    // Buscar plan activo
    const planActivo = await getPlanActivoUsuario(userId);
    
    if (planActivo) {
      diasBonificados = calcularDiasRestantes(planActivo.fechaExpiracion);
      anunciosBonificados = planActivo.anunciosDisponibles;
    }
    
    const diasTotales = nuevoPlan.diasDuracion + diasBonificados;
    const anunciosTotales = nuevoPlan.anunciosTotal + anunciosBonificados;
    
    const fechaExpiracion = new Date(hoy);
    fechaExpiracion.setDate(fechaExpiracion.getDate() + diasTotales);
    
    return {
      diasTotales,
      anunciosTotales,
      diasBonificados,
      anunciosBonificados,
      fechaExpiracion,
    };
  } catch (error) {
    console.error('Error al simular compra:', error);
    throw error;
  }
}

// Actualizar un plan existente
export async function actualizarPlan(planId: string, datos: Partial<Plan>): Promise<void> {
  try {
    const planRef = doc(db, 'planes', planId);
    await updateDoc(planRef, datos);
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    throw error;
  }
}

// Eliminar un plan
export async function eliminarPlan(planId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'planes', planId));
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    throw error;
  }
}

// Usar un anuncio del plan (decrementar anuncios disponibles)
export async function usarAnuncioPlan(userId: string): Promise<boolean> {
  try {
    const planActivo = await getPlanActivoUsuario(userId);
    
    if (!planActivo || planActivo.anunciosDisponibles <= 0) {
      return false;
    }
    
    await actualizarPlan(planActivo.id, {
      anunciosDisponibles: planActivo.anunciosDisponibles - 1,
      anunciosUsados: (planActivo.anunciosUsados || 0) + 1,
    });
    
    return true;
  } catch (error) {
    console.error('Error al usar anuncio del plan:', error);
    return false;
  }
}

// Obtener resumen del plan de un usuario (para mostrar en UI)
export async function getResumenPlanUsuario(userId: string): Promise<{
  tienePlan: boolean;
  plan: Plan | null;
  diasRestantes: number;
  anunciosRestantes: number;
  porcentajeUsado: number;
  expiraPronto: boolean; // Si le quedan menos de 7 días
} | null> {
  try {
    const planActivo = await getPlanActivoUsuario(userId);
    
    if (!planActivo) {
      return {
        tienePlan: false,
        plan: null,
        diasRestantes: 0,
        anunciosRestantes: 0,
        porcentajeUsado: 0,
        expiraPronto: false,
      };
    }
    
    const diasRestantes = calcularDiasRestantes(planActivo.fechaExpiracion);
    const porcentajeUsado = planActivo.totalAnuncios > 0
      ? Math.round((planActivo.anunciosUsados / planActivo.totalAnuncios) * 100)
      : 0;
    
    return {
      tienePlan: true,
      plan: planActivo,
      diasRestantes,
      anunciosRestantes: planActivo.anunciosDisponibles,
      porcentajeUsado,
      expiraPronto: diasRestantes <= 7 && diasRestantes > 0,
    };
  } catch (error) {
    console.error('Error al obtener resumen del plan:', error);
    return null;
  }
}
