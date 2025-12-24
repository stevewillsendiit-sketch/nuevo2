import { 
  sendEmailVerification,
  applyActionCode,
  RecaptchaVerifier,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  ConfirmationResult,
  updatePhoneNumber,
  PhoneAuthCredential,
} from 'firebase/auth';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

// ============================================
// VERIFICACIÓN DE EMAIL
// ============================================

/**
 * Enviar email de verificación al usuario actual
 */
export async function sendVerificationEmail(): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No hay usuario autenticado');
  }
  
  if (user.emailVerified) {
    throw new Error('El email ya está verificado');
  }

  await sendEmailVerification(user, {
    url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/profile?verified=email`,
    handleCodeInApp: false,
  });
}

/**
 * Verificar si el email del usuario actual está verificado
 */
export async function checkEmailVerification(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  
  // Recargar usuario para obtener estado actualizado
  await user.reload();
  
  // Si está verificado, actualizar en Firestore
  if (user.emailVerified) {
    try {
      await updateDoc(doc(db, 'usuarios', user.uid), {
        emailVerificado: true,
        fechaVerificacionEmail: new Date(),
      });
    } catch (error) {
      console.error('Error actualizando verificación en Firestore:', error);
    }
  }
  
  return user.emailVerified;
}

/**
 * Aplicar código de verificación de email
 */
export async function verifyEmailWithCode(oobCode: string): Promise<void> {
  await applyActionCode(auth, oobCode);
  
  const user = auth.currentUser;
  if (user) {
    await user.reload();
    await updateDoc(doc(db, 'usuarios', user.uid), {
      emailVerificado: true,
      fechaVerificacionEmail: new Date(),
    });
  }
}

// ============================================
// VERIFICACIÓN DE TELÉFONO
// ============================================

let recaptchaVerifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

/**
 * Inicializar reCAPTCHA para verificación de teléfono
 */
export function initRecaptcha(containerId: string): RecaptchaVerifier {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    },
  });
  
  return recaptchaVerifier;
}

/**
 * Enviar código SMS de verificación
 */
export async function sendPhoneVerificationCode(phoneNumber: string): Promise<string> {
  if (!recaptchaVerifier) {
    throw new Error('reCAPTCHA no inicializado');
  }

  // Formatear número de teléfono (añadir +40 si es necesario para Rumanía)
  let formattedPhone = phoneNumber.trim();
  if (!formattedPhone.startsWith('+')) {
    // Si empieza con 0, reemplazar por código de país
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '+40' + formattedPhone.substring(1);
    } else {
      formattedPhone = '+40' + formattedPhone;
    }
  }

  try {
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return confirmationResult.verificationId;
  } catch (error: any) {
    console.error('Error enviando SMS:', error);
    
    // Manejar errores específicos
    if (error.code === 'auth/invalid-phone-number') {
      throw new Error('Număr de telefon invalid. Verifică formatul.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Prea multe încercări. Încearcă din nou mai târziu.');
    } else if (error.code === 'auth/quota-exceeded') {
      throw new Error('Limita de SMS-uri a fost atinsă. Încearcă mai târziu.');
    }
    
    throw new Error('Eroare la trimiterea codului SMS');
  }
}

/**
 * Verificar código SMS
 */
export async function verifyPhoneCode(code: string): Promise<boolean> {
  if (!confirmationResult) {
    throw new Error('Nu există o verificare în curs');
  }

  try {
    const result = await confirmationResult.confirm(code);
    
    // Actualizar en Firestore
    if (result.user) {
      await updateDoc(doc(db, 'usuarios', result.user.uid), {
        telefonVerificat: true,
        telefon: result.user.phoneNumber,
        fechaVerificacionTelefon: new Date(),
      });
    }
    
    return true;
  } catch (error: any) {
    console.error('Error verificando código:', error);
    
    if (error.code === 'auth/invalid-verification-code') {
      throw new Error('Cod invalid. Verifică și încearcă din nou.');
    } else if (error.code === 'auth/code-expired') {
      throw new Error('Codul a expirat. Solicită un cod nou.');
    }
    
    throw new Error('Eroare la verificarea codului');
  }
}

/**
 * Vincular número de teléfono a cuenta existente
 */
export async function linkPhoneToAccount(phoneNumber: string, verificationCode: string, verificationId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No hay usuario autenticado');
  }

  const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
  await updatePhoneNumber(user, credential);
  
  // Actualizar en Firestore
  await updateDoc(doc(db, 'usuarios', user.uid), {
    telefonVerificat: true,
    telefon: phoneNumber,
    fechaVerificacionTelefon: new Date(),
  });
}

// ============================================
// ESTADO DE VERIFICACIÓN
// ============================================

export interface VerificationStatus {
  emailVerified: boolean;
  phoneVerified: boolean;
  email: string | null;
  phone: string | null;
}

/**
 * Obtener estado de verificación del usuario actual
 */
export async function getVerificationStatus(): Promise<VerificationStatus> {
  const user = auth.currentUser;
  
  if (!user) {
    return {
      emailVerified: false,
      phoneVerified: false,
      email: null,
      phone: null,
    };
  }

  // Obtener datos de Firestore para verificación de teléfono
  let phoneVerified = false;
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', user.uid));
    if (userDoc.exists()) {
      phoneVerified = userDoc.data()?.telefonVerificat === true;
    }
  } catch (error) {
    console.error('Error obteniendo estado de verificación:', error);
  }

  return {
    emailVerified: user.emailVerified,
    phoneVerified: phoneVerified || !!user.phoneNumber,
    email: user.email,
    phone: user.phoneNumber,
  };
}

/**
 * Limpiar reCAPTCHA al desmontar
 */
export function cleanupRecaptcha(): void {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
  confirmationResult = null;
}
