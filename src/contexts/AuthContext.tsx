'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { Usuario, TipoUsuario } from '@/types';
import { getUsuario, signIn as authSignIn, signUp as authSignUp, signOut as authSignOut, DatosEmpresa } from '@/lib/auth.service';
import { getFavoritos, getFavoritosRemote, setFavoritosRemote } from '@/lib/favoritos.service';
import { doc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: FirebaseUser | null;
  usuario: Usuario | null;
  loading: boolean;
  syncingFavoritos: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nombre: string, apellidos: string, tipoUsuario?: TipoUsuario, datosEmpresa?: DatosEmpresa) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncingFavoritos, setSyncingFavoritos] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('🔐 Auth state changed:', user?.email);
      setUser(user);
      
      if (user) {
        console.log('👤 Buscando datos del usuario en Firestore...');
        let usuarioData = await getUsuario(user.uid);
        console.log('📦 Usuario desde Firestore:', usuarioData);
        
        // Si el usuario no existe en Firestore, crearlo automáticamente
        if (!usuarioData && user.email) {
          console.log('⚠️ Usuario no encontrado en Firestore, creando documento...');
          const nuevoUsuario: Usuario = {
            id: user.uid,
            nombre: user.displayName || user.email.split('@')[0],
            email: user.email,
            verificado: false,
            valoracion: 0,
            numeroValoraciones: 0,
            fechaRegistro: new Date(),
            tipoUsuario: 'particular',
          };
          
          try {
            await setDoc(doc(db, 'usuarios', user.uid), nuevoUsuario);
            usuarioData = nuevoUsuario;
            console.log('✅ Documento de usuario creado exitosamente');
          } catch (err) {
            console.error('❌ Error creando documento de usuario:', err);
          }
        }
        
        setUsuario(usuarioData);
          // Sync favoritos: merge local and remote favorites and persist both
          try {
            if (typeof window !== 'undefined') {
              setSyncingFavoritos(true);
              const local = getFavoritos();
              const remote = await getFavoritosRemote(user.uid);
              const union = Array.from(new Set([...(remote || []), ...(local || [])]));
              // update localStorage if needed
              try { localStorage.setItem('favoritos', JSON.stringify(union)); } catch (e) { console.error('Error writing local favorites', e); }
              // update remote
              await setFavoritosRemote(user.uid, union);
              console.log('🔁 Favoritos sincronizados local<->remote', union.length);
            }
          } catch (err) {
            console.error('❌ Error sincronizando favoritos al iniciar sesión:', err);
          } finally {
            setSyncingFavoritos(false);
          }
      } else {
        setUsuario(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    await authSignIn(email, password);
  };

  const signUp = async (email: string, password: string, nombre: string, apellidos: string, tipoUsuario: TipoUsuario = 'particular', datosEmpresa?: DatosEmpresa) => {
    await authSignUp(email, password, nombre, apellidos, tipoUsuario, datosEmpresa);
  };

  const signOut = async () => {
    await authSignOut();
  };

  return (
    <AuthContext.Provider value={{ user, usuario, loading, syncingFavoritos, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
