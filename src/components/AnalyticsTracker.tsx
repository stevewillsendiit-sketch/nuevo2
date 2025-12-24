'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  registrarVisita, 
  detectarDispositivo, 
  detectarNavegador, 
  detectarSO,
  generarSesionId 
} from '@/lib/analytics.service';

// Generar sesión ID una vez por carga de página
const getSesionId = () => {
  if (typeof window === 'undefined') return '';
  
  let sesionId = sessionStorage.getItem('analytics_session');
  if (!sesionId) {
    sesionId = generarSesionId();
    sessionStorage.setItem('analytics_session', sesionId);
  }
  return sesionId;
};

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { user } = useAuth();
  const lastPathRef = useRef<string>('');
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Evitar registro duplicado para la misma página
    if (pathname === lastPathRef.current) return;
    lastPathRef.current = pathname;

    // Debounce para evitar muchos registros en navegación rápida
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(async () => {
      try {
        const userAgent = navigator.userAgent;
        
        // Obtener IP (en producción usarías un servicio)
        let ip = 'unknown';
        try {
          const ipResponse = await fetch('https://api.ipify.org?format=json');
          const ipData = await ipResponse.json();
          ip = ipData.ip;
        } catch {
          // Ignorar error de IP
        }

        await registrarVisita({
          ip,
          userAgent,
          pagina: pathname,
          referrer: document.referrer || 'direct',
          dispositivo: detectarDispositivo(userAgent),
          navegador: detectarNavegador(userAgent),
          sistemaOperativo: detectarSO(userAgent),
          usuarioId: user?.uid,
          sesionId: getSesionId(),
        });
      } catch (error) {
        console.error('Error registrando visita:', error);
      }
    }, 1000); // 1 segundo de debounce

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pathname, user]);

  return null; // Este componente no renderiza nada
}
