"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight, Gem, Crown, MapPin, Eye, Sparkles, Flame, Star, Zap, LayoutGrid, List } from 'lucide-react';
import { Anuncio } from '@/types';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { useLanguage } from '@/contexts/LanguageContext';

export default function FeaturedSlider({ limit = 10, source = 'vip-premium' }: { limit?: number; source?: 'vip' | 'premium' | 'vip-premium' | 'destacado' | 'all' }) {
  const { t } = useLanguage();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [items, setItems] = useState<Anuncio[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [viewMode, setViewMode] = useState<'slider' | 'list'>('slider');
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Determinar si es el slider VIP/Premium o Destacado
  const isVIPPremiumSlider = source === 'vip-premium' || source === 'vip' || source === 'premium';

  useEffect(() => {
    let mounted = true;
    setItems([]);
    
    const loadAnuncios = async () => {
      try {
        // Cargar promociones desde Firestore
        const { collection, getDocs, query, where, Timestamp } = await import('firebase/firestore');
        const { db } = await import('@/lib/firebase');
        
        let promocionesActivas: any[] = [];
        
        try {
          const promocionesRef = collection(db, 'promociones');
          
          // Obtener todas las promociones activas
          const q = query(promocionesRef, where('fechaFin', '>', Timestamp.now()));
          const querySnapshot = await getDocs(q);
          
          querySnapshot.forEach((doc: any) => {
            const promo = doc.data();
            const fechaFinDate = promo.fechaFin.toDate();
            const ahora = new Date();
            promocionesActivas.push({
              id: doc.id,
              anuncioId: promo.anuncioId,
              tipo: promo.tipo,
              diasRestantes: Math.ceil((fechaFinDate.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24))
            });
          });
        } catch (e) {
          console.error('Error cargando promociones de Firestore en slider:', e);
          // Fallback a localStorage - solo en cliente
          if (typeof window !== 'undefined') {
            const promocionesGuardadas = localStorage.getItem('promocionesActivas');
            if (promocionesGuardadas) {
              promocionesActivas = JSON.parse(promocionesGuardadas);
              promocionesActivas = promocionesActivas.filter((p: any) => p.diasRestantes > 0);
            }
          }
        }
        
        if (promocionesActivas.length === 0) {
          setItems([]);
          return;
        }
        
        // Filtrar según el source
        let promocionesFiltradas;
        if (source === 'all') {
          // Mostrar todos los destacados
          promocionesFiltradas = promocionesActivas.filter((p: any) => p.diasRestantes > 0);
        } else if (source === 'vip-premium') {
          // Solo VIP y Premium
          promocionesFiltradas = promocionesActivas.filter(
            (p: any) => (p.tipo?.toUpperCase() === 'VIP' || p.tipo?.toUpperCase() === 'PREMIUM') && p.diasRestantes > 0
          );
        } else if (source === 'destacado') {
          // Solo Destacado (no VIP ni Premium)
          promocionesFiltradas = promocionesActivas.filter(
            (p: any) => p.tipo?.toUpperCase() === 'DESTACADO' && p.diasRestantes > 0
          );
        } else if (source === 'vip') {
          promocionesFiltradas = promocionesActivas.filter(
            (p: any) => p.tipo?.toUpperCase() === 'VIP' && p.diasRestantes > 0
          );
        } else if (source === 'premium') {
          promocionesFiltradas = promocionesActivas.filter(
            (p: any) => p.tipo?.toUpperCase() === 'PREMIUM' && p.diasRestantes > 0
          );
        } else {
          promocionesFiltradas = [];
        }
        
        if (promocionesFiltradas.length === 0) {
          setItems([]);
          return;
        }
        
        const anuncioIds = promocionesFiltradas.map((p: any) => p.anuncioId);
        const { getAnuncios } = await import('@/lib/anuncios.service');
        const todosLosAnuncios = await getAnuncios();
        
        if (!mounted) return;
        
        const anunciosPromocionados = todosLosAnuncios
          .filter((anuncio: Anuncio) => anuncioIds.includes(anuncio.id))
          .map((anuncio: Anuncio) => {
            const promocion = promocionesFiltradas.find((p: any) => p.anuncioId === anuncio.id);
            return { ...anuncio, promocion };
          });
        
        // Ordenar: VIP primero, luego Premium, luego Destacado
        anunciosPromocionados.sort((a: any, b: any) => {
          const ordenPlanes = { 'VIP': 2, 'Premium': 1, 'Destacado': 0 };
          const nivelA = ordenPlanes[a.promocion?.tipo as keyof typeof ordenPlanes] || 0;
          const nivelB = ordenPlanes[b.promocion?.tipo as keyof typeof ordenPlanes] || 0;
          return nivelB - nivelA;
        });
        
        const finalList = anunciosPromocionados.slice(0, limit);
        setItems(finalList);
      } catch (error) {
        console.error('Error cargando anuncios:', error);
      }
    };
    
    loadAnuncios();
    return () => { mounted = false; };
  }, [limit, source]);

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || items.length <= 3) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % Math.max(1, items.length - 2));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, items.length]);

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFav(id);
  };

  const scrollTo = (direction: 'prev' | 'next') => {
    setIsAutoPlaying(false);
    if (direction === 'prev') {
      setCurrentIndex(prev => Math.max(0, prev - 1));
    } else {
      setCurrentIndex(prev => Math.min(items.length - 4, prev + 1));
    }
  };

  if (!items || items.length === 0) return null;

  // Contar por tipo
  const vipCount = items.filter((a: any) => a.promocion?.tipo?.toUpperCase() === 'VIP').length;
  const premiumCount = items.filter((a: any) => a.promocion?.tipo?.toUpperCase() === 'PREMIUM' || a.promocion?.tipo === 'Premium').length;
  const destacadoCount = items.filter((a: any) => a.promocion?.tipo?.toUpperCase() === 'DESTACADO').length;

  // Estilos según el tipo de slider
  const isDestacadoSlider = source === 'destacado';

  return (
    <section className="w-full py-8 relative overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header moderno minimalista */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {/* Icono con gradiente */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${isDestacadoSlider 
              ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/25'
              : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/25'}`}>
              {isDestacadoSlider ? <Star className="w-6 h-6 text-white" /> : <Crown className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h2 className={`text-xl sm:text-2xl font-bold ${isDestacadoSlider 
                ? 'text-gray-900 dark:text-gray-100'
                : 'text-gray-900 dark:text-gray-100'}`}>
                {isDestacadoSlider ? t('ad.featured') : 'VIP & Premium'}
              </h2>
              <div className="flex items-center gap-3 text-sm">
                {isDestacadoSlider ? (
                  destacadoCount > 0 && (
                    <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      {destacadoCount} {t('profile.activeAds').split(' ')[0].toLowerCase()}
                    </span>
                  )
                ) : (
                  <>
                    {vipCount > 0 && (
                      <span className="flex items-center gap-1.5 text-pink-600 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse"></span>
                        {vipCount} VIP
                      </span>
                    )}
                    {premiumCount > 0 && (
                      <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                        {premiumCount} Premium
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          
          {/* Toggle vista y controles de navegación */}
          <div className="flex items-center gap-3">
            {/* Toggle vista */}
            <div className="hidden sm:flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
              <button
                onClick={() => setViewMode('slider')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'slider' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <LayoutGrid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
              >
                <List size={18} />
              </button>
            </div>
            
            {/* Controles de navegación - solo en modo slider */}
            {viewMode === 'slider' && items.length > 4 && (
              <div className="hidden sm:flex items-center gap-2">
                <button 
                  onClick={() => scrollTo('prev')}
                  disabled={currentIndex === 0}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={() => scrollTo('next')}
                  disabled={currentIndex >= items.length - 4}
                  className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Vista de Lista - Diseño horizontal */}
        {viewMode === 'list' && (
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {items.map((anuncio) => {
                const promo = (anuncio as any).promocion;
                const tipoPromo = promo?.tipo?.toUpperCase();
                const isVIPItem = tipoPromo === 'VIP';
                const isPremiumItem = tipoPromo === 'PREMIUM';
                
                return (
                  <Link
                    key={anuncio.id}
                    href={`/ad/${anuncio.id}`}
                    className="group flex-shrink-0 w-[360px]"
                    onMouseEnter={() => setIsAutoPlaying(false)}
                    onMouseLeave={() => setIsAutoPlaying(true)}
                  >
                    <div className={`h-full bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-gray-900/30 transition-all duration-300 group-hover:-translate-y-0.5 overflow-hidden`}>
                      <div className="flex h-[100px]">
                        {/* Imagen */}
                        <div className="relative w-28 h-full flex-shrink-0">
                          <Image
                            src={anuncio.imagenes?.[0] || '/placeholder.jpg'}
                            alt={anuncio.titulo}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                          {/* Línea de color según tipo */}
                          <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                            isVIPItem 
                              ? 'bg-gradient-to-b from-pink-400 to-rose-500' 
                              : isPremiumItem 
                                ? 'bg-gradient-to-b from-amber-400 to-orange-500'
                                : 'bg-gradient-to-b from-blue-400 to-indigo-500'
                          }`} />
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100 text-base line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {anuncio.titulo}
                            </h3>
                            {/* Badge pequeño */}
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white ${
                              isVIPItem 
                                ? 'bg-pink-500' 
                                : isPremiumItem 
                                  ? 'bg-amber-500'
                                  : 'bg-blue-500'
                            }`}>
                              {isVIPItem ? <Gem size={12} /> : isPremiumItem ? <Crown size={12} /> : <Star size={12} />}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-gray-100 text-base">
                              {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
                            </span>
                            <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                              <span className="flex items-center gap-0.5">
                                <MapPin size={12} />
                                <span className="truncate max-w-[70px]">{anuncio.provincia || 'España'}</span>
                              </span>
                              <button
                                onClick={(e) => handleToggleFavorite(e, anuncio.id)}
                                className={`p-1.5 rounded transition-colors ${
                                  favoritos.has(anuncio.id)
                                    ? 'text-red-500'
                                    : 'text-gray-400 hover:text-red-500'
                                }`}
                              >
                                <Heart size={14} fill={favoritos.has(anuncio.id) ? 'currentColor' : 'none'} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}

        {/* Slider de tarjetas */}
        {viewMode === 'slider' && (
        <div className="relative overflow-hidden" ref={containerRef}>
          <div 
            className="flex gap-3 transition-transform duration-500 ease-out pb-2"
            style={{ transform: `translateX(-${currentIndex * (100 / (isDestacadoSlider ? 4 : 5) + 0.8)}%)` }}
          >
            {items.map((anuncio, idx) => {
              const promo = (anuncio as any).promocion;
              const tipoPromo = promo?.tipo?.toUpperCase();
              const isVIPItem = tipoPromo === 'VIP';
              const isPremiumItem = tipoPromo === 'PREMIUM';
              
              return (
                <Link
                  key={anuncio.id}
                  href={`/ad/${anuncio.id}`}
                  className={`flex-shrink-0 group ${isDestacadoSlider ? 'w-full sm:w-1/2 lg:w-1/4' : 'w-full sm:w-1/3 lg:w-1/5'}`}
                  onMouseEnter={() => setIsAutoPlaying(false)}
                  onMouseLeave={() => setIsAutoPlaying(true)}
                >
                  {/* Card moderna con borde gradiente */}
                  <div className={`relative rounded-2xl p-[1px] transition-all duration-300 group-hover:-translate-y-1 ${
                    isVIPItem 
                      ? 'bg-gradient-to-br from-pink-400 via-rose-500 to-pink-600' 
                      : isPremiumItem 
                        ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-amber-600'
                        : 'bg-gradient-to-br from-blue-400 via-indigo-500 to-blue-600'
                  }`}>
                    <div className="bg-white dark:bg-gray-800 rounded-[15px] overflow-hidden">
                      {/* Imagen */}
                      <div className={`relative overflow-hidden ${isDestacadoSlider ? 'h-44' : 'h-32'}`}>
                        <Image
                          src={anuncio.imagenes?.[0] || '/placeholder.jpg'}
                          alt={anuncio.titulo}
                          fill
                          sizes="(max-width: 768px) 50vw, 280px"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        
                        {/* Overlay gradiente sutil */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Badge de tipo */}
                        <div className="absolute top-3 left-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-white shadow-md backdrop-blur-sm ${
                            isVIPItem 
                              ? 'bg-gradient-to-r from-pink-500 to-rose-500' 
                              : isPremiumItem 
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                          }`}>
                            {isVIPItem ? <Gem size={14} /> : isPremiumItem ? <Crown size={14} /> : <Star size={14} />}
                          </div>
                        </div>
                        
                        {/* Botón favorito */}
                        <button
                          onClick={(e) => handleToggleFavorite(e, anuncio.id)}
                          className={`absolute top-3 right-3 w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-300 ${
                            favoritos.has(anuncio.id)
                              ? 'bg-red-500 text-white shadow-lg'
                              : 'bg-white/90 text-gray-600 hover:bg-red-500 hover:text-white'
                          }`}
                        >
                          <Heart size={16} fill={favoritos.has(anuncio.id) ? 'currentColor' : 'none'} />
                        </button>

                        {/* Precio flotante */}
                        <div className="absolute bottom-3 left-3">
                          <div className="px-3 py-1.5 rounded-lg font-bold text-base bg-white shadow-md text-gray-900">
                            {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
                          </div>
                        </div>

                        {/* Contador de imágenes */}
                        {anuncio.imagenes?.length > 1 && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 text-white text-xs">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {anuncio.imagenes.length}
                          </div>
                        )}
                      </div>

                      {/* Contenido */}
                      <div className={isDestacadoSlider ? 'p-4' : 'p-2.5'}>
                        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 line-clamp-1 mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors ${isDestacadoSlider ? 'text-sm' : 'text-xs'}`}>
                          {anuncio.titulo}
                        </h3>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-xs">
                            <MapPin size={isDestacadoSlider ? 12 : 10} className={isVIPItem ? 'text-pink-500' : isPremiumItem ? 'text-amber-500' : 'text-blue-500'} />
                            <span className={`truncate ${isDestacadoSlider ? 'max-w-[100px]' : 'max-w-[60px] text-[10px]'}`}>{anuncio.provincia || 'España'}</span>
                          </div>
                          
                          {/* Stats - ocultar en VIP/Premium para ahorrar espacio */}
                          {isDestacadoSlider && (
                          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
                            <span className="flex items-center gap-0.5">
                              <Eye size={11} />
                              {anuncio.vistas || 0}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Heart size={11} />
                              {anuncio.favoritos || 0}
                            </span>
                          </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        )}

        {/* Indicadores de posición */}
        {viewMode === 'slider' && items.length > 4 && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.max(1, items.length - 3) }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsAutoPlaying(false);
                }}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? `w-6 ${isDestacadoSlider ? 'bg-blue-500' : 'bg-amber-500'}` 
                    : 'w-1.5 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
