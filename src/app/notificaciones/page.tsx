"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Notificacion {
  id: string;
  titulo?: string;
  cuerpo?: string;
  fecha?: any;
  leida?: boolean;
}

export default function NotificacionesPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useLanguage();
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'notificaciones'),
      where('usuarioId', '==', user.uid),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snap) => {
      const items: Notificacion[] = snap.docs.map(d => ({ id: d.id, ...d.data() } as Notificacion));
      setNotificaciones(items);
    }, (err) => console.error('Error notificaciones:', err));

    return () => unsubscribe();
  }, [user]);

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('notifications.title')}</h1>

        {notificaciones.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-md text-center">
            <p className="text-gray-500">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notificaciones.map(n => (
                <div key={n.id} className={`bg-white p-4 rounded-xl shadow-sm ${n.leida ? 'opacity-60' : 'bg-white'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{n.titulo || t('notifications.title')}</h3>
                        <p className="text-sm text-gray-600 mt-1">{n.cuerpo}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-xs text-gray-400">
                          {n.fecha?.toDate ? n.fecha.toDate().toLocaleString() : ''}
                        </div>
                        {!n.leida && (
                          <button
                            onClick={async () => {
                              try {
                                await updateDoc(doc(db, 'notificaciones', n.id), { leida: true });
                              } catch (err) {
                                console.error('Error marcando notificación leída', err);
                              }
                            }}
                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            aria-label={`${t('notifications.markRead')} ${n.titulo || ''}`}
                          >
                            {t('notifications.markRead')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
