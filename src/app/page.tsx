"use client";

import { useEffect, useState, useContext, useMemo } from "react";
import { Anuncio, EstadoAnuncio } from '@/types';
import { useRouter } from "next/navigation";
import { getAnuncios } from "@/lib/anuncios.service";
import Image from "next/image";
import { Heart, MapPin, Eye, ChevronLeft, ChevronRight, Sparkles, Crown, Gem, Star, Grid3X3, List, LayoutGrid, TrendingUp, Zap, Truck, Clock } from "lucide-react";
import { useFavoritos } from "@/contexts/FavoritosContext";
import { CategoryContext } from '@/components/GlobalCategoryBar';
import CategorySlider from '@/components/CategorySlider';
import FeaturedSlider from '@/components/FeaturedSlider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { useDesign } from '@/contexts/DesignContext';
import { 
  MinimalistNoirCard,
  ClasicoProfesionalCard,
  ClasicoProfesionalEleganteCard,
  ClasicoProfesionalMinimalCard,
  ClasicoProfesionalSoftCard,
  ClasicoProfesionalNordicCard,
  UniversalCard
} from '@/components/DesignCards';
import AdBanner from '@/components/AdBanner';

export default function Home() {
  const { selectedCategory } = useContext(CategoryContext);
  const { t } = useLanguage();
  const { user } = useAuth();
  const { design, cardVariant } = useDesign();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [anunciosPromocionados, setAnunciosPromocionados] = useState<Anuncio[]>([]);
  const [anunciosNormales, setAnunciosNormales] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "compact">("grid");
  const [promoIndex, setPromoIndex] = useState(0);
  const [hoverImageIndex, setHoverImageIndex] = useState<{ [key: string]: number }>({});
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Marcar como montado para evitar errores de hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar viewMode desde localStorage después del montaje (evita error de hidratación)
  useEffect(() => {
    if (!mounted) return;
    const saved = localStorage.getItem('viewMode');
    if (saved === 'grid' || saved === 'list' || saved === 'compact') {
      setViewMode(saved);
    }
  }, [mounted]);

  // Guardar viewMode en localStorage cuando cambie
  useEffect(() => {
    if (typeof window !== 'undefined' && mounted) {
      localStorage.setItem('viewMode', viewMode);
    }
  }, [viewMode, mounted]);

  // Función para cambiar imagen basado en posición del ratón (izquierda/derecha)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, anuncioId: string, totalImages: number) => {
    if (totalImages <= 1) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const imageIndex = Math.min(Math.floor(percentage * totalImages), totalImages - 1);
    
    setHoverImageIndex(prev => {
      if (prev[anuncioId] !== imageIndex) {
        return { ...prev, [anuncioId]: imageIndex };
      }
      return prev;
    });
  };

  const handleMouseLeavePromo = (anuncioId: string) => {
    setHoverImageIndex(prev => ({ ...prev, [anuncioId]: 0 }));
  };

  // Scroll al inicio cuando se carga la página
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, []);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await getAnuncios(null, user?.uid || null);
        
        // Auto-aprobar anuncios en revisión del usuario actual que tengan más de 30 segundos
        if (user?.uid) {
          const anunciosEnRevision = data.filter((a: any) => 
            a.estado === 'En revisión' && 
            (a.vendedorId === user.uid || a.usuarioId === user.uid)
          );
          
          for (const anuncio of anunciosEnRevision) {
            const fechaCreacion = (anuncio as any).fechaCreacionRevision 
              ? new Date((anuncio as any).fechaCreacionRevision)
              : (anuncio as any).fechaCreacion
                ? (typeof (anuncio as any).fechaCreacion === 'string' ? new Date((anuncio as any).fechaCreacion) : (anuncio as any).fechaCreacion.toDate?.() || new Date())
                : new Date();
            
            const ahora = new Date();
            const segundosTranscurridos = (ahora.getTime() - fechaCreacion.getTime()) / 1000;
            
            // Si han pasado más de 30 segundos, auto-aprobar
            if (segundosTranscurridos > 30) {
              try {
                await fetch('/api/auto-aprobar', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ anuncioId: anuncio.id })
                });
                console.log(`✅ Auto-aprobado anuncio pendiente: ${anuncio.id}`);
              } catch (e) {
                console.error('Error auto-aprobando:', e);
              }
            }
          }
        }
        
        // Obtener promociones activas directamente de Firestore, no de localStorage
        const { getDocs, collection, query, where, Timestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        let promocionesActivas: any[] = [];
        try {
          const promocionesRef = collection(db, 'promociones');
          
          // Obtener todas las promociones que aún estén activas
          const q = query(
            promocionesRef,
            where('fechaFin', '>', Timestamp.now())
          );
          
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc: any) => {
            const promo = doc.data();
            const fechaFinDate = promo.fechaFin.toDate();
            const ahora = new Date();
            promocionesActivas.push({
              id: doc.id,
              anuncioId: promo.anuncioId,
              tipo: promo.tipo,
              fechaInicio: promo.fechaInicio,
              fechaFin: promo.fechaFin,
              diasRestantes: Math.ceil((fechaFinDate.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
            });
          });
        } catch (e) {
          console.error('Error cargando promociones de Firestore:', e);
          // Fallback a localStorage si Firestore falla - solo en cliente
          if (typeof window !== 'undefined') {
            const promocionesGuardadas = localStorage.getItem('promocionesActivas');
            if (promocionesGuardadas) {
              try {
                promocionesActivas = JSON.parse(promocionesGuardadas);
                promocionesActivas = promocionesActivas.filter(p => p.diasRestantes > 0);
              } catch (e2) {
                console.error('Error cargando promociones de localStorage:', e2);
              }
            }
          }
        }

        const anunciosPromo: Anuncio[] = [];
        const anunciosNorm: Anuncio[] = [];

        data.forEach((anuncio: Anuncio) => {
          const promocion = promocionesActivas.find(p => p.anuncioId === anuncio.id);
          if (promocion) {
            anunciosPromo.push({ ...anuncio, promocion });
          } else if (anuncio.destacado && anuncio.planPromocion) {
            // Fallback: Si el anuncio tiene destacado=true pero no hay promoción en Firestore
            // Mostrar como promocionado usando los datos del anuncio
            anunciosPromo.push({ 
              ...anuncio, 
              promocion: { 
                tipo: anuncio.planPromocion, 
                diasRestantes: 30 
              } 
            });
          } else {
            anunciosNorm.push(anuncio);
          }
        });

        const ordenPlanes = { 'VIP': 2, 'Premium': 1 };
        anunciosPromo.sort((a: any, b: any) => {
          const nivelA = ordenPlanes[a.promocion?.tipo as keyof typeof ordenPlanes] || 0;
          const nivelB = ordenPlanes[b.promocion?.tipo as keyof typeof ordenPlanes] || 0;
          return nivelB - nivelA;
        });

        setAnunciosPromocionados(anunciosPromo);
        setAnunciosNormales(anunciosNorm);
        setAnuncios(data || []);
      } catch (e) {
        setAnuncios([]);
        setAnunciosPromocionados([]);
        setAnunciosNormales([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.uid]);

  // Filtrar anuncios por categoría seleccionada
  const anunciosPromocionadosFiltrados = useMemo(() => {
    if (!selectedCategory) return anunciosPromocionados;
    return anunciosPromocionados.filter(a => a.categoria === selectedCategory);
  }, [anunciosPromocionados, selectedCategory]);

  const anunciosNormalesFiltrados = useMemo(() => {
    if (!selectedCategory) return anunciosNormales;
    return anunciosNormales.filter(a => a.categoria === selectedCategory);
  }, [anunciosNormales, selectedCategory]);

  // Función helper para renderizar la card correcta según diseño y variante
  const renderDesignCard = (anuncio: Anuncio) => {
    // Usar UniversalCard que automáticamente selecciona el estilo correcto
    // según el diseño y la variante de card seleccionados
    if (design !== 'default') {
      return <UniversalCard key={anuncio.id} anuncio={anuncio} />;
    }
    return null;
  };

  // Resetear índice del carousel cuando cambia la categoría
  useEffect(() => {
    setPromoIndex(0);
  }, [selectedCategory]);

  useEffect(() => {
    if (anunciosPromocionadosFiltrados.length > 3) {
      const interval = setInterval(() => {
        setPromoIndex(prev => (prev + 1) % Math.max(1, anunciosPromocionadosFiltrados.length - 2));
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [anunciosPromocionadosFiltrados.length]);

  const PromoCard = ({ anuncio, index }: { anuncio: any; index: number }) => {
    const isVIP = anuncio.promocion?.tipo === 'VIP';
    const isPremium = anuncio.promocion?.tipo === 'Premium';
    const fav = favoritos.has(anuncio.id);

    return (
      <div 
        onClick={() => router.push(`/ad/${anuncio.id}`)}
        className={`relative group cursor-pointer rounded-2xl overflow-hidden transition-all duration-500 ${
          isVIP 
            ? 'bg-gradient-to-br from-rose-500 via-pink-500 to-purple-600 p-[2px] shadow-2xl shadow-pink-500/30 hover:shadow-pink-500/50' 
            : isPremium 
              ? 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500 p-[2px] shadow-xl shadow-amber-500/25 hover:shadow-amber-500/40'
              : 'bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px] shadow-lg'
        } hover:scale-[1.02] transform-gpu`}
      >
        <div className="bg-white rounded-[14px] overflow-hidden h-full">
          <div className={`absolute top-3 left-3 z-20 flex items-center justify-center w-8 h-8 rounded-full text-white shadow-lg backdrop-blur-sm ${
            isVIP 
              ? 'bg-gradient-to-r from-rose-500 to-pink-600' 
              : isPremium 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-blue-500 to-indigo-600'
          }`}>
            {isVIP ? <Gem size={16} /> : isPremium ? <Crown size={16} /> : <Star size={16} />}
          </div>

          <div className="relative h-52 overflow-hidden">
            <Image
              src={anuncio.imagenes?.[0] || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(anuncio.id);
              }}
              className={`absolute top-3 right-3 z-20 p-1.5 rounded-full transition-all duration-300 ${
                fav ? 'bg-red-500 text-white scale-110' : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-red-500'
              }`}
            >
              <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
            </button>

            <div className="absolute bottom-3 left-3 z-10">
              <div className={`px-4 py-2 rounded-xl font-bold text-lg shadow-lg ${
                isVIP 
                  ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' 
                  : isPremium 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                    : 'bg-white text-gray-900'
              }`}>
                {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
              </div>
            </div>

            {anuncio.imagenes?.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg">
                📷 {anuncio.imagenes.length}
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-gray-900 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
              {anuncio.titulo}
            </h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin size={14} className="text-blue-500" />
              <span className="truncate">{anuncio.ubicacion || anuncio.provincia || t('home.spain')}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Eye size={12} /> {anuncio.vistas || 0}
                </span>
                <span className="flex items-center gap-1">
                  <Heart size={12} /> {anuncio.favoritos || 0}
                </span>
              </div>
              {isVIP && (
                <span className="flex items-center gap-1 text-pink-500 font-medium">
                  <Zap size={12} /> {t('home.featured')}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Componente PromoCardSmall para la sección de anuncios promocionados
  const PromoCardSmall = ({ anuncio }: { anuncio: Anuncio }) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
    const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
    const imageCount = anuncio.imagenes?.length || 1;
    const fav = favoritos.has(anuncio.id!);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (imageCount <= 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
      if (newIndex !== currentImageIndex) {
        setCurrentImageIndex(newIndex);
      }
    };

    const handleMouseLeave = () => {
      setCurrentImageIndex(0);
    };

    const handleToggleFav = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      toggleFav(anuncio.id!);
    };

    return (
      <div 
        onClick={() => router.push(`/ad/${anuncio.id}`)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={`rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300 bg-white shadow-md border ${isVIP ? 'hover:border-pink-300 hover:shadow-pink-200/50' : isPremium ? 'hover:border-amber-300 hover:shadow-amber-200/50' : 'hover:border-blue-300 hover:shadow-blue-200/50'} hover:shadow-xl border-gray-100/50`}
      >
        {/* Sección imagen con overlay */}
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {/* Carrusel de imágenes */}
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            imageCount === 1 ? (
              <Image
                src={anuncio.imagenes[0] || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className="object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-500 ease-out"
              />
            ) : (
              anuncio.imagenes.map((img, idx) => (
                <Image
                  key={idx}
                  src={img || '/placeholder.jpg'}
                  alt={`${anuncio.titulo} - foto ${idx + 1}`}
                  fill
                  className={`object-cover absolute inset-0 transition-opacity duration-150 ${idx === currentImageIndex ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
                />
              ))
            )
          ) : (
            <Image
              src='/placeholder.jpg'
              alt={anuncio.titulo}
              fill
              className="object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-500"
            />
          )}
          
          {/* Overlay oscuro en hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-5 duration-300" />
          
          {/* Badge tipo pill - arriba a la izquierda */}
          <div className={`absolute top-3 left-3 z-20 w-8 h-8 rounded-full flex items-center justify-center text-white backdrop-blur-md ${
            isVIP 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-lg shadow-pink-500/40' 
              : isPremium 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-500/40'
                : 'bg-gradient-to-r from-blue-500 to-indigo-500 shadow-lg shadow-blue-500/40'
          }`}>
            {isVIP ? <Crown size={16} /> : isPremium ? <Star size={16} /> : <Sparkles size={16} />}
          </div>
          
          {/* Botón favorito - arriba a la derecha */}
          <button
            onClick={handleToggleFav}
            className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all z-20 backdrop-blur-md ${
              fav 
                ? 'bg-red-500 text-white shadow-lg shadow-red-500/50 scale-110' 
                : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110 shadow-md'
            }`}
          >
            <Heart size={12} fill={fav ? 'currentColor' : 'none'} />
          </button>
          
          {/* Precio flotante - abajo a la izquierda */}
          <div className="absolute bottom-2 left-2 z-20">
            <span className={`px-2 py-1 rounded-lg font-semibold text-xs shadow-md backdrop-blur-md ${
              isVIP 
                ? 'bg-pink-500/90 text-white' 
                : isPremium 
                  ? 'bg-amber-500/90 text-white'
                  : 'bg-white/90 text-gray-900'
            }`}>
              {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
            </span>
          </div>
          
          {/* Indicadores de puntos - abajo al centro */}
          {imageCount > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
              {anuncio.imagenes?.map((_, idx) => (
                <span 
                  key={idx}
                  className={`rounded-full transition-all duration-200 backdrop-blur-sm ${idx === currentImageIndex ? 'w-2.5 h-2 bg-white shadow-lg' : 'w-1.5 h-1.5 bg-white/60'}`}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Sección información */}
        <div className="p-3.5 bg-white">
          <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-2 group-hover:text-blue-600 transition-colors">
            {anuncio.titulo}
          </h3>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={13} className={isVIP ? 'text-pink-500' : isPremium ? 'text-amber-500' : 'text-blue-500'} />
              <span className="font-medium truncate">{anuncio.provincia || 'ES'}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-full">
              <Eye size={11} />
              <span className="font-medium">{anuncio.vistas || 0}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const AnuncioCardNew = ({ anuncio, viewMode: cardViewMode }: { anuncio: Anuncio; viewMode?: string }) => {
    const currentViewMode = cardViewMode || viewMode;
    const [imgError, setImgError] = useState(false);
    const [currentImgIndex, setCurrentImgIndex] = useState(0);
    const [hoverInterval, setHoverIntervalLocal] = useState<NodeJS.Timeout | null>(null);
    const imageCount = anuncio.imagenes?.length || 1;
    const fav = favoritos.has(anuncio.id!);

    // Cleanup interval on unmount
    useEffect(() => {
      return () => {
        if (hoverInterval) clearInterval(hoverInterval);
      };
    }, [hoverInterval]);

    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (imageCount <= 1) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
      if (newIndex !== currentImgIndex) {
        setCurrentImgIndex(newIndex);
      }
    };

    const handleCardMouseLeave = () => {
      setCurrentImgIndex(0);
    };

    if (viewMode === "list") {
      // Determinar color del borde según promoción o categoría
      const borderColor = anuncio.destacado && anuncio.planPromocion 
        ? (anuncio.planPromocion === 'VIP' ? 'border-pink-400' :
           anuncio.planPromocion === 'Premium' ? 'border-amber-400' :
           'border-purple-400')
        : (anuncio.categoria === 'Electronice' ? 'border-purple-400' :
           anuncio.categoria === 'Auto moto' ? 'border-green-400' :
           anuncio.categoria === 'Imobiliare' ? 'border-green-400' :
           'border-purple-400');
      
      return (
        <div 
          onClick={() => router.push(`/ad/${anuncio.id}`)}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          className={`bg-white overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group rounded-xl border-2 ${borderColor}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
            {/* Carrusel de imágenes */}
            {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
              anuncio.imagenes.length === 1 ? (
                <Image
                  src={imgError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
                  alt={anuncio.titulo}
                  fill
                  className={`object-cover group-hover:scale-105 transition-transform duration-500 ${anuncio.estado === EstadoAnuncio.EN_REVISION ? 'opacity-80' : ''}`}
                  onError={() => setImgError(true)}
                />
              ) : (
                anuncio.imagenes.map((img, idx) => (
                  <Image
                    key={idx}
                    src={imgError ? '/placeholder.jpg' : (img || '/placeholder.jpg')}
                    alt={`${anuncio.titulo} - foto ${idx + 1}`}
                    fill
                    className={`object-cover absolute inset-0 ${idx === currentImgIndex ? 'z-10 opacity-100' : 'z-0 opacity-0'} ${anuncio.estado === EstadoAnuncio.EN_REVISION ? 'opacity-80' : ''}`}
                    style={{ transition: 'none' }}
                    onError={() => setImgError(true)}
                  />
                ))
              )
            ) : (
              <Image
                src='/placeholder.jpg'
                alt={anuncio.titulo}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            )}
            
            {/* Indicadores de puntos */}
            {imageCount > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
                {anuncio.imagenes?.map((_, idx) => (
                  <span 
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${idx === currentImgIndex ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            )}
            
            {/* Badge de categoría */}
            <span className={`absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-20 ${
              anuncio.categoria === 'Electronice' ? 'bg-purple-500' :
              anuncio.categoria === 'Auto moto' ? 'bg-green-500' :
              anuncio.categoria === 'Imobiliare' ? 'bg-green-500' :
              'bg-purple-500'
            }`}>
              {anuncio.categoria || 'Sin categoría'}
            </span>
            
            {/* Badge de promoción o revisión */}
            {anuncio.estado === EstadoAnuncio.EN_REVISION ? (
              <span className="absolute top-12 left-3 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 z-20">
                <Clock size={12} />
                En revisión
              </span>
            ) : anuncio.destacado && anuncio.planPromocion && (
              <span className={`absolute top-12 left-3 w-8 h-8 rounded-full shadow-lg flex items-center justify-center z-20 text-white ${
                anuncio.planPromocion === 'VIP' ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                anuncio.planPromocion === 'Premium' ? 'bg-amber-500' :
                'bg-purple-500'
              }`}>
                {anuncio.planPromocion === 'VIP' && <Crown size={14} />}
                {anuncio.planPromocion === 'Premium' && <Zap size={14} />}
                {anuncio.planPromocion === 'Destacado' && <Star size={14} />}
              </span>
            )}
            
            {/* Botón de favorito */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(anuncio.id!);
              }}
              className={`absolute top-3 right-3 p-2.5 rounded-full transition-all z-20 ${
                fav ? 'bg-red-500 text-white' : 'bg-white/80 text-gray-400 hover:text-red-500 hover:bg-white'
              }`}
            >
              <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>
          
          {/* Info del anuncio */}
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors text-base mb-2">
              {anuncio.titulo}
            </h3>
            
            {/* Precio */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-bold text-green-600 text-lg">{anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
              {anuncio.negociable && (
                <span className="text-xs text-gray-500 font-medium">Negociable</span>
              )}
            </div>
            
            {/* Condición */}
            <p className="text-sm text-gray-600 mb-2">
              {anuncio.condicion || 'Sin especificar'}
            </p>
            
            {/* Ubicación y tiempo */}
            <div className="flex items-center justify-between text-xs text-gray-400">
              <div className="flex items-center gap-1">
                <MapPin size={12} />
                <span>{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>Ahora</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div 
        onClick={() => router.push(`/ad/${anuncio.id}`)}
        onMouseMove={handleCardMouseMove}
        onMouseLeave={handleCardMouseLeave}
        className={`${currentViewMode === "grid" ? '' : 'bg-white shadow hover:shadow-lg rounded-2xl'} overflow-hidden transition-all duration-300 cursor-pointer group`}
      >
        <div className={`relative ${currentViewMode === "grid" ? 'aspect-[4/5] rounded-2xl' : currentViewMode === "compact" ? 'h-48' : 'h-48'} overflow-hidden`}>
          {/* Carrusel de imágenes */}
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.length === 1 ? (
              // Solo una imagen - aplicar efecto elegante
              <Image
                src={imgError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
                alt={anuncio.titulo}
                fill
                className={`object-cover ${currentViewMode === "grid" ? 'rounded-2xl' : ''}`}
                onError={() => setImgError(true)}
              />
            ) : (
              // Múltiples imágenes - carrusel sin efecto de zoom
              anuncio.imagenes.map((img, idx) => (
                <Image
                  key={idx}
                  src={imgError ? '/placeholder.jpg' : (img || '/placeholder.jpg')}
                  alt={`${anuncio.titulo} - foto ${idx + 1}`}
                  fill
                  className={`object-cover absolute inset-0 ${idx === currentImgIndex ? 'z-10 opacity-100' : 'z-0 opacity-0'}`}
                  style={{ transition: 'none' }}
                  onError={() => setImgError(true)}
                />
              ))
            )
          ) : (
            <Image
              src='/placeholder.jpg'
              alt={anuncio.titulo}
              fill
              className="object-cover group-hover:scale-110 group-hover:brightness-110 transition-all duration-500"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-5" />
          
          {/* Indicadores de puntos */}
          {imageCount > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
              {anuncio.imagenes?.map((_, idx) => (
                <span 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentImgIndex ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
          
          {currentViewMode !== "grid" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(anuncio.id!);
              }}
              className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-300 shadow-md ${
                fav ? 'bg-red-500 text-white scale-110' : 'bg-white/95 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'
              }`}
            >
              <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
            </button>
          )}

          {anuncio.estado === EstadoAnuncio.EN_REVISION ? (
            <div className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1">
              <Clock size={12} />
              En revisión
            </div>
          ) : anuncio.condicion === 'Nuevo' && (
            <div className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-md">
              {t('condition.new')}
            </div>
          )}
        </div>

        {currentViewMode === "grid" ? (
          <div className="py-2">
            <div className="text-lg font-bold text-gray-900">
              {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
            </div>
            <h3 className="text-sm text-gray-700 truncate">
              {anuncio.titulo}
            </h3>
            {anuncio.envioDisponible && (
              <div className="flex items-center gap-1.5 text-fuchsia-500 text-sm font-medium mt-1">
                <Truck size={16} />
                <span>{t('ad.delivery')}</span>
              </div>
            )}
          </div>
        ) : (
          <div className={`${currentViewMode === "compact" ? 'p-4' : 'p-4'}`}>
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 ${currentViewMode === "compact" ? 'text-base' : 'text-base'}`}>
                {anuncio.titulo}
              </h3>
            </div>
            
            <div className="flex items-center gap-1.5 text-gray-500 text-xs mb-3">
              <MapPin size={12} className="text-blue-500 flex-shrink-0" />
              <span className="truncate">{anuncio.ubicacion || anuncio.provincia || t('home.spain')}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className={`font-bold text-blue-600 ${currentViewMode === "compact" ? 'text-lg' : 'text-lg'}`}>
                {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
              </span>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <span className="flex items-center gap-0.5">
                  <Eye size={12} /> {anuncio.vistas || 0}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {loading ? (
          <div className="flex flex-col items-center justify-center h-96 gap-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-blue-600 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-500 animate-pulse">{t('home.loadingAds')}</p>
          </div>
        ) : anuncios.length === 0 ? (
          <div className="bg-white rounded-3xl shadow-sm p-16 text-center border border-gray-100">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LayoutGrid size={32} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('home.noAdsTitle')}</h3>
            <p className="text-gray-500">{t('home.noAdsSubtitle')}</p>
          </div>
        ) : (
          <>
            {/* CategorySlider - Solo mostrar cuando hay categoría seleccionada y hay anuncios promocionados */}
            {selectedCategory && anunciosPromocionadosFiltrados.length > 0 && (
              <div className="-mx-4 sm:-mx-6 -mt-6 mb-8">
                <CategorySlider 
                  anuncios={anunciosPromocionadosFiltrados} 
                  categoria={selectedCategory} 
                />
              </div>
            )}

            {/* Sección VIP & Premium - Solo mostrar cuando NO hay categoría seleccionada */}
            {!selectedCategory && <FeaturedSlider limit={10} source="vip-premium" />}

            {/* Banner publicitario en la página principal */}
            <div className="my-6">
              <AdBanner slot="home_middle" className="w-full h-[90px] rounded-xl overflow-hidden" />
            </div>

            {/* Sección Todos los Anuncios Promocionados - Solo cuando NO hay categoría */}
            {!selectedCategory && anunciosPromocionados.length > 0 && (
              <section className="mb-10">
                {/* Header estilo botón limpio con fondo azul suave */}
                <div className="bg-gradient-to-r from-blue-100 via-blue-50 to-slate-50 border border-blue-100 rounded-2xl p-4 mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    {/* Lado izquierdo - estilo botón */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-slate-800">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t('home.promotedAds')}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {t('home.promotedAdsSubtitle')}
                        </p>
                      </div>
                    </div>
                    
                    {/* Lado derecho - Estadísticas */}
                    <div className="flex items-center gap-3 sm:gap-4">
                      {/* Total publicados */}
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-gray-800">{anuncios.length}</div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">Publicados</div>
                        </div>
                      </div>
                      
                      {/* Separador */}
                      <div className="hidden sm:block w-px h-10 bg-gray-200" />
                      
                      {/* Badges compactos */}
                      <div className="flex items-center gap-2">
                        {anunciosPromocionados.filter((a: any) => a.promocion?.tipo === 'VIP').length > 0 && (
                          <div className="flex items-center gap-1.5 bg-pink-500 px-3 py-2 rounded-xl">
                            <Crown size={14} className="text-white" />
                            <span className="text-white font-bold text-sm">
                              {anunciosPromocionados.filter((a: any) => a.promocion?.tipo === 'VIP').length}
                            </span>
                          </div>
                        )}
                        {anunciosPromocionados.filter((a: any) => a.promocion?.tipo === 'Premium').length > 0 && (
                          <div className="flex items-center gap-1.5 bg-amber-500 px-3 py-2 rounded-xl">
                            <Star size={14} className="text-white" />
                            <span className="text-white font-bold text-sm">
                              {anunciosPromocionados.filter((a: any) => a.promocion?.tipo === 'Premium').length}
                            </span>
                          </div>
                        )}
                        {anunciosPromocionados.filter((a: any) => a.promocion?.tipo?.toUpperCase() === 'DESTACADO').length > 0 && (
                          <div className="flex items-center gap-1.5 bg-blue-500 px-3 py-2 rounded-xl">
                            <Zap size={14} className="text-white" />
                            <span className="text-white font-bold text-sm">
                              {anunciosPromocionados.filter((a: any) => a.promocion?.tipo?.toUpperCase() === 'DESTACADO').length}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Grid de anuncios */}
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                  {anunciosPromocionados.map((anuncio) => (
                    design !== 'default' ? (
                      renderDesignCard(anuncio)
                    ) : (
                      <PromoCardSmall key={anuncio.id} anuncio={anuncio} />
                    )
                  ))}
                </div>
              </section>
            )}

            {/* Sección Todos los anuncios */}
            <section>
              {/* Header según diseño */}
              {design === 'minimalista-noir' ? (
                <div className="flex items-center justify-between mb-8">
                  <div className="border-b-2 border-zinc-900 pb-2">
                    <h2 className="text-lg font-bold text-zinc-900 uppercase tracking-[2px]">
                      {selectedCategory 
                        ? (anunciosPromocionadosFiltrados.length > 0 ? t('home.otherAds') : t('home.ads'))
                        : (anunciosPromocionadosFiltrados.length > 0 ? t('home.moreAds') : t('home.allAds'))
                      }
                    </h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider mt-1">{anunciosNormalesFiltrados.length} {t('home.results')}</p>
                  </div>
                  <div className="flex items-center gap-0 border border-zinc-300">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 transition-all ${
                        viewMode === "grid" ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-2 border-l border-zinc-300 transition-all ${
                        viewMode === "compact" ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <Grid3X3 size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 border-l border-zinc-300 transition-all ${
                        viewMode === "list" ? 'bg-zinc-900 text-white' : 'text-zinc-400 hover:text-zinc-900'
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedCategory 
                        ? (anunciosPromocionadosFiltrados.length > 0 ? t('home.otherAds') : t('home.ads'))
                        : (anunciosPromocionadosFiltrados.length > 0 ? t('home.moreAds') : t('home.allAds'))
                      }
                    </h2>
                    <p className="text-sm text-gray-500">{anunciosNormalesFiltrados.length} {t('home.results')}</p>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "grid" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("compact")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "compact" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Grid3X3 size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 rounded-lg transition-all ${
                        viewMode === "list" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <List size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div className={`grid gap-4 ${
                viewMode === "list" 
                  ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5' 
                  : viewMode === "compact"
                    ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                    : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              }`}>
                {(viewMode === "compact" ? anunciosNormalesFiltrados.slice(0, 5) : anunciosNormalesFiltrados).map((anuncio) => (
                  design !== 'default' ? (
                    renderDesignCard(anuncio)
                  ) : (
                    <AnuncioCardNew key={anuncio.id} anuncio={anuncio} viewMode={viewMode} />
                  )
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
