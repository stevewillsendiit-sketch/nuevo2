"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight, MapPin, Sparkles, Tag, Crown, Gem, Star } from 'lucide-react';
import { Anuncio, Categoria } from '@/types';
import { useFavoritos } from '@/contexts/FavoritosContext';

interface CategorySliderProps {
  anuncios: Anuncio[];
  categoria: Categoria;
}

export default function CategorySlider({ anuncios, categoria }: CategorySliderProps) {
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Calcular cuántos items mostrar según el tamaño de pantalla
  const itemsToShow = 4;
  const maxIndex = Math.max(0, anuncios.length - itemsToShow);

  // Auto-scroll
  useEffect(() => {
    if (!isAutoPlaying || anuncios.length <= itemsToShow) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % (maxIndex + 1));
    }, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, anuncios.length, maxIndex, itemsToShow]);

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
      setCurrentIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  if (!anuncios || anuncios.length === 0) {
    return (
      <div className="w-full py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mb-4">
              <Tag className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No hay anuncios en esta categoría</h3>
            <p className="text-gray-500">Sé el primero en publicar un anuncio en {categoria}</p>
          </div>
        </div>
      </div>
    );
  }

  // Obtener el color de la categoría
  const getCategoryColor = () => {
    const colors: Record<string, { gradient: string; bg: string; text: string; shadow: string }> = {
      'Imobiliare': { gradient: 'from-violet-500 to-purple-600', bg: 'bg-violet-50', text: 'text-violet-600', shadow: 'shadow-violet-500/30' },
      'Auto moto': { gradient: 'from-red-500 to-rose-600', bg: 'bg-red-50', text: 'text-red-600', shadow: 'shadow-red-500/30' },
      'Locuri de muncă': { gradient: 'from-emerald-500 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600', shadow: 'shadow-emerald-500/30' },
      'Matrimoniale': { gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50', text: 'text-pink-600', shadow: 'shadow-pink-500/30' },
      'Servicii': { gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600', shadow: 'shadow-amber-500/30' },
      'Electronice': { gradient: 'from-cyan-500 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-600', shadow: 'shadow-cyan-500/30' },
      'Modă și accesorii': { gradient: 'from-fuchsia-500 to-pink-600', bg: 'bg-fuchsia-50', text: 'text-fuchsia-600', shadow: 'shadow-fuchsia-500/30' },
      'Animale': { gradient: 'from-orange-500 to-amber-600', bg: 'bg-orange-50', text: 'text-orange-600', shadow: 'shadow-orange-500/30' },
      'Casă și grădină': { gradient: 'from-lime-500 to-green-600', bg: 'bg-lime-50', text: 'text-lime-600', shadow: 'shadow-lime-500/30' },
      'Timp liber și sport': { gradient: 'from-sky-500 to-blue-600', bg: 'bg-sky-50', text: 'text-sky-600', shadow: 'shadow-sky-500/30' },
      'Mama și copilul': { gradient: 'from-rose-500 to-pink-600', bg: 'bg-rose-50', text: 'text-rose-600', shadow: 'shadow-rose-500/30' },
      'Cazare turism': { gradient: 'from-teal-500 to-cyan-600', bg: 'bg-teal-50', text: 'text-teal-600', shadow: 'shadow-teal-500/30' },
      'Otros': { gradient: 'from-slate-500 to-gray-600', bg: 'bg-slate-50', text: 'text-slate-600', shadow: 'shadow-slate-500/30' },
    };
    return colors[categoria] || colors['Otros'];
  };

  const categoryColor = getCategoryColor();

  // Nombre de categoría en español
  const categoryLabels: Record<string, string> = {
    'Imobiliare': 'Inmuebles',
    'Auto moto': 'Vehículos',
    'Locuri de muncă': 'Empleo',
    'Matrimoniale': 'Contactos',
    'Servicii': 'Servicios',
    'Electronice': 'Electrónica',
    'Modă și accesorii': 'Moda',
    'Animale': 'Mascotas',
    'Casă și grădină': 'Hogar',
    'Timp liber și sport': 'Deporte',
    'Mama și copilul': 'Bebé',
    'Cazare turism': 'Turismo',
    'Otros': 'Otros',
  };

  return (
    <section className="w-full py-10 relative">
      {/* Background limpio */}
      <div className="absolute inset-0 bg-gray-50/30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header - Elegante */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900 text-white">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-medium text-gray-900 tracking-tight">
                {categoryLabels[categoria] || categoria}
              </h2>
              <p className="text-sm text-gray-400 tracking-wide">
                {anuncios.length} anuncios
              </p>
            </div>
          </div>
          
          {/* Navigation Buttons - Elegante */}
          {anuncios.length > itemsToShow && (
            <div className="hidden sm:flex items-center gap-2">
              <button 
                onClick={() => scrollTo('prev')}
                disabled={currentIndex === 0}
                className="p-2.5 rounded-full bg-white border border-gray-200/60 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-gray-600"
              >
                <ChevronLeft size={18} />
              </button>
              <button 
                onClick={() => scrollTo('next')}
                disabled={currentIndex >= maxIndex}
                className="p-2.5 rounded-full bg-white border border-gray-200/60 hover:border-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-gray-600"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Slider */}
        <div className="relative overflow-hidden" ref={containerRef}>
          <div 
            className="flex gap-4 transition-transform duration-500 ease-out"
            style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow + 1)}%)` }}
          >
            {anuncios.map((anuncio, idx) => (
              <div key={anuncio.id} className="w-full sm:w-1/2 lg:w-1/4 flex-shrink-0">
                <AnuncioCard 
                  anuncio={anuncio} 
                  isFavorite={favoritos.has(anuncio.id)}
                  onToggleFavorite={handleToggleFavorite}
                  categoryColor={categoryColor}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Dots indicator */}
        {anuncios.length > itemsToShow && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setCurrentIndex(idx);
                  setIsAutoPlaying(false);
                }}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx === currentIndex 
                    ? `w-8 bg-gradient-to-r ${categoryColor.gradient}` 
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// Componente de tarjeta de anuncio
function AnuncioCard({ 
  anuncio, 
  isFavorite, 
  onToggleFavorite,
  categoryColor 
}: { 
  anuncio: any; 
  isFavorite: boolean; 
  onToggleFavorite: (e: React.MouseEvent, id: string) => void;
  categoryColor: { gradient: string; bg: string; text: string; shadow: string };
}) {
  const [imgError, setImgError] = useState(false);
  const isPromo = anuncio.promocion;
  const isVIP = anuncio.promocion?.tipo === 'VIP';
  const isPremium = anuncio.promocion?.tipo === 'Premium';

  return (
    <Link href={`/ad/${anuncio.id}`}>
      <div className={`
        group relative bg-white rounded-2xl overflow-hidden
        transition-all duration-500 cursor-pointer
        border-2 ${isVIP ? 'border-pink-200' : isPremium ? 'border-amber-200' : 'border-gray-100'}
        hover:border-gray-200 hover:shadow-2xl hover:-translate-y-2
        ${isVIP ? 'ring-2 ring-pink-500/20 shadow-lg shadow-pink-500/10' : ''}
        ${isPremium ? 'ring-2 ring-amber-500/20 shadow-lg shadow-amber-500/10' : ''}
      `}>
        {/* Badge de promoción */}
        {isPromo && (
          <div className={`
            absolute top-3 left-3 z-20 px-3 py-1.5 rounded-full
            flex items-center gap-1.5 text-xs font-bold text-white shadow-lg
            ${isVIP 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/40' 
              : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/40'}
          `}>
            {isVIP ? <Crown className="w-3.5 h-3.5" /> : <Gem className="w-3.5 h-3.5" />}
            {isVIP ? 'VIP' : 'Premium'}
          </div>
        )}

        {/* Imagen */}
        <div className="relative h-44 overflow-hidden">
          <Image
            src={imgError ? '/placeholder.jpg' : (anuncio.imagenes?.[0] || '/placeholder.jpg')}
            alt={anuncio.titulo}
            fill
            sizes="(max-width: 768px) 50vw, 280px"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            onError={() => setImgError(true)}
          />
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Favorite button */}
          <button
            onClick={(e) => onToggleFavorite(e, anuncio.id)}
            className={`
              absolute top-3 right-3 z-20 p-2.5 rounded-xl
              transition-all duration-300 shadow-lg
              ${isFavorite 
                ? 'bg-red-500 text-white scale-110' 
                : 'bg-white/95 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110'}
            `}
          >
            <Heart size={18} fill={isFavorite ? 'currentColor' : 'none'} />
          </button>

          {/* Image count badge */}
          {anuncio.imagenes?.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span>+{anuncio.imagenes.length - 1}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-gray-700 transition-colors text-sm leading-tight">
            {anuncio.titulo}
          </h3>
          
          {/* Precio */}
          <div className={`text-xl font-black mb-2 ${categoryColor.text}`}>
            {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
          </div>
          
          {/* Ubicación */}
          <div className="flex items-center gap-1.5 text-gray-500 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span className="truncate">{anuncio.provincia || anuncio.ubicacion || 'España'}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
