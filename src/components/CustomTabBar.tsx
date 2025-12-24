'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaHome, FaSearch, FaPlusCircle, FaEnvelope, FaUser } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function CustomTabBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [notifsNoLeidos, setNotifsNoLeidos] = useState(0);

  // Escuchar mensajes no leídos
  // Escuchar mensajes no leídos sólo si hay usuario
  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'conversaciones'),
      where('participantes', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let totalNoLeidos = 0;
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        const noLeidos = Number((data as Record<string, unknown>)[`noLeidos_${user.uid}`] || 0);
        totalNoLeidos += noLeidos;
        console.log('📬 Conversación:', doc.id, 'NoLeidos:', noLeidos, 'Campo:', `noLeidos_${user.uid}`);
      });
      console.log('📨 Total mensajes no leídos:', totalNoLeidos);
      setMensajesNoLeidos(totalNoLeidos);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Escuchar contador de notificaciones no leídas
  useEffect(() => {
    if (!user?.uid) return;
    const ref = doc(db, 'notifCounters', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.exists() ? snap.data() : null;
      const total = data?.totalNoLeidos || 0;
      setNotifsNoLeidos(Number(total));
    }, (err) => {
      console.error('Error escuchando notifCounters:', err);
    });

    return () => unsub();
  }, [user?.uid]);

  const tabs = [
    { name: t('nav.home'), path: '/', icon: FaHome },
    { name: t('nav.publish'), path: '/publish', icon: FaPlusCircle, isSpecial: true },
    { name: t('nav.messages'), path: '/messages', icon: FaEnvelope },
    { name: t('nav.profile'), path: '/profile', icon: FaUser },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path;
          const Icon = tab.icon;
          
          return (
            <Link
                key={tab.name}
                href={tab.path}
                className={`
                    flex flex-col items-center justify-center flex-1 h-full transition-colors relative
                    ${isActive 
                      ? (tab.isSpecial ? 'text-green-600' : 'text-blue-600')
                      : (tab.path === '/profile' && notifsNoLeidos > 0 ? 'text-yellow-600' : 'text-gray-400')
                    }
                    group
                  `}
              >
              <div className="relative">
                <Icon className={`w-6 h-6 ${tab.isSpecial && 'text-green-600'}`} />
                  {tab.path === '/messages' && mensajesNoLeidos > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
                    </span>
                  )}

                  {tab.path === '/profile' && notifsNoLeidos > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                      {notifsNoLeidos > 9 ? '9+' : notifsNoLeidos}
                    </span>
                  )}

                  {tab.path === '/profile' && (
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {notifsNoLeidos > 0 ? `${t('nav.profile')} — ${notifsNoLeidos}` : t('nav.profile')}
                    </span>
                  )}
              </div>
              <span className="text-xs mt-1 font-medium">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
