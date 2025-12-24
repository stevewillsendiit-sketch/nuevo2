'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { 
  getPublicidadRandom, 
  registrarImpresion, 
  registrarClic,
  type Publicidad,
  type AdSlot 
} from '@/lib/publicidad.service';
import { X } from 'lucide-react';

interface AdBannerProps {
  slot: AdSlot;
  className?: string;
  categoria?: string;
  ubicacion?: string;
  fallback?: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
}

// Detectar tipo de dispositivo
function getDeviceType(): 'desktop' | 'tablet' | 'mobile' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export default function AdBanner({
  slot,
  className = '',
  categoria,
  ubicacion,
  fallback = null,
  showCloseButton = false,
  onClose,
}: AdBannerProps) {
  const [publicidad, setPublicidad] = useState<Publicidad | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);
  const [impressionRegistered, setImpressionRegistered] = useState(false);

  // Cargar publicidad
  const cargarPublicidad = useCallback(async () => {
    try {
      setLoading(true);
      const dispositivo = getDeviceType();
      const pub = await getPublicidadRandom(slot, {
        categoria,
        ubicacion,
        dispositivo,
      });
      setPublicidad(pub);
      setImpressionRegistered(false);
    } catch (error) {
      console.error('Error cargando publicidad:', error);
      setPublicidad(null);
    } finally {
      setLoading(false);
    }
  }, [slot, categoria, ubicacion]);

  useEffect(() => {
    cargarPublicidad();
  }, [cargarPublicidad]);

  // Registrar impresión cuando el anuncio es visible
  useEffect(() => {
    if (publicidad && visible && !impressionRegistered) {
      const dispositivo = getDeviceType();
      registrarImpresion(publicidad.id, {
        dispositivo,
        pagina: typeof window !== 'undefined' ? window.location.pathname : undefined,
        referer: typeof document !== 'undefined' ? document.referrer : undefined,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      });
      setImpressionRegistered(true);
    }
  }, [publicidad, visible, impressionRegistered]);

  // Manejar clic
  const handleClick = async () => {
    if (!publicidad) return;
    
    const dispositivo = getDeviceType();
    await registrarClic(publicidad.id, {
      dispositivo,
      pagina: typeof window !== 'undefined' ? window.location.pathname : undefined,
      referer: typeof document !== 'undefined' ? document.referrer : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    });

    // Abrir enlace
    if (publicidad.linkUrl) {
      window.open(publicidad.linkUrl, publicidad.linkTarget || '_blank');
    }
  };

  // Cerrar anuncio
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };

  // No mostrar si está cerrado
  if (!visible) return null;

  // Loading state
  if (loading) {
    return (
      <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}>
        <div className="h-full w-full"></div>
      </div>
    );
  }

  // No hay publicidad disponible
  if (!publicidad) {
    return fallback ? <>{fallback}</> : null;
  }

  // Renderizar según formato
  const renderContent = () => {
    const dispositivo = getDeviceType();
    const imagenUrl = dispositivo === 'mobile' && publicidad.imagenMobile 
      ? publicidad.imagenMobile 
      : publicidad.imagenUrl;

    switch (publicidad.formato) {
      case 'image':
        return imagenUrl ? (
          <div 
            className="relative w-full h-full cursor-pointer group"
            onClick={handleClick}
          >
            <Image
              src={imagenUrl}
              alt={publicidad.nombre}
              fill
              sizes="100vw"
              className="object-cover rounded-lg transition-opacity group-hover:opacity-90"
              unoptimized
            />
            {/* Indicador de publicidad */}
            <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">
              Publicidad
            </span>
          </div>
        ) : null;

      case 'html':
        return publicidad.htmlContent ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: publicidad.htmlContent }}
            onClick={handleClick}
          />
        ) : null;

      case 'adsense':
        return publicidad.adsenseCode ? (
          <div 
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: publicidad.adsenseCode }}
          />
        ) : null;

      case 'video':
        return publicidad.videoUrl ? (
          <div className="relative w-full h-full">
            <video
              src={publicidad.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover rounded-lg cursor-pointer"
              onClick={handleClick}
            />
            <span className="absolute bottom-1 left-1 text-[10px] bg-black/50 text-white px-1 rounded">
              Publicidad
            </span>
          </div>
        ) : null;

      default:
        return null;
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {renderContent()}
      
      {/* Botón cerrar */}
      {showCloseButton && (
        <button
          onClick={handleClose}
          className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
          aria-label="Cerrar publicidad"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// Componente para Popup publicitario
interface AdPopupProps {
  onClose: () => void;
  categoria?: string;
  ubicacion?: string;
}

export function AdPopup({ onClose, categoria, ubicacion }: AdPopupProps) {
  const [publicidad, setPublicidad] = useState<Publicidad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const dispositivo = getDeviceType();
        const pub = await getPublicidadRandom('popup', {
          categoria,
          ubicacion,
          dispositivo,
        });
        setPublicidad(pub);
        
        if (pub) {
          await registrarImpresion(pub.id, {
            dispositivo,
            pagina: window.location.pathname,
          });
        }
      } catch (error) {
        console.error('Error cargando popup:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [categoria, ubicacion]);

  const handleClick = async () => {
    if (!publicidad) return;
    
    await registrarClic(publicidad.id, {
      dispositivo: getDeviceType(),
      pagina: window.location.pathname,
    });

    if (publicidad.linkUrl) {
      window.open(publicidad.linkUrl, publicidad.linkTarget || '_blank');
    }
  };

  if (loading || !publicidad) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative max-w-lg w-full mx-4 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b dark:border-gray-700">
          <span className="text-xs text-gray-500">Publicidad</span>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Contenido */}
        <div 
          className="relative aspect-video cursor-pointer"
          onClick={handleClick}
        >
          {publicidad.imagenUrl && (
            <Image
              src={publicidad.imagenUrl}
              alt={publicidad.nombre}
              fill
              sizes="(max-width: 768px) 90vw, 500px"
              className="object-cover"
              unoptimized
            />
          )}
        </div>
        
        {/* CTA */}
        {publicidad.linkUrl && (
          <div className="p-4">
            <button
              onClick={handleClick}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
            >
              Ver más
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Hook para manejar popup con frecuencia
export function useAdPopup(frecuenciaMinutos: number = 30) {
  const [showPopup, setShowPopup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const lastShown = localStorage.getItem('lastAdPopup');
    const now = Date.now();
    
    if (!lastShown || now - parseInt(lastShown) > frecuenciaMinutos * 60 * 1000) {
      // Mostrar popup después de un delay
      const timer = setTimeout(() => {
        setShowPopup(true);
        localStorage.setItem('lastAdPopup', now.toString());
      }, 5000); // Mostrar después de 5 segundos
      
      return () => clearTimeout(timer);
    }
  }, [frecuenciaMinutos, mounted]);

  const closePopup = () => setShowPopup(false);

  return { showPopup, closePopup };
}

// Componentes específicos por slot para facilitar uso
export function HeaderBanner({ className = '' }: { className?: string }) {
  return (
    <AdBanner 
      slot="header_banner" 
      className={`w-full h-[90px] ${className}`}
    />
  );
}

export function SidebarTopAd({ className = '', categoria, ubicacion }: { className?: string; categoria?: string; ubicacion?: string }) {
  return (
    <AdBanner 
      slot="sidebar_top" 
      className={`w-full aspect-square ${className}`}
      categoria={categoria}
      ubicacion={ubicacion}
    />
  );
}

export function SidebarBottomAd({ className = '', categoria, ubicacion }: { className?: string; categoria?: string; ubicacion?: string }) {
  return (
    <AdBanner 
      slot="sidebar_bottom" 
      className={`w-full aspect-[1/2] ${className}`}
      categoria={categoria}
      ubicacion={ubicacion}
    />
  );
}

export function SearchTopAd({ className = '' }: { className?: string }) {
  return (
    <AdBanner 
      slot="search_top" 
      className={`w-full h-[90px] ${className}`}
    />
  );
}

export function FooterBanner({ className = '' }: { className?: string }) {
  return (
    <AdBanner 
      slot="footer_banner" 
      className={`w-full h-[90px] ${className}`}
    />
  );
}
