'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, limit, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getUsuario } from '@/lib/auth.service';
import { MessageCircle, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

interface NotificacionMensaje {
  id: string;
  remitenteNombre: string;
  remitenteAvatar?: string;
  contenido: string;
  conversacionId: string;
  timestamp: Date;
}

export default function MessageNotification() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [notificaciones, setNotificaciones] = useState<NotificacionMensaje[]>([]);
  const [ultimoMensajeVisto, setUltimoMensajeVisto] = useState<Date | null>(null);

  // No mostrar notificaciones si estamos en la página de mensajes
  const enPaginaMensajes = pathname === '/messages';

  useEffect(() => {
    if (!user) return;

    // Guardar el timestamp actual como referencia
    const ahora = new Date();
    setUltimoMensajeVisto(ahora);

    // Escuchar mensajes nuevos
    const q = query(
      collection(db, 'mensajes'),
      where('remitenteId', '!=', user.uid),
      orderBy('remitenteId'),
      orderBy('fecha', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const nuevosMensajes: NotificacionMensaje[] = [];

      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const data = change.doc.data();
          const fechaMensaje = data.fecha?.toDate?.() || new Date();
          
          // Solo mostrar mensajes nuevos (después de cargar la página)
          if (fechaMensaje > ahora && !enPaginaMensajes) {
            // Verificar que el usuario es participante de la conversación
            const conversacionRef = await import('firebase/firestore').then(({ doc, getDoc }) => 
              getDoc(doc(db, 'conversaciones', data.conversacionId))
            );
            
            if (conversacionRef.exists()) {
              const convData = conversacionRef.data();
              if (convData.participantes?.includes(user.uid)) {
                // Obtener info del remitente
                const remitente = await getUsuario(data.remitenteId);
                
                nuevosMensajes.push({
                  id: change.doc.id,
                  remitenteNombre: remitente?.nombre || 'Usuario',
                  remitenteAvatar: remitente?.logoUrl,
                  contenido: data.contenido,
                  conversacionId: data.conversacionId,
                  timestamp: fechaMensaje,
                });
              }
            }
          }
        }
      }

      if (nuevosMensajes.length > 0) {
        setNotificaciones(prev => [...nuevosMensajes, ...prev].slice(0, 5));
        
        // Reproducir sonido de notificación
        try {
          const audio = new Audio('/notification.mp3');
          audio.volume = 0.5;
          audio.play().catch(() => {});
        } catch (e) {
          // Ignorar error si no hay audio
        }
      }
    });

    return () => unsubscribe();
  }, [user, enPaginaMensajes]);

  const cerrarNotificacion = useCallback((id: string) => {
    setNotificaciones(prev => prev.filter(n => n.id !== id));
  }, []);

  const irAMensajes = useCallback((conversacionId: string, notifId: string) => {
    cerrarNotificacion(notifId);
    router.push('/messages');
  }, [router, cerrarNotificacion]);

  // Auto-cerrar notificaciones después de 5 segundos
  useEffect(() => {
    if (notificaciones.length === 0) return;

    const timer = setTimeout(() => {
      setNotificaciones(prev => prev.slice(1));
    }, 5000);

    return () => clearTimeout(timer);
  }, [notificaciones]);

  if (notificaciones.length === 0 || enPaginaMensajes) return null;

  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3 max-w-sm">
      {notificaciones.map((notif, index) => (
        <div
          key={notif.id}
          className="animate-slide-in-right bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
          style={{
            animation: 'slideInRight 0.3s ease-out',
            animationDelay: `${index * 100}ms`,
          }}
        >
          <div className="p-4">
            <div className="flex items-start gap-3">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {notif.remitenteAvatar ? (
                  <Image
                    src={notif.remitenteAvatar}
                    alt=""
                    width={48}
                    height={48}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                    {notif.remitenteNombre.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-gray-900">{notif.remitenteNombre}</p>
                  <button
                    onClick={() => cerrarNotificacion(notif.id)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{notif.contenido}</p>
              </div>
            </div>

            {/* Botón de acción */}
            <button
              onClick={() => irAMensajes(notif.conversacionId, notif.id)}
              className="mt-3 w-full py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all"
            >
              Ver mensaje
            </button>
          </div>

          {/* Barra de progreso de auto-cierre */}
          <div className="h-1 bg-gray-100">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
              style={{
                animation: 'shrink 5s linear forwards',
              }}
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
