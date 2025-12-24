const KEY = 'favoritos';

import { doc, getDoc, setDoc, addDoc, collection, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db } from './firebase';

export function getFavoritos(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error leyendo favoritos desde localStorage', err);
    return [];
  }
}

export function isFavorito(id: string): boolean {
  return getFavoritos().includes(id);
}

export function toggleFavorito(id: string): string[] {
  const favs = new Set(getFavoritos());
  if (favs.has(id)) favs.delete(id);
  else favs.add(id);
  const arr = Array.from(favs);
  try {
    localStorage.setItem(KEY, JSON.stringify(arr));
  } catch (err) {
    console.error('Error guardando favoritos en localStorage', err);
  }
  return arr;
}

export function addFavorito(id: string): string[] {
  const favs = new Set(getFavoritos());
  favs.add(id);
  const arr = Array.from(favs);
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (err) { console.error(err); }
  return arr;
}

export function removeFavorito(id: string): string[] {
  const favs = new Set(getFavoritos());
  favs.delete(id);
  const arr = Array.from(favs);
  try { localStorage.setItem(KEY, JSON.stringify(arr)); } catch (err) { console.error(err); }
  return arr;
}

// Remote (Firestore) helpers
export async function getFavoritosRemote(userId: string): Promise<string[]> {
  try {
    const userDoc = await getDoc(doc(db, 'usuarios', userId));
    if (!userDoc.exists()) return [];
    const data = userDoc.data();
    return (data?.favoritos as string[]) || [];
  } catch (err) {
    console.error('Error leyendo favoritos remotos:', err);
    return [];
  }
}

export async function setFavoritosRemote(userId: string, ids: string[]): Promise<void> {
  try {
    await setDoc(doc(db, 'usuarios', userId), { favoritos: ids }, { merge: true });
  } catch (err) {
    console.error('Error guardando favoritos remotos:', err);
  }
}

export async function toggleFavoritoRemote(userId: string, id: string): Promise<string[]> {
  const current = await getFavoritosRemote(userId);
  const set = new Set(current);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const arr = Array.from(set);
  await setFavoritosRemote(userId, arr);
  return arr;
}

// When a user adds an anuncio to favorites, notify the vendedor
export async function toggleFavoritoRemoteWithNotification(userId: string, id: string): Promise<string[]> {
  const current = await getFavoritosRemote(userId);
  const set = new Set(current);
  const adding = !set.has(id);
  if (set.has(id)) set.delete(id);
  else set.add(id);
  const arr = Array.from(set);
  await setFavoritosRemote(userId, arr);

  if (adding) {
    try {
      const anuncioSnap = await getDoc(doc(db, 'anuncios', id));
      if (anuncioSnap.exists()) {
        const data: any = anuncioSnap.data();
        const vendedorId = data.vendedorId || data.usuarioId;
        if (vendedorId && vendedorId !== userId) {
          await addDoc(collection(db, 'notificaciones'), {
            to: vendedorId,
            from: userId,
            anuncioId: id,
            type: 'favorito',
            message: `Tu anuncio "${data.titulo || ''}" ha sido añadido a favoritos.`,
            read: false,
            createdAt: Timestamp.now(),
          });

          // actualizar contador de notificaciones no leídas
          try {
            await updateDoc(doc(db, 'notifCounters', vendedorId), { totalNoLeidos: increment(1) });
          } catch (err) {
            // si no existe, crear el doc
            await setDoc(doc(db, 'notifCounters', vendedorId), { totalNoLeidos: 1 }, { merge: true });
          }
        }
      }
    } catch (err) {
      console.error('Error creando notificación de favorito:', err);
    }
  }

  return arr;
}

export async function syncLocalToRemote(userId: string): Promise<void> {
  try {
    const local = getFavoritos();
    await setFavoritosRemote(userId, local);
  } catch (err) {
    console.error('Error sincronizando favoritos locales a remoto:', err);
  }
}
