import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from './firebase';
import { Usuario, TipoUsuario } from '@/types';
import { registrarUsuarioNuevo } from './analytics.service';

// Re-exportar TipoUsuario para uso externo
export type { TipoUsuario } from '@/types';

export interface DatosEmpresa {
  nombreComercial: string;
  cif: string;
  direccionFiscal?: string;
  telefono?: string;
  web?: string;
  horarioAtencion?: string;
  descripcionEmpresa?: string;
}

export async function signUp(
  email: string,
  password: string,
  nombre: string,
  apellidos: string,
  tipoUsuario: TipoUsuario = 'particular',
  datosEmpresa?: DatosEmpresa
): Promise<FirebaseUser> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  // Actualizar perfil
  const displayName = tipoUsuario === 'empresa' && datosEmpresa 
    ? datosEmpresa.nombreComercial 
    : `${nombre} ${apellidos}`;
  await updateProfile(user, { displayName });

  // Crear documento de usuario en Firestore
  const usuario: Partial<Usuario> = {
    id: user.uid,
    nombre: tipoUsuario === 'empresa' && datosEmpresa ? datosEmpresa.nombreComercial : `${nombre} ${apellidos}`,
    email,
    verificado: false,
    valoracion: 0,
    numeroValoraciones: 0,
    fechaRegistro: new Date(),
    tipoUsuario,
  };
  
  // Agregar campos de empresa solo si tienen valor
  if (tipoUsuario === 'empresa' && datosEmpresa) {
    usuario.nombreComercial = datosEmpresa.nombreComercial;
    usuario.cif = datosEmpresa.cif;
    usuario.empresaVerificada = false;
    
    if (datosEmpresa.direccionFiscal) usuario.direccionFiscal = datosEmpresa.direccionFiscal;
    if (datosEmpresa.telefono) usuario.telefono = parseInt(datosEmpresa.telefono);
    if (datosEmpresa.web) usuario.web = datosEmpresa.web;
    if (datosEmpresa.horarioAtencion) usuario.horarioAtencion = datosEmpresa.horarioAtencion;
    if (datosEmpresa.descripcionEmpresa) usuario.descripcionEmpresa = datosEmpresa.descripcionEmpresa;
  }

  await setDoc(doc(db, 'usuarios', user.uid), usuario);

  // Registrar en analytics
  try {
    await registrarUsuarioNuevo({
      email,
      nombre: displayName,
      metodoRegistro: 'email',
    });
  } catch (error) {
    console.error('Error registrando usuario en analytics:', error);
  }

  return user;
}

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function getUsuario(uid: string): Promise<Usuario | null> {
  const docSnap = await getDoc(doc(db, 'usuarios', uid));
  
  if (docSnap.exists()) {
    return docSnap.data() as Usuario;
  }
  
  return null;
}

/**
 * Actualizar foto de perfil del usuario
 */
export async function updateProfilePhoto(file: File): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay usuario autenticado');

  // Crear referencia única para la imagen
  const fileExtension = file.name.split('.').pop();
  const fileName = `profile_${user.uid}_${Date.now()}.${fileExtension}`;
  const storageRef = ref(storage, `profile_photos/${fileName}`);

  // Subir imagen
  await uploadBytes(storageRef, file);
  
  // Obtener URL de descarga
  const downloadURL = await getDownloadURL(storageRef);

  // Actualizar en Firebase Auth
  await updateProfile(user, { photoURL: downloadURL });

  // Actualizar en Firestore
  await updateDoc(doc(db, 'usuarios', user.uid), {
    fotoUrl: downloadURL,
    fotoActualizada: new Date(),
  });

  return downloadURL;
}
