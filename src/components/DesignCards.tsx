"use client";

import { Anuncio } from '@/types';
import Image from 'next/image';
import { Heart, MapPin, Eye, Crown, Star, Sparkles, ArrowRight, ShoppingBag, Bookmark, Clock, Tag, ChevronRight, Gem, Zap, Camera } from 'lucide-react';
import { useDesign, DesignStyle } from '@/contexts/DesignContext';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface DesignCardProps {
  anuncio: Anuncio;
  onClick?: () => void;
  variant?: 'default' | 'compact' | 'horizontal' | 'featured';
}

// ==========================================
// CARD DISEÑO: ELEGANTE AZUL
// Profesional con bordes suaves y gradientes azules
// ==========================================

export function EleganteAzulCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="design-card group cursor-pointer bg-gradient-to-b from-white to-slate-50 rounded-2xl border border-slate-200 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-300 hover:-translate-y-2"
    >
      {/* Imagen */}
      <div className="design-image-wrapper relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              } group-hover:scale-110`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de promoción - Esquina superior izquierda con diseño elegante */}
        {isPromo && (
          <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-white text-xs font-semibold backdrop-blur-sm shadow-lg ${
            isVIP 
              ? 'bg-gradient-to-r from-blue-700 to-blue-500 shadow-blue-500/30' 
              : isPremium 
                ? 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-cyan-500/30'
                : 'bg-gradient-to-r from-slate-600 to-slate-400 shadow-slate-500/30'
          }`}>
            {isVIP ? <Crown size={12} /> : isPremium ? <Star size={12} /> : <Sparkles size={12} />}
            <span className="tracking-wide">{isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}</span>
          </div>
        )}

        {/* Botón favorito - Diseño elegante circular */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-md shadow-lg ${
            fav 
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white scale-110' 
              : 'bg-white/90 text-slate-400 hover:bg-blue-500 hover:text-white hover:scale-110'
          }`}
        >
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Indicadores de imagen */}
        {imageCount > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {anuncio.imagenes?.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex 
                    ? 'bg-white w-6' 
                    : 'bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
            {imageCount > 5 && (
              <span className="text-white/80 text-xs ml-1">+{imageCount - 5}</span>
            )}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Precio destacado */}
        <div className={`inline-block mb-3 px-4 py-2 rounded-xl font-bold text-lg shadow-sm ${
          isVIP 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white' 
            : isPremium 
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white'
              : 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800'
        }`}>
          {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
        </div>

        {/* Título */}
        <h3 className="font-semibold text-slate-800 text-base line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors leading-snug">
          {anuncio.titulo}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
            <MapPin size={12} className="text-blue-600" />
          </div>
          <span className="truncate">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
        </div>

        {/* Footer con stats */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <Eye size={14} /> {anuncio.vistas || 0}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={14} /> {anuncio.favoritos || 0}
            </span>
          </div>
          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD ELEGANTE AZUL - VARIANTE GLASSMORPHISM
// Con efecto cristal y blur
// ==========================================

export function EleganteAzulGlassCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer relative rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/20"
    >
      {/* Imagen de fondo completa */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-700 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-110`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
          />
        )}
        
        {/* Overlay gradiente */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent" />
        
        {/* Badge promoción - Cristal */}
        {isPromo && (
          <div className={`absolute top-4 left-4 z-20 px-4 py-2 rounded-2xl backdrop-blur-xl border text-white text-xs font-semibold flex items-center gap-2 ${
            isVIP 
              ? 'bg-blue-500/30 border-blue-400/50 shadow-lg shadow-blue-500/20' 
              : isPremium 
                ? 'bg-cyan-500/30 border-cyan-400/50 shadow-lg shadow-cyan-500/20'
                : 'bg-white/20 border-white/30'
          }`}>
            {isVIP ? <Gem size={14} /> : isPremium ? <Zap size={14} /> : <Sparkles size={14} />}
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}
          </div>
        )}

        {/* Favorito - Cristal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-4 right-4 z-20 w-11 h-11 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all duration-300 ${
            fav 
              ? 'bg-rose-500/80 border-rose-400 text-white' 
              : 'bg-white/20 border-white/30 text-white hover:bg-rose-500/60 hover:border-rose-400'
          }`}
        >
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>

        {/* Contador de imágenes */}
        {imageCount > 1 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-xs flex items-center gap-1.5">
            <Camera size={12} />
            {currentImageIndex + 1}/{imageCount}
          </div>
        )}

        {/* Contenido en la parte inferior con glassmorphism */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <div className="backdrop-blur-xl bg-white/10 rounded-2xl border border-white/20 p-4 shadow-2xl">
            {/* Precio */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-bold text-white">
                {anuncio.precio?.toLocaleString('es-ES')}
              </span>
              <span className="text-sm text-white/70">
                {anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}
              </span>
            </div>
            
            {/* Título */}
            <h3 className="font-semibold text-white text-sm line-clamp-2 mb-3">
              {anuncio.titulo}
            </h3>
            
            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-white/60 text-xs">
                <MapPin size={12} />
                <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
              </div>
              <div className="flex items-center gap-3 text-white/60 text-xs">
                <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD ELEGANTE AZUL - VARIANTE HORIZONTAL
// Para listas o vistas compactas
// ==========================================

export function EleganteAzulHorizontalCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer flex bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:border-blue-200"
    >
      {/* Imagen izquierda */}
      <div className="relative w-32 h-32 flex-shrink-0 overflow-hidden">
        <Image
          src={anuncio.imagenes?.[0] || '/placeholder.jpg'}
          alt={anuncio.titulo}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {isPromo && (
          <div className={`absolute top-2 left-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${
            isVIP ? 'bg-blue-600' : isPremium ? 'bg-cyan-500' : 'bg-slate-500'
          }`}>
            {isVIP ? <Crown size={12} /> : isPremium ? <Star size={12} /> : <Sparkles size={12} />}
          </div>
        )}
      </div>
      
      {/* Contenido derecho */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
            {anuncio.titulo}
          </h3>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <MapPin size={10} />
            <span>{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-blue-600">
            {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              fav ? 'bg-rose-100 text-rose-500' : 'bg-slate-100 text-slate-400 hover:bg-rose-100 hover:text-rose-500'
            }`}
          >
            <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>
      </div>
    </div>
  );
}


// ==========================================
// CARD DISEÑO: MINIMALISTA NOIR
// Sofisticado con líneas limpias y contraste alto
// ==========================================

export function MinimalistNoirCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setCurrentImageIndex(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="design-card group cursor-pointer bg-white border border-zinc-200 overflow-hidden transition-all duration-300 hover:border-zinc-900 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]"
      style={{ borderRadius: '2px' }}
    >
      {/* Imagen */}
      <div className="design-image-wrapper relative aspect-square overflow-hidden bg-zinc-100">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-300 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } ${isHovered ? 'scale-105 grayscale-0' : 'grayscale-[15%]'}`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className={`object-cover transition-all duration-300 ${isHovered ? 'scale-105 grayscale-0' : 'grayscale-[15%]'}`}
          />
        )}
        
        {/* Badge de promoción - Minimalista */}
        {isPromo && (
          <div className={`absolute top-0 left-0 z-20 px-3 py-1 text-white text-[10px] font-medium tracking-[2px] uppercase ${
            isVIP 
              ? 'bg-zinc-900' 
              : isPremium 
                ? 'bg-zinc-700'
                : 'bg-zinc-500'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'PREM' : 'DEST'}
          </div>
        )}

        {/* Botón favorito - Minimalista */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`design-favorite-btn absolute top-3 right-3 z-20 w-9 h-9 flex items-center justify-center transition-all duration-200 ${
            fav 
              ? 'bg-zinc-900 text-white' 
              : 'bg-white border border-zinc-300 text-zinc-400 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'
          }`}
          style={{ borderRadius: '0' }}
        >
          <Bookmark size={16} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>

        {/* Barra de progreso de imágenes */}
        {imageCount > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-0.5 bg-zinc-300 flex">
            {anuncio.imagenes?.map((_, idx) => (
              <div
                key={idx}
                className={`flex-1 transition-colors duration-150 ${
                  idx === currentImageIndex ? 'bg-zinc-900' : ''
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Precio - Estilo tipográfico bold */}
        <div className="mb-2">
          <span className="text-2xl font-bold text-zinc-900 tracking-tight">
            {anuncio.precio?.toLocaleString('es-ES')}
          </span>
          <span className="text-sm font-medium text-zinc-500 ml-1">
            {anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}
          </span>
        </div>

        {/* Título */}
        <h3 className="font-medium text-zinc-800 text-sm line-clamp-2 mb-3 leading-relaxed tracking-tight">
          {anuncio.titulo}
        </h3>

        {/* Ubicación y stats en línea */}
        <div className="flex items-center justify-between text-xs text-zinc-400 pt-3 border-t border-zinc-100">
          <span className="truncate max-w-[60%] uppercase tracking-wide">
            {anuncio.ubicacion || anuncio.provincia || 'España'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye size={12} strokeWidth={1.5} /> {anuncio.vistas || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD MINIMALISTA NOIR - VARIANTE MAGAZINE
// Estilo editorial de revista de moda
// ==========================================

export function MinimalistNoirMagazineCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setCurrentImageIndex(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="group cursor-pointer"
    >
      {/* Imagen con marco estilo polaroid */}
      <div className="bg-white p-2 pb-16 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] group-hover:-translate-y-1 group-hover:rotate-1">
        <div className="relative aspect-square overflow-hidden bg-zinc-100">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className={`object-cover transition-all duration-500 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'grayscale-0 contrast-105' : 'grayscale-[20%]'}`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${isHovered ? 'grayscale-0' : 'grayscale-[20%]'}`}
            />
          )}
          
          {/* Badge minimalista vertical */}
          {isPromo && (
            <div className={`absolute top-0 right-4 z-20 px-2 py-4 text-white text-[9px] font-medium tracking-[3px] uppercase writing-mode-vertical ${
              isVIP ? 'bg-zinc-900' : isPremium ? 'bg-zinc-700' : 'bg-zinc-500'
            }`} style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
              {isVIP ? 'VIP' : isPremium ? 'PREMIUM' : 'DESTACADO'}
            </div>
          )}
          
          {/* Botón favorito esquina */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`absolute bottom-3 left-3 z-20 w-8 h-8 flex items-center justify-center transition-all ${
              fav 
                ? 'bg-zinc-900 text-white' 
                : 'bg-white/90 text-zinc-400 hover:bg-zinc-900 hover:text-white'
            }`}
          >
            <Heart size={14} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        </div>
        
        {/* Contenido estilo revista */}
        <div className="absolute bottom-2 left-2 right-2 text-center">
          <p className="text-3xl font-light text-zinc-900 tracking-tight">
            {anuncio.precio?.toLocaleString('es-ES')}
            <span className="text-xs ml-1 text-zinc-500">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
          </p>
          <h3 className="text-[10px] text-zinc-500 uppercase tracking-[2px] line-clamp-1 mt-1">
            {anuncio.titulo}
          </h3>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD MINIMALISTA NOIR - VARIANTE OVERLAY
// Información sobre la imagen
// ==========================================

export function MinimalistNoirOverlayCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setCurrentImageIndex(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="group cursor-pointer relative aspect-[4/5] overflow-hidden bg-zinc-900"
    >
      {/* Imagen */}
      {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
        anuncio.imagenes.map((img, idx) => (
          <Image
            key={idx}
            src={img || '/placeholder.jpg'}
            alt={anuncio.titulo}
            fill
            className={`object-cover transition-all duration-700 ${
              idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
            } ${isHovered ? 'scale-110 brightness-50' : 'scale-100 brightness-75'}`}
          />
        ))
      ) : (
        <Image
          src="/placeholder.jpg"
          alt={anuncio.titulo}
          fill
          className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-50' : 'scale-100 brightness-75'}`}
        />
      )}
      
      {/* Badge promoción - línea superior */}
      {isPromo && (
        <div className={`absolute top-0 left-0 right-0 h-1 ${
          isVIP ? 'bg-white' : isPremium ? 'bg-zinc-400' : 'bg-zinc-600'
        }`} />
      )}

      {/* Favorito */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleFav(anuncio.id!);
        }}
        className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
          fav ? 'text-white' : 'text-white/50 hover:text-white'
        } ${isHovered ? 'opacity-100' : 'opacity-0'}`}
      >
        <Heart size={20} fill={fav ? 'currentColor' : 'none'} strokeWidth={1} />
      </button>

      {/* Contenido overlay */}
      <div className={`absolute inset-0 flex flex-col justify-end p-5 transition-all duration-500 ${
        isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-80'
      }`}>
        {/* Línea decorativa */}
        <div className="w-8 h-px bg-white mb-4" />
        
        {/* Precio grande */}
        <p className="text-4xl font-extralight text-white tracking-tighter mb-2">
          {anuncio.precio?.toLocaleString('es-ES')}
          <span className="text-sm ml-2 font-normal tracking-wide opacity-60">
            {anuncio.moneda === 'LEI' ? 'LEI' : 'EUR'}
          </span>
        </p>
        
        {/* Título */}
        <h3 className="text-sm text-white/80 font-light tracking-wide line-clamp-2 mb-3">
          {anuncio.titulo}
        </h3>
        
        {/* Footer minimalista */}
        <div className={`flex items-center justify-between text-[10px] text-white/40 uppercase tracking-[2px] transition-all duration-500 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <span>{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={10} /> {anuncio.vistas || 0}</span>
          </span>
        </div>
      </div>
      
      {/* Indicador de imágenes */}
      {imageCount > 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 flex">
          {anuncio.imagenes?.map((_, idx) => (
            <div
              key={idx}
              className={`flex-1 transition-colors duration-200 ${
                idx === currentImageIndex ? 'bg-white' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// CARD MINIMALISTA NOIR - VARIANTE SPLIT
// Diseño dividido vertical
// ==========================================

export function MinimalistNoirSplitCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      className="group cursor-pointer flex flex-col bg-white border border-zinc-100 overflow-hidden transition-all duration-300 hover:border-zinc-900"
    >
      {/* Imagen superior */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={anuncio.imagenes?.[0] || '/placeholder.jpg'}
          alt={anuncio.titulo}
          fill
          className="object-cover grayscale-[10%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
        />
        {isPromo && (
          <div className="absolute bottom-0 left-0 px-3 py-1 bg-zinc-900 text-white text-[9px] font-medium tracking-[2px] uppercase">
            {isVIP ? 'VIP' : isPremium ? 'PREM' : 'DEST'}
          </div>
        )}
      </div>
      
      {/* Contenido inferior */}
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-xs text-zinc-600 font-medium uppercase tracking-wide line-clamp-2 flex-1">
            {anuncio.titulo}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`flex-shrink-0 transition-colors ${
              fav ? 'text-zinc-900' : 'text-zinc-300 hover:text-zinc-900'
            }`}
          >
            <Bookmark size={16} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
        </div>
        
        <div className="mt-auto pt-3 border-t border-zinc-100 flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-zinc-900 tracking-tight leading-none">
              {anuncio.precio?.toLocaleString('es-ES')}
            </p>
            <p className="text-[10px] text-zinc-400 uppercase tracking-wider mt-1">
              {anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}
            </p>
          </div>
          <ChevronRight size={16} className="text-zinc-300 group-hover:text-zinc-900 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}


// ==========================================
// SELECTOR AUTOMÁTICO DE CARD SEGÚN DISEÑO Y VARIANTE
// ==========================================

export function DesignCard({ anuncio, onClick }: DesignCardProps) {
  const { design, cardVariant } = useDesign();

  // Diseño Minimalista Noir
  if (design === 'minimalista-noir') {
    switch (cardVariant) {
      case 'elegante':
        return <MinimalistNoirOverlayCard anuncio={anuncio} onClick={onClick} />;
      case 'minimal':
        return <MinimalistNoirMagazineCard anuncio={anuncio} onClick={onClick} />;
      case 'soft':
        return <MinimalistNoirSplitCard anuncio={anuncio} onClick={onClick} />;
      default:
        return <MinimalistNoirCard anuncio={anuncio} onClick={onClick} />;
    }
  }
  
  // Diseño Clásico Profesional
  if (design === 'clasico-profesional') {
    switch (cardVariant) {
      case 'elegante':
        return <ClasicoProfesionalEleganteCard anuncio={anuncio} onClick={onClick} />;
      case 'minimal':
        return <ClasicoProfesionalMinimalCard anuncio={anuncio} onClick={onClick} />;
      case 'soft':
        return <ClasicoProfesionalSoftCard anuncio={anuncio} onClick={onClick} />;
      case 'nordic':
        return <ClasicoProfesionalNordicCard anuncio={anuncio} onClick={onClick} />;
      default:
        return <ClasicoProfesionalCard anuncio={anuncio} onClick={onClick} />;
    }
  }

  // Diseño Elegante Azul
  if (design === 'elegante-azul') {
    return <EleganteAzulCard anuncio={anuncio} onClick={onClick} />;
  }

  // Para el diseño default, retornar null y usar el card original
  return null;
}

// ==========================================
// CATEGORÍAS SEGÚN DISEÑO
// ==========================================

interface DesignCategoryProps {
  name: string;
  icon: React.ReactNode;
  isActive?: boolean;
  onClick?: () => void;
}

export function EleganteAzulCategory({ name, icon, isActive, onClick }: DesignCategoryProps) {
  return (
    <button 
      onClick={onClick}
      className={`design-category flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-300 ${
        isActive 
          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25 scale-105' 
          : 'bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 text-blue-700 hover:from-blue-100 hover:to-blue-50 hover:scale-105'
      }`}
    >
      <span className={`text-lg ${isActive ? 'text-white' : 'text-blue-500'}`}>{icon}</span>
      <span className="font-medium whitespace-nowrap">{name}</span>
    </button>
  );
}

export function MinimalistNoirCategory({ name, icon, isActive, onClick }: DesignCategoryProps) {
  return (
    <button 
      onClick={onClick}
      className={`design-category flex items-center gap-2 px-4 py-2 transition-all duration-200 ${
        isActive 
          ? 'bg-zinc-900 text-white' 
          : 'bg-transparent border border-zinc-300 text-zinc-600 hover:bg-zinc-900 hover:text-white hover:border-zinc-900'
      }`}
      style={{ borderRadius: '0' }}
    >
      <span className="text-base">{icon}</span>
      <span className="text-xs font-medium uppercase tracking-[1px] whitespace-nowrap">{name}</span>
    </button>
  );
}

export function DesignCategory({ name, icon, isActive, onClick }: DesignCategoryProps) {
  const { design } = useDesign();

  switch (design) {
    case 'elegante-azul':
      return <EleganteAzulCategory name={name} icon={icon} isActive={isActive} onClick={onClick} />;
    case 'minimalista-noir':
      return <MinimalistNoirCategory name={name} icon={icon} isActive={isActive} onClick={onClick} />;
    default:
      return null;
  }
}

// ==========================================
// SECCIÓN HEADER SEGÚN DISEÑO
// ==========================================

interface DesignSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export function EleganteAzulSectionHeader({ title, subtitle, icon }: DesignSectionHeaderProps) {
  return (
    <div className="design-section-header bg-gradient-to-r from-blue-700 via-blue-600 to-blue-500 rounded-2xl p-6 mb-6 shadow-xl shadow-blue-500/20">
      <div className="flex items-center gap-3">
        {icon && <span className="text-3xl text-white/90">{icon}</span>}
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-blue-100 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

export function MinimalistNoirSectionHeader({ title, subtitle }: DesignSectionHeaderProps) {
  return (
    <div className="design-section-header border-b-2 border-zinc-900 pb-4 mb-8">
      <h2 className="text-xl font-bold text-zinc-900 uppercase tracking-[2px]">{title}</h2>
      {subtitle && <p className="text-zinc-500 text-xs uppercase tracking-wider mt-2">{subtitle}</p>}
    </div>
  );
}

export function DesignSectionHeader({ title, subtitle, icon }: DesignSectionHeaderProps) {
  const { design } = useDesign();

  switch (design) {
    case 'elegante-azul':
      return <EleganteAzulSectionHeader title={title} subtitle={subtitle} icon={icon} />;
    case 'minimalista-noir':
      return <MinimalistNoirSectionHeader title={title} subtitle={subtitle} />;
    case 'clasico-profesional':
      return <ClasicoProfesionalSectionHeader title={title} subtitle={subtitle} icon={icon} />;
    default:
      return null;
  }
}

// ==========================================
// DISEÑO: CLÁSICO PROFESIONAL
// Elegancia atemporal con acabados premium dorados
// ==========================================

// ==========================================
// CARD CLÁSICO PROFESIONAL - ESTÁNDAR
// Diseño elegante con acentos dorados
// ==========================================

export function ClasicoProfesionalCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-gradient-to-b from-amber-50 to-orange-50 rounded-xl border-2 border-amber-200 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-amber-500/20 hover:border-amber-400 hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Overlay dorado */}
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Badge de promoción con estilo clásico */}
        {isPromo && (
          <div className={`absolute top-3 left-3 z-20 px-4 py-1.5 rounded-full flex items-center gap-2 text-xs font-bold shadow-lg ${
            isVIP 
              ? 'bg-gradient-to-r from-amber-700 to-amber-500 text-white' 
              : isPremium 
                ? 'bg-gradient-to-r from-yellow-600 to-yellow-400 text-amber-900'
                : 'bg-gradient-to-r from-orange-200 to-amber-100 text-amber-800'
          }`}>
            {isVIP ? <Crown size={14} /> : isPremium ? <Star size={14} /> : <Sparkles size={14} />}
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}
          </div>
        )}

        {/* Botón favorito estilo dorado */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-3 right-3 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
            fav 
              ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white' 
              : 'bg-white/95 text-amber-600 hover:bg-amber-500 hover:text-white'
          }`}
        >
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>

        {/* Indicadores de imagen estilo dorado */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
            {anuncio.imagenes?.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex 
                    ? 'bg-amber-400 w-6' 
                    : 'bg-white/60 w-1.5'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Precio con estilo premium */}
        <div className={`inline-flex items-baseline gap-1 mb-3 px-4 py-2 rounded-lg ${
          isVIP 
            ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white' 
            : 'bg-amber-100 text-amber-800'
        }`}>
          <span className="text-xl font-bold">{anuncio.precio?.toLocaleString('es-ES')}</span>
          <span className="text-sm font-medium">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
        </div>

        {/* Título */}
        <h3 className="font-semibold text-amber-900 text-sm line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
          {anuncio.titulo}
        </h3>

        {/* Ubicación */}
        <div className="flex items-center gap-2 text-xs text-amber-700/70 mb-3">
          <MapPin size={12} className="text-amber-500" />
          <span className="truncate">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-amber-200/50">
          <div className="flex items-center gap-4 text-xs text-amber-600/60">
            <span className="flex items-center gap-1"><Eye size={12} /> {anuncio.vistas || 0}</span>
            <span className="flex items-center gap-1"><Heart size={12} /> {anuncio.favoritos || 0}</span>
          </div>
          <ArrowRight size={14} className="text-amber-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - LUXURY
// Estilo ultra lujoso con bordes dorados
// ==========================================

export function ClasicoProfesionalLuxuryCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isPromo = isVIP || isPremium;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer relative"
    >
      {/* Marco dorado exterior */}
      <div className="absolute -inset-1 bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity blur-sm" />
      
      <div className="relative bg-gradient-to-b from-stone-900 to-stone-950 rounded-xl overflow-hidden">
        {/* Imagen */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className={`object-cover transition-all duration-700 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-110`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}
          
          {/* Overlay elegante */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/50 to-transparent" />
          
          {/* Badge VIP luxury */}
          {isPromo && (
            <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-sm border text-xs font-medium tracking-widest uppercase ${
              isVIP 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900 border-amber-300' 
                : 'bg-stone-900/80 text-amber-400 border-amber-500/50'
            }`}>
              {isVIP ? '✦ VIP ✦' : '★ Premium'}
            </div>
          )}

          {/* Favorito luxury */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-sm flex items-center justify-center transition-all duration-300 ${
              fav 
                ? 'bg-amber-500 text-stone-900' 
                : 'bg-stone-900/80 border border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-stone-900'
            }`}
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
          </button>
          
          {/* Precio en esquina inferior */}
          <div className="absolute bottom-4 left-4 z-20">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-400 px-4 py-2 rounded-sm">
              <span className="text-xl font-bold text-stone-900">{anuncio.precio?.toLocaleString('es-ES')}</span>
              <span className="text-sm text-stone-700 ml-1">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-5 border-t border-amber-500/20">
          <h3 className="font-semibold text-amber-100 text-sm line-clamp-2 mb-3 group-hover:text-amber-400 transition-colors">
            {anuncio.titulo}
          </h3>
          
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-amber-500/70">
              <MapPin size={12} />
              <span className="truncate max-w-[120px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
            </div>
            <div className="flex items-center gap-3 text-amber-500/50">
              <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - ELEGANTE
// Sofisticado con sombras suaves y tipografía refinada
// ==========================================

export function ClasicoProfesionalEleganteCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-white rounded-lg shadow-[0_4px_30px_rgba(217,119,6,0.08)] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgba(217,119,6,0.18)] hover:-translate-y-2 border border-amber-100"
    >
      {/* Imagen */}
      <div className="relative aspect-[5/4] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-600 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-600"
          />
        )}
        
        {/* Badge esquina elegante */}
        {isPromo && (
          <div className={`absolute top-0 right-0 z-20 px-4 py-2 text-xs font-semibold tracking-wide ${
            isVIP 
              ? 'bg-amber-700 text-amber-100' 
              : isPremium 
                ? 'bg-amber-500 text-white'
                : 'bg-amber-200 text-amber-800'
          }`} style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 20% 100%)' }}>
            {isVIP ? 'VIP' : isPremium ? 'PREMIUM' : 'DESTACADO'}
          </div>
        )}

        {/* Favorito minimalista */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute bottom-3 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
            fav 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/90 text-amber-700 hover:bg-amber-500 hover:text-white'
          }`}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Título primero - elegante */}
        <h3 className="font-serif text-lg text-amber-900 line-clamp-2 mb-3 group-hover:text-amber-700 transition-colors leading-snug">
          {anuncio.titulo}
        </h3>
        
        {/* Precio grande */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-2xl font-bold text-amber-600">{anuncio.precio?.toLocaleString('es-ES')}</span>
          <span className="text-sm text-amber-500/70 font-medium">{anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}</span>
        </div>

        {/* Separador dorado */}
        <div className="w-12 h-0.5 bg-gradient-to-r from-amber-400 to-amber-200 mb-3" />

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-amber-600/60">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
            <span className="flex items-center gap-1"><Heart size={11} /> {anuncio.favoritos || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - ROYAL
// Diseño real con marcos ornamentales
// ==========================================

export function ClasicoProfesionalRoyalCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isPromo = isVIP || isPremium;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer relative p-3 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100"
    >
      {/* Marco ornamental */}
      <div className="absolute inset-0 border-4 border-amber-300/50" style={{ margin: '6px' }} />
      <div className="absolute inset-0 border border-amber-400/30" style={{ margin: '12px' }} />
      
      {/* Esquinas decorativas */}
      <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-amber-500" />
      <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-amber-500" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-amber-500" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-amber-500" />
      
      <div className="relative bg-white p-1">
        {/* Imagen */}
        <div className="relative aspect-square overflow-hidden">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className={`object-cover transition-all duration-500 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-105`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          
          {/* Corona para VIP */}
          {isPromo && (
            <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-4 py-1.5 rounded-full ${
              isVIP 
                ? 'bg-amber-600 text-amber-100' 
                : 'bg-amber-400 text-amber-900'
            }`}>
              <Crown size={14} />
              <span className="text-xs font-semibold">{isVIP ? 'Royal VIP' : 'Premium'}</span>
            </div>
          )}

          {/* Favorito */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              fav 
                ? 'bg-rose-500 text-white' 
                : 'bg-white/90 text-amber-600 hover:bg-amber-500 hover:text-white'
            }`}
          >
            <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
          </button>
        </div>
        
        {/* Contenido */}
        <div className="p-4 text-center bg-gradient-to-b from-amber-50 to-white">
          {/* Precio con decoración */}
          <div className="relative inline-block mb-2">
            <span className="absolute -left-4 top-1/2 -translate-y-1/2 text-amber-300">✦</span>
            <span className="text-2xl font-bold text-amber-700">{anuncio.precio?.toLocaleString('es-ES')}</span>
            <span className="text-sm text-amber-500 ml-1">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
            <span className="absolute -right-4 top-1/2 -translate-y-1/2 text-amber-300">✦</span>
          </div>
          
          <h3 className="font-serif text-sm text-amber-900 line-clamp-2 mb-2">
            {anuncio.titulo}
          </h3>
          
          <div className="text-xs text-amber-600/60 flex items-center justify-center gap-1">
            <MapPin size={10} />
            {anuncio.ubicacion || anuncio.provincia || 'España'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - EXECUTIVE
// Corporativo y profesional
// ==========================================

export function ClasicoProfesionalExecutiveCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer flex bg-white border border-gray-200 overflow-hidden transition-all duration-300 hover:border-amber-400 hover:shadow-lg"
    >
      {/* Barra lateral dorada */}
      <div className={`w-1.5 flex-shrink-0 ${isVIP ? 'bg-gradient-to-b from-amber-600 to-amber-400' : isPremium ? 'bg-amber-400' : 'bg-amber-200'}`} />
      
      {/* Imagen */}
      <div className="relative w-32 h-36 flex-shrink-0 overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-110`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}
        
        {isPromo && (
          <div className={`absolute bottom-0 left-0 right-0 py-1 text-center text-[10px] font-bold tracking-wider uppercase ${
            isVIP ? 'bg-amber-600 text-white' : isPremium ? 'bg-amber-400 text-amber-900' : 'bg-amber-200 text-amber-700'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Dest.'}
          </div>
        )}
      </div>
      
      {/* Contenido */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-medium text-gray-900 text-sm line-clamp-2 group-hover:text-amber-700 transition-colors">
              {anuncio.titulo}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFav(anuncio.id!);
              }}
              className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center transition-all ${
                fav ? 'bg-rose-100 text-rose-500' : 'bg-gray-100 text-gray-400 hover:bg-amber-100 hover:text-amber-600'
              }`}
            >
              <Heart size={14} fill={fav ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={10} />
            <span className="truncate">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
        </div>
        
        <div className="flex items-end justify-between mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-amber-600">{anuncio.precio?.toLocaleString('es-ES')}</span>
            <span className="text-xs text-amber-500/70">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="flex items-center gap-1"><Eye size={10} /> {anuncio.vistas || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - PRESTIGE
// Premium con degradados sutiles
// ==========================================

export function ClasicoProfesionalPrestigeCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setCurrentImageIndex(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="group cursor-pointer relative overflow-hidden rounded-2xl"
    >
      {/* Fondo con gradiente animado */}
      <div className={`absolute inset-0 bg-gradient-to-br from-amber-200 via-orange-100 to-yellow-200 transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-orange-50" />
      
      <div className="relative p-4">
        {/* Imagen */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl mb-4 shadow-lg">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className={`object-cover transition-all duration-700 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110 brightness-105' : 'scale-100'}`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110 brightness-105' : 'scale-100'}`}
            />
          )}
          
          {/* Overlay con gradiente */}
          <div className="absolute inset-0 bg-gradient-to-t from-amber-900/60 via-transparent to-amber-900/20" />
          
          {/* Badge flotante */}
          {isPromo && (
            <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border ${
              isVIP 
                ? 'bg-amber-500/80 text-white border-amber-400' 
                : isPremium 
                  ? 'bg-yellow-400/80 text-amber-900 border-yellow-300'
                  : 'bg-white/80 text-amber-700 border-amber-200'
            }`}>
              {isVIP ? '★ VIP' : isPremium ? '✦ Premium' : 'Destacado'}
            </div>
          )}

          {/* Favorito prestige */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-300 border ${
              fav 
                ? 'bg-rose-500 text-white border-rose-400' 
                : 'bg-white/80 text-amber-600 border-white/50 hover:bg-amber-500 hover:text-white hover:border-amber-400'
            }`}
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
          </button>

          {/* Precio flotante en imagen */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="bg-white/90 backdrop-blur-md rounded-xl p-3 shadow-lg border border-amber-200/50">
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-bold text-amber-700">{anuncio.precio?.toLocaleString('es-ES')}</span>
                <span className="text-sm font-medium text-amber-500">{anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Contenido */}
        <h3 className="font-semibold text-amber-900 text-sm line-clamp-2 mb-2 group-hover:text-amber-700 transition-colors">
          {anuncio.titulo}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-amber-600/60">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
            <span className="flex items-center gap-1"><Heart size={11} /> {anuncio.favoritos || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - DIAMOND
// Ultra premium con destellos y efectos brillantes
// ==========================================

export function ClasicoProfesionalDiamondCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { setCurrentImageIndex(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      className="group cursor-pointer relative"
    >
      {/* Efecto brillo exterior */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-700`} />
      <div className={`absolute -inset-1 bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent rounded-2xl transition-all duration-1000 ${isHovered ? 'animate-pulse' : ''}`} />
      
      <div className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 rounded-xl overflow-hidden border border-amber-500/20">
        {/* Destellos decorativos */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className={`absolute top-4 left-4 w-2 h-2 bg-amber-400 rounded-full transition-all duration-500 ${isHovered ? 'opacity-100 scale-150' : 'opacity-50'}`} style={{ filter: 'blur(1px)' }} />
          <div className={`absolute top-8 right-6 w-1.5 h-1.5 bg-yellow-300 rounded-full transition-all duration-700 ${isHovered ? 'opacity-100 scale-150' : 'opacity-30'}`} style={{ filter: 'blur(1px)' }} />
          <div className={`absolute bottom-12 left-8 w-1 h-1 bg-amber-300 rounded-full transition-all duration-600 ${isHovered ? 'opacity-100 scale-200' : 'opacity-40'}`} />
        </div>
        
        {/* Imagen */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className={`object-cover transition-all duration-700 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } ${isHovered ? 'scale-110' : 'scale-100'}`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-700 ${isHovered ? 'scale-110' : 'scale-100'}`}
            />
          )}
          
          {/* Overlay premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/50 to-transparent" />
          
          {/* Efecto shimmer en hover */}
          <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent transition-transform duration-1000 ${isHovered ? 'translate-x-full' : '-translate-x-full'}`} />
          
          {/* Badge Diamond */}
          {isPromo && (
            <div className={`absolute top-4 left-4 z-20 px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-bold tracking-wide ${
              isVIP 
                ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-900' 
                : isPremium 
                  ? 'bg-gradient-to-r from-amber-600/80 to-amber-500/80 text-amber-100 backdrop-blur-sm'
                  : 'bg-amber-900/80 text-amber-300 backdrop-blur-sm'
            }`}>
              <Gem size={14} />
              {isVIP ? 'DIAMOND VIP' : isPremium ? 'PREMIUM' : 'DESTACADO'}
            </div>
          )}

          {/* Favorito Diamond */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`absolute top-4 right-4 z-20 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ${
              fav 
                ? 'bg-gradient-to-br from-rose-500 to-pink-600 text-white' 
                : 'bg-stone-900/80 border border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-stone-900 hover:border-transparent backdrop-blur-sm'
            }`}
          >
            <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
          </button>

          {/* Indicador de imágenes */}
          {imageCount > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
              {anuncio.imagenes?.slice(0, 6).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex 
                      ? 'bg-amber-400 w-6' 
                      : 'bg-amber-400/30 w-1'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="relative p-5">
          {/* Línea decorativa dorada */}
          <div className="absolute top-0 left-5 right-5 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          
          {/* Precio destacado */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
              {anuncio.precio?.toLocaleString('es-ES')}
            </span>
            <span className="text-sm text-amber-500/70">{anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}</span>
          </div>
          
          {/* Título */}
          <h3 className="font-medium text-amber-100 text-sm line-clamp-2 mb-3 group-hover:text-amber-300 transition-colors">
            {anuncio.titulo}
          </h3>
          
          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-amber-500/50">
            <div className="flex items-center gap-1.5">
              <MapPin size={12} />
              <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
              <span className="flex items-center gap-1"><Heart size={11} /> {anuncio.favoritos || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - SOFT
// Suave con colores pastel y bordes redondeados
// ==========================================

export function ClasicoProfesionalSoftCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-gradient-to-b from-rose-50 to-white rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-rose-200/50 hover:-translate-y-1 border border-rose-100"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-3xl">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Badge suave */}
        {isPromo && (
          <div className={`absolute top-4 left-4 z-20 px-3 py-1.5 rounded-full text-xs font-medium ${
            isVIP 
              ? 'bg-rose-400/90 text-white' 
              : isPremium 
                ? 'bg-violet-400/90 text-white'
                : 'bg-amber-400/90 text-white'
          }`}>
            {isVIP ? '♥ VIP' : isPremium ? '✦ Premium' : '★ Destacado'}
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 ${
            fav 
              ? 'bg-rose-400 text-white' 
              : 'bg-white/90 text-rose-300 hover:text-rose-500'
          }`}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-5">
        {/* Precio */}
        <p className="text-2xl font-semibold text-rose-600 mb-2">
          {anuncio.precio?.toLocaleString('es-ES')} <span className="text-sm font-normal text-rose-400">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
        </p>
        
        {/* Título */}
        <h3 className="font-medium text-gray-700 text-sm line-clamp-2 mb-3">
          {anuncio.titulo}
        </h3>
        
        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-rose-400/70">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - NORDIC
// Estilo nórdico limpio y sereno
// ==========================================

export function ClasicoProfesionalNordicCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-stone-50 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-stone-200/50 hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Badge nórdico */}
        {isPromo && (
          <div className={`absolute top-3 left-3 z-20 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider ${
            isVIP 
              ? 'bg-stone-800 text-stone-100' 
              : isPremium 
                ? 'bg-stone-600 text-stone-100'
                : 'bg-stone-500 text-stone-100'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center transition-all duration-200 ${
            fav 
              ? 'text-stone-800' 
              : 'text-stone-400 hover:text-stone-700'
          }`}
        >
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
      </div>

      {/* Contenido */}
      <div className="p-4 border-t border-stone-200">
        {/* Precio */}
        <p className="text-xl font-light text-stone-800 mb-1 tracking-tight">
          {anuncio.precio?.toLocaleString('es-ES')} <span className="text-xs text-stone-500">{anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}</span>
        </p>
        
        {/* Título */}
        <h3 className="font-normal text-stone-600 text-sm line-clamp-1 mb-2">
          {anuncio.titulo}
        </h3>
        
        {/* Ubicación */}
        <div className="flex items-center gap-1 text-xs text-stone-400">
          <MapPin size={10} />
          <span className="truncate">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - MONO
// Monocromático puro y elegante
// ==========================================

export function ClasicoProfesionalMonoCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/5 border-b-2 border-black"
    >
      {/* Imagen */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-700 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-110 grayscale group-hover:grayscale-0`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 grayscale group-hover:grayscale-0"
          />
        )}
        
        {/* Badge mono */}
        {isPromo && (
          <div className="absolute top-0 left-0 z-20 bg-black text-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">
            {isVIP ? 'VIP' : isPremium ? 'PRO' : 'NEW'}
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute bottom-3 right-3 z-20 transition-all duration-200 ${
            fav 
              ? 'text-black' 
              : 'text-white/80 hover:text-black'
          }`}
        >
          <Heart size={20} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
        
        {/* Precio sobre imagen */}
        <div className="absolute bottom-3 left-3 z-20">
          <p className="text-2xl font-bold text-white drop-shadow-lg">
            {anuncio.precio?.toLocaleString('es-ES')} <span className="text-sm font-light">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
          </p>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Título */}
        <h3 className="font-medium text-black text-sm line-clamp-1 mb-1 uppercase tracking-wide">
          {anuncio.titulo}
        </h3>
        
        {/* Ubicación */}
        <p className="text-xs text-gray-500 uppercase tracking-wider">
          {anuncio.ubicacion || anuncio.provincia || 'España'}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - MINIMAL
// Minimalista contemporáneo y limpio
// ==========================================

export function ClasicoProfesionalMinimalCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-black/10 hover:-translate-y-1 border border-gray-100"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Badge minimalista */}
        {isPromo && (
          <div className={`absolute top-3 left-3 z-20 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest ${
            isVIP 
              ? 'bg-black text-white' 
              : isPremium 
                ? 'bg-gray-900 text-white'
                : 'bg-gray-700 text-white'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'PRO' : 'HOT'}
          </div>
        )}

        {/* Favorito minimal */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-3 right-3 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
            fav 
              ? 'bg-black text-white' 
              : 'bg-white text-gray-400 hover:text-black'
          }`}
        >
          <Heart size={14} fill={fav ? 'currentColor' : 'none'} strokeWidth={2.5} />
        </button>
        
        {/* Indicadores minimalistas */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1">
            {anuncio.imagenes?.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`h-0.5 rounded-full transition-all duration-200 ${
                  idx === currentImageIndex ? 'w-4 bg-black' : 'w-1.5 bg-black/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Precio grande */}
        <p className="text-2xl font-light text-black mb-1">
          {anuncio.precio?.toLocaleString('es-ES')} <span className="text-sm text-gray-400">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
        </p>
        
        {/* Título */}
        <h3 className="font-normal text-gray-600 text-sm line-clamp-1 mb-2">
          {anuncio.titulo}
        </h3>
        
        {/* Ubicación simple */}
        <p className="text-xs text-gray-400 truncate">
          {anuncio.ubicacion || anuncio.provincia || 'España'}
        </p>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - SLEEK
// Ultra moderno con líneas limpias y gradiente sutil
// ==========================================

export function ClasicoProfesionalSleekCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-xl hover:shadow-blue-100 hover:-translate-y-2 border border-slate-100"
    >
      {/* Imagen con overlay gradiente */}
      <div className="relative aspect-[16/10] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-700 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        
        {/* Overlay gradiente moderno */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-transparent to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        {/* Badge sleek */}
        {isPromo && (
          <div className={`absolute top-4 left-4 z-20 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.15em] backdrop-blur-sm ${
            isVIP 
              ? 'bg-blue-600/90 text-white' 
              : isPremium 
                ? 'bg-indigo-600/90 text-white'
                : 'bg-slate-600/90 text-white'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}
          </div>
        )}

        {/* Favorito sleek */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-4 right-4 z-20 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 backdrop-blur-sm ${
            fav 
              ? 'bg-blue-600 text-white' 
              : 'bg-white/80 text-slate-400 hover:bg-blue-600 hover:text-white'
          }`}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
        
        {/* Precio flotante */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-slate-900/80 to-transparent">
          <span className="text-2xl font-bold text-white">
            {anuncio.precio?.toLocaleString('es-ES')}
          </span>
          <span className="text-sm text-blue-200 ml-2">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="font-semibold text-slate-800 text-sm line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
          {anuncio.titulo}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} className="text-blue-500" />
            <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1"><Eye size={11} /> {anuncio.vistas || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - CORPORATE
// Corporativo formal y ejecutivo
// ==========================================

export function ClasicoProfesionalCorporateCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-white rounded-none overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-slate-200 border-l-4 border-l-emerald-600 border border-slate-200"
    >
      {/* Header corporativo */}
      <div className="px-5 py-3 bg-gradient-to-r from-slate-800 to-slate-700 flex items-center justify-between">
        <span className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          {isPromo ? (isVIP ? '★ VIP' : isPremium ? '★ Premium' : '★ Destacado') : 'Anuncio'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`transition-colors ${fav ? 'text-emerald-400' : 'text-slate-400 hover:text-emerald-400'}`}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} strokeWidth={2} />
        </button>
      </div>

      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
      </div>

      {/* Contenido */}
      <div className="p-5 border-t border-slate-100">
        {/* Precio corporate */}
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-light text-slate-800">{anuncio.precio?.toLocaleString('es-ES')}</span>
          <span className="text-sm text-emerald-600 font-semibold">{anuncio.moneda === 'LEI' ? 'LEI' : 'EUR'}</span>
        </div>
        
        <h3 className="font-medium text-slate-700 text-sm line-clamp-2 mb-3 leading-relaxed">
          {anuncio.titulo}
        </h3>
        
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="truncate max-w-[120px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
          <span className="text-emerald-600 font-medium">Ver más →</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - BOUTIQUE
// Estilo boutique de lujo
// ==========================================

export function ClasicoProfesionalBoutiqueCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer relative bg-gradient-to-b from-amber-50 via-white to-amber-50 p-3 transition-all duration-500 hover:-translate-y-2"
    >
      {/* Marco decorativo */}
      <div className="absolute inset-0 border border-amber-200 rounded-sm" />
      <div className="absolute inset-1 border border-amber-300/50 rounded-sm" />
      
      <div className="relative bg-white rounded-sm overflow-hidden shadow-inner">
        {/* Imagen */}
        <div className="relative aspect-[3/4] overflow-hidden">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                className={`object-cover transition-all duration-700 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                } group-hover:scale-110`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
          )}
          
          {/* Badge boutique */}
          {isPromo && (
            <div className="absolute top-4 left-0 z-20 bg-amber-800 text-amber-100 px-4 py-1.5 text-[10px] font-medium uppercase tracking-[0.2em]"
              style={{ clipPath: 'polygon(0 0, 100% 0, 95% 100%, 0 100%)' }}>
              {isVIP ? 'Exclusivo' : isPremium ? 'Premium' : 'Selección'}
            </div>
          )}

          {/* Favorito */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFav(anuncio.id!);
            }}
            className={`absolute top-4 right-4 z-20 transition-all duration-300 ${
              fav ? 'text-amber-700' : 'text-amber-400 hover:text-amber-700'
            }`}
          >
            <Heart size={22} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
          
          {/* Precio boutique */}
          <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm p-4 text-center border-t border-amber-200">
            <span className="text-2xl font-light text-amber-900 tracking-wide">
              {anuncio.precio?.toLocaleString('es-ES')}
            </span>
            <span className="text-xs text-amber-600 ml-2">{anuncio.moneda === 'LEI' ? 'Lei' : 'EUR'}</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 text-center">
          <h3 className="font-serif text-amber-900 text-sm line-clamp-2 mb-2 italic">
            {anuncio.titulo}
          </h3>
          
          <p className="text-[10px] text-amber-600 uppercase tracking-[0.2em]">
            {anuncio.ubicacion || anuncio.provincia || 'España'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD CLÁSICO PROFESIONAL - EDITORIAL
// Estilo revista profesional
// ==========================================

export function ClasicoProfesionalEditorialCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl"
    >
      {/* Imagen editorial */}
      <div className="relative aspect-[4/5] overflow-hidden">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-700 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        )}
        
        {/* Overlay editorial */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Número de página / badge */}
        {isPromo && (
          <div className="absolute top-4 left-4 z-20 w-10 h-10 bg-red-600 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold uppercase">
              {isVIP ? 'VIP' : isPremium ? 'PRO' : 'TOP'}
            </span>
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-4 right-4 z-20 transition-all duration-200 ${
            fav ? 'text-red-500' : 'text-white/80 hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={fav ? 'currentColor' : 'none'} strokeWidth={1.5} />
        </button>
        
        {/* Contenido sobre imagen */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
          {/* Categoría */}
          <p className="text-red-400 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
            {anuncio.ubicacion || 'Destacado'}
          </p>
          
          {/* Título */}
          <h3 className="font-serif text-white text-lg leading-tight line-clamp-2 mb-3">
            {anuncio.titulo}
          </h3>
          
          {/* Precio */}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-light text-white">
              {anuncio.precio?.toLocaleString('es-ES')} <span className="text-sm text-white/70">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
            </span>
            <div className="flex items-center gap-3 text-white/60 text-xs">
              <span className="flex items-center gap-1"><Eye size={12} /> {anuncio.vistas || 0}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Línea decorativa */}
      <div className="h-1 bg-gradient-to-r from-red-600 via-red-500 to-orange-500" />
    </div>
  );
}

// ==========================================
// CARD DISEÑO: CLEAN MODERN
// Diseño limpio y moderno
// ==========================================

export function CleanModernCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300"
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-500 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        
        {/* Badge */}
        {isPromo && (
          <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-md text-xs font-medium ${
            isVIP 
              ? 'bg-slate-900 text-white' 
              : isPremium 
                ? 'bg-slate-700 text-white'
                : 'bg-slate-500 text-white'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            fav 
              ? 'bg-red-500 text-white' 
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
        
        {/* Indicadores */}
        {imageCount > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5">
            {anuncio.imagenes?.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-xl font-semibold text-gray-900">
            {anuncio.precio?.toLocaleString('es-ES')}
          </span>
          <span className="text-sm text-gray-500">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
        </div>
        
        <h3 className="text-sm text-gray-700 line-clamp-2 mb-3">
          {anuncio.titulo}
        </h3>
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <MapPin size={12} />
            <span className="truncate max-w-[100px]">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <Eye size={11} /> {anuncio.vistas || 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CARD DISEÑO: SOFT MINIMAL
// Suave y minimalista
// ==========================================

export function SoftMinimalCard({ anuncio, onClick }: DesignCardProps) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className="group cursor-pointer bg-zinc-50 rounded-2xl overflow-hidden hover:bg-zinc-100 transition-colors duration-300"
    >
      {/* Imagen */}
      <div className="relative aspect-square overflow-hidden rounded-xl m-2 bg-zinc-200">
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-opacity duration-300 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover"
          />
        )}
        
        {/* Badge simple */}
        {isPromo && (
          <div className={`absolute top-2 left-2 z-10 px-2 py-0.5 rounded text-[10px] font-medium ${
            isVIP 
              ? 'bg-zinc-900 text-zinc-100' 
              : isPremium 
                ? 'bg-zinc-700 text-zinc-100'
                : 'bg-zinc-500 text-zinc-100'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'PRO' : 'HOT'}
          </div>
        )}

        {/* Favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-colors ${
            fav 
              ? 'text-red-500' 
              : 'text-zinc-400 hover:text-zinc-600'
          }`}
        >
          <Heart size={18} fill={fav ? 'currentColor' : 'none'} />
        </button>
        
        {/* Indicadores */}
        {imageCount > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex gap-1">
            {anuncio.imagenes?.slice(0, 5).map((_, idx) => (
              <div
                key={idx}
                className={`w-1 h-1 rounded-full ${
                  idx === currentImageIndex ? 'bg-zinc-800' : 'bg-zinc-400'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="px-3 pb-3">
        <div className="mb-1">
          <span className="text-lg font-medium text-zinc-900">
            {anuncio.precio?.toLocaleString('es-ES')} <span className="text-sm font-normal text-zinc-500">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
          </span>
        </div>
        
        <h3 className="text-sm text-zinc-600 line-clamp-1 mb-2">
          {anuncio.titulo}
        </h3>
        
        <div className="flex items-center gap-1 text-xs text-zinc-400">
          <MapPin size={10} />
          <span>{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CATEGORÍA CLÁSICO PROFESIONAL
// ==========================================

export function ClasicoProfesionalCategory({ name, icon, isActive, onClick }: DesignCategoryProps) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2.5 px-5 py-2.5 rounded-lg transition-all duration-300 border ${
        isActive 
          ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white border-amber-400 shadow-lg shadow-amber-500/25' 
          : 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200 text-amber-800 hover:from-amber-100 hover:to-orange-100 hover:border-amber-300'
      }`}
    >
      <span className={`text-lg ${isActive ? 'text-amber-200' : 'text-amber-600'}`}>{icon}</span>
      <span className="font-medium text-sm whitespace-nowrap">{name}</span>
    </button>
  );
}

// ==========================================
// SECTION HEADER CLÁSICO PROFESIONAL
// ==========================================

export function ClasicoProfesionalSectionHeader({ title, subtitle, icon }: DesignSectionHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-amber-700 via-amber-600 to-orange-600 rounded-xl p-6 mb-6 shadow-xl shadow-amber-500/20 border border-amber-400/30">
      <div className="flex items-center gap-3">
        {icon && <span className="text-3xl text-amber-200">{icon}</span>}
        <div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-amber-200/80 text-sm mt-1">{subtitle}</p>}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// UNIVERSAL CARD - COMPONENTE UNIVERSAL
// Se adapta automáticamente al diseño y variante seleccionados
// Usar este componente en toda la web para consistencia
// ==========================================

interface UniversalCardProps extends DesignCardProps {
  compact?: boolean;
  horizontal?: boolean;
}

export function UniversalCard({ anuncio, onClick, compact = false, horizontal = false }: UniversalCardProps) {
  const { design, cardVariant } = useDesign();
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const isVIP = (anuncio as any).promocion?.tipo === 'VIP';
  const isPremium = (anuncio as any).promocion?.tipo === 'Premium';
  const isDestacado = (anuncio as any).promocion?.tipo === 'Destacado';
  const isPromo = isVIP || isPremium || isDestacado;
  const fav = favoritos.has(anuncio.id!);
  const imageCount = anuncio.imagenes?.length || 1;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (imageCount <= 1) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newIndex = Math.min(Math.floor(percentage * imageCount), imageCount - 1);
    if (newIndex !== currentImageIndex) setCurrentImageIndex(newIndex);
  };

  const handleClick = () => {
    if (onClick) onClick();
    else router.push(`/ad/${anuncio.id}`);
  };

  // Si hay un diseño personalizado, usar el DesignCard correspondiente
  if (design !== 'default') {
    return <DesignCard anuncio={anuncio} onClick={onClick} />;
  }

  // Vista horizontal/lista
  if (horizontal) {
    const borderColor = isPromo 
      ? (isVIP ? 'border-pink-400' : isPremium ? 'border-amber-400' : 'border-purple-400')
      : 'border-purple-400';

    return (
      <div 
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setCurrentImageIndex(0)}
        className={`bg-white overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group rounded-xl border-2 ${borderColor}`}
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
            anuncio.imagenes.map((img, idx) => (
              <Image
                key={idx}
                src={img || '/placeholder.jpg'}
                alt={anuncio.titulo}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className={`object-cover transition-none ${idx === currentImageIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              />
            ))
          ) : (
            <Image
              src="/placeholder.jpg"
              alt={anuncio.titulo}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}
          
          {/* Indicadores de puntos */}
          {imageCount > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
              {anuncio.imagenes?.map((_, idx) => (
                <span 
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`}
                />
              ))}
            </div>
          )}
          
          {/* Badge de categoría */}
          <span className="absolute top-3 left-3 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg z-20 bg-purple-500">
            {anuncio.categoria || 'Sin categoría'}
          </span>
          
          {/* Badge de promoción */}
          {isPromo && (
            <span className={`absolute top-12 left-3 w-8 h-8 rounded-full shadow-lg flex items-center justify-center z-20 text-white ${
              isVIP ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
              isPremium ? 'bg-amber-500' :
              'bg-purple-500'
            }`}>
              {isVIP && <Crown size={14} />}
              {isPremium && <Zap size={14} />}
              {isDestacado && <Star size={14} />}
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
            {(anuncio as any).negociable && (
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
              <span>{anuncio.ubicacion || anuncio.provincia || 'România'}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} />
              <span>Acum</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Diseño por defecto - Card estándar moderna
  return (
    <div 
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setCurrentImageIndex(0)}
      className={`group cursor-pointer bg-white overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-gray-100 ${
        compact ? 'rounded-xl' : 'rounded-2xl'
      }`}
    >
      {/* Imagen */}
      <div className={`relative overflow-hidden ${compact ? 'aspect-square' : 'aspect-[4/5]'}`}>
        {anuncio.imagenes && anuncio.imagenes.length > 0 ? (
          anuncio.imagenes.map((img, idx) => (
            <Image
              key={idx}
              src={img || '/placeholder.jpg'}
              alt={anuncio.titulo}
              fill
              className={`object-cover transition-all duration-300 ${
                idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
              } group-hover:scale-105`}
            />
          ))
        ) : (
          <Image
            src="/placeholder.jpg"
            alt={anuncio.titulo}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        
        {/* Badge de promoción */}
        {isPromo && (
          <span className={`absolute top-1.5 right-1.5 text-white font-bold shadow z-20 ${
            compact 
              ? 'text-[9px] px-1.5 py-0.5 rounded' 
              : 'text-xs px-2.5 py-1 rounded-full'
          } ${
            isVIP ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
            isPremium ? 'bg-amber-500' :
            'bg-purple-500'
          }`}>
            {isVIP ? 'VIP' : isPremium ? 'Premium' : 'Destacado'}
          </span>
        )}

        {/* Botón favorito */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleFav(anuncio.id!);
          }}
          className={`absolute top-1.5 left-1.5 z-20 rounded-full flex items-center justify-center transition-all ${
            compact ? 'w-6 h-6' : 'w-8 h-8'
          } ${
            fav 
              ? 'bg-rose-500 text-white' 
              : 'bg-white/90 text-gray-500 hover:text-rose-500'
          }`}
        >
          <Heart size={compact ? 12 : 16} fill={fav ? 'currentColor' : 'none'} />
        </button>

        {/* Indicadores de imagen */}
        {imageCount > 1 && !compact && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
            {anuncio.imagenes?.slice(0, 5).map((_, idx) => (
              <span 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full ${idx === currentImageIndex ? 'bg-white scale-125 shadow-sm' : 'bg-white/50'}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className={compact ? 'p-2' : 'p-3'}>
        <div className={`font-bold text-gray-900 ${compact ? 'text-sm mb-0.5' : 'text-lg mb-1'}`}>
          {anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
        </div>
        <h3 className={`text-gray-700 ${compact ? 'text-xs line-clamp-1' : 'text-sm line-clamp-2 mb-1'}`}>
          {anuncio.titulo}
        </h3>
        {!compact && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin size={10} />
            <span className="truncate">{anuncio.ubicacion || anuncio.provincia || 'España'}</span>
          </div>
        )}
      </div>
    </div>
  );
}