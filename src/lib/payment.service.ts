import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

export interface PaymentConfig {
  // Stripe
  stripeEnabled: boolean;
  stripeSecretKey: string;
  stripePublishableKey: string;
  stripeWebhookSecret: string;
  stripeMode: 'test' | 'live';
  
  // PayPal
  paypalEnabled: boolean;
  paypalClientId: string;
  paypalClientSecret: string;
  paypalMode: 'sandbox' | 'live';
  
  // Códigos promocionales
  promoCodes: PromoCode[];
  
  // General
  currency: 'EUR' | 'RON' | 'USD';
  updatedAt: string;
  updatedBy: string;
}

export interface PromoCode {
  code: string;
  bonus: number;
  type: 'fixed' | 'percentage';
  active: boolean;
  usageLimit?: number;
  usageCount: number;
  expiresAt?: string;
  createdAt: string;
}

const CONFIG_DOC_ID = 'payment_settings';

export async function getPaymentConfig(): Promise<PaymentConfig | null> {
  try {
    const docRef = doc(db, 'configuracion', CONFIG_DOC_ID);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as PaymentConfig;
    }
    
    // Retornar configuración por defecto
    return {
      stripeEnabled: false,
      stripeSecretKey: '',
      stripePublishableKey: '',
      stripeWebhookSecret: '',
      stripeMode: 'test',
      paypalEnabled: false,
      paypalClientId: '',
      paypalClientSecret: '',
      paypalMode: 'sandbox',
      promoCodes: [
        { code: 'VINDEL10', bonus: 10, type: 'fixed', active: true, usageCount: 0, createdAt: new Date().toISOString() },
        { code: 'BONUS20', bonus: 20, type: 'fixed', active: true, usageCount: 0, createdAt: new Date().toISOString() },
      ],
      currency: 'EUR',
      updatedAt: new Date().toISOString(),
      updatedBy: '',
    };
  } catch (error) {
    console.error('Error getting payment config:', error);
    return null;
  }
}

export async function updatePaymentConfig(
  config: Partial<PaymentConfig>,
  adminEmail: string
): Promise<boolean> {
  try {
    const docRef = doc(db, 'configuracion', CONFIG_DOC_ID);
    const existingDoc = await getDoc(docRef);
    
    const updateData = {
      ...config,
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail,
    };
    
    if (existingDoc.exists()) {
      await updateDoc(docRef, updateData);
    } else {
      await setDoc(docRef, updateData);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating payment config:', error);
    return false;
  }
}

export async function addPromoCode(
  promoCode: Omit<PromoCode, 'usageCount' | 'createdAt'>,
  adminEmail: string
): Promise<boolean> {
  try {
    const config = await getPaymentConfig();
    if (!config) return false;
    
    const newCode: PromoCode = {
      ...promoCode,
      usageCount: 0,
      createdAt: new Date().toISOString(),
    };
    
    const updatedCodes = [...(config.promoCodes || []), newCode];
    
    return await updatePaymentConfig({ promoCodes: updatedCodes }, adminEmail);
  } catch (error) {
    console.error('Error adding promo code:', error);
    return false;
  }
}

export async function togglePromoCode(code: string, active: boolean, adminEmail: string): Promise<boolean> {
  try {
    const config = await getPaymentConfig();
    if (!config) return false;
    
    const updatedCodes = config.promoCodes.map(pc => 
      pc.code === code ? { ...pc, active } : pc
    );
    
    return await updatePaymentConfig({ promoCodes: updatedCodes }, adminEmail);
  } catch (error) {
    console.error('Error toggling promo code:', error);
    return false;
  }
}

export async function deletePromoCode(code: string, adminEmail: string): Promise<boolean> {
  try {
    const config = await getPaymentConfig();
    if (!config) return false;
    
    const updatedCodes = config.promoCodes.filter(pc => pc.code !== code);
    
    return await updatePaymentConfig({ promoCodes: updatedCodes }, adminEmail);
  } catch (error) {
    console.error('Error deleting promo code:', error);
    return false;
  }
}

export async function validatePromoCode(code: string): Promise<{ valid: boolean; bonus: number; type: 'fixed' | 'percentage' } | null> {
  try {
    const config = await getPaymentConfig();
    if (!config) return null;
    
    const promoCode = config.promoCodes.find(
      pc => pc.code.toUpperCase() === code.toUpperCase() && pc.active
    );
    
    if (!promoCode) return { valid: false, bonus: 0, type: 'fixed' };
    
    // Check expiration
    if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
      return { valid: false, bonus: 0, type: 'fixed' };
    }
    
    // Check usage limit
    if (promoCode.usageLimit && promoCode.usageCount >= promoCode.usageLimit) {
      return { valid: false, bonus: 0, type: 'fixed' };
    }
    
    return { valid: true, bonus: promoCode.bonus, type: promoCode.type };
  } catch (error) {
    console.error('Error validating promo code:', error);
    return null;
  }
}

export async function incrementPromoCodeUsage(code: string): Promise<boolean> {
  try {
    const config = await getPaymentConfig();
    if (!config) return false;
    
    const updatedCodes = config.promoCodes.map(pc => 
      pc.code.toUpperCase() === code.toUpperCase() 
        ? { ...pc, usageCount: pc.usageCount + 1 } 
        : pc
    );
    
    return await updatePaymentConfig({ promoCodes: updatedCodes }, 'system');
  } catch (error) {
    console.error('Error incrementing promo code usage:', error);
    return false;
  }
}
