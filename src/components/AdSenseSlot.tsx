'use client';

import { useEffect, useState, useRef } from 'react';
import { getAdCodeForSlot, type AdSlot } from '@/lib/publicidad.service';

interface AdSenseSlotProps {
  slot: AdSlot;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Componente simple para mostrar anuncios de AdSense
 * Usa la configuración del panel de admin (publicidad_config)
 */
export default function AdSenseSlot({
  slot,
  className = '',
  fallback = null,
}: AdSenseSlotProps) {
  const [adsenseCode, setAdsenseCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Cargar código de AdSense
  useEffect(() => {
    async function loadAdCode() {
      try {
        setLoading(true);
        const code = await getAdCodeForSlot(slot);
        setAdsenseCode(code);
      } catch (error) {
        console.error('Error cargando código de AdSense:', error);
        setAdsenseCode(null);
      } finally {
        setLoading(false);
      }
    }
    loadAdCode();
  }, [slot]);

  // Inicializar AdSense cuando el código esté listo
  useEffect(() => {
    if (adsenseCode && containerRef.current && !initialized.current) {
      initialized.current = true;
      
      // Insertar el código de AdSense
      containerRef.current.innerHTML = adsenseCode;
      
      // Ejecutar scripts si los hay
      const scripts = containerRef.current.querySelectorAll('script');
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        newScript.textContent = oldScript.textContent;
        oldScript.parentNode?.replaceChild(newScript, oldScript);
      });

      // Push al array de adsbygoogle si existe
      try {
        if (typeof window !== 'undefined' && (window as any).adsbygoogle) {
          (window as any).adsbygoogle.push({});
        }
      } catch (e) {
        // Ignorar errores de AdSense
      }
    }
  }, [adsenseCode]);

  // Reset cuando cambia el slot
  useEffect(() => {
    initialized.current = false;
  }, [slot]);

  // Loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-100 rounded-lg ${className}`}>
        <div className="h-full w-full min-h-[100px]"></div>
      </div>
    );
  }

  // No hay código de AdSense configurado
  if (!adsenseCode) {
    return fallback ? <>{fallback}</> : null;
  }

  return (
    <div 
      ref={containerRef}
      className={`adsense-container ${className}`}
      data-slot={slot}
    />
  );
}

// Variante para diferentes tamaños comunes de anuncios
export function AdSenseBanner({ slot, className = '' }: { slot: AdSlot; className?: string }) {
  return (
    <AdSenseSlot 
      slot={slot} 
      className={`w-full min-h-[90px] ${className}`}
    />
  );
}

export function AdSenseSidebar({ slot, className = '' }: { slot: AdSlot; className?: string }) {
  return (
    <AdSenseSlot 
      slot={slot} 
      className={`w-full min-h-[250px] ${className}`}
    />
  );
}

export function AdSenseSquare({ slot, className = '' }: { slot: AdSlot; className?: string }) {
  return (
    <AdSenseSlot 
      slot={slot} 
      className={`w-full aspect-square max-w-[300px] ${className}`}
    />
  );
}
