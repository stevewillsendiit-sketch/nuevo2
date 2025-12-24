"use client";

import Image from 'next/image';
import React, { useState, useRef } from 'react';
import { Anuncio } from '@/types';
import { FaHeart, FaStar } from 'react-icons/fa';
import { useFavoritos } from '@/contexts/FavoritosContext';

interface Props {
  anuncio: Anuncio;
  onToggleFavorito?: () => void;
  compact?: boolean;
  hideFavoriteButton?: boolean;
  hideContent?: boolean;
  hideImage?: boolean;
}

export default function AnuncioPhotoCard({ anuncio, onToggleFavorito, compact = false, aspect, hideFavoriteButton = false, hideContent = false, hideImage = false }: Props & { aspect?: string }) {
  const [imageError, setImageError] = useState(false);
  const [index, setIndex] = useState(0);
  const imageAreaRef = useRef<HTMLDivElement | null>(null);
  const { favoritos, toggle } = useFavoritos();

  const images = anuncio.imagenes && anuncio.imagenes.length > 0 ? anuncio.imagenes : ['/placeholder.jpg'];

  // Change image on mouse move over photo

  const isFavorito = favoritos.has(anuncio.id!);
  
  // Verificar si tiene promoción VIP/Premium (del localStorage o directamente del anuncio)
  const promocion = (anuncio as any).promocion;
  const tipoPromocion = anuncio.planPromocion || promocion?.tipo;

  return (
    <div
      className="relative rounded-xl overflow-hidden bg-white shadow-sm"
      style={{ cursor: images.length > 1 ? 'pointer' : undefined }}
    >
      {/* Etiquetas VIP/Premium/Destacado */}
      {!compact && tipoPromocion && tipoPromocion !== 'Básico' && anuncio.destacado && (
        <div className={`absolute left-3 top-3 z-20 flex items-center justify-center w-7 h-7 rounded-full shadow-lg ${
          tipoPromocion === 'VIP' 
            ? 'bg-gradient-to-r from-pink-500 to-red-500' 
            : tipoPromocion === 'Premium' 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        } text-white`}>
          <FaStar className="w-3.5 h-3.5" />
        </div>
      )}
      {/* Botón de favorito visible en todos los modos */}
      <button
        aria-label="Favorito"
        onClick={e => {
          e.preventDefault();
          e.stopPropagation();
          setTimeout(() => {
            if (onToggleFavorito) {
              onToggleFavorito();
            } else {
              toggle(anuncio.id!);
            }
          }, 0);
          return false;
        }}
        className="absolute top-3 right-3 z-30 w-7 h-7 rounded-full flex items-center justify-center text-white pointer-events-auto"
        style={{ background: isFavorito ? '#ef4444' : 'rgba(0,0,0,0.45)' }}
        tabIndex={0}
        type="button"
      >
        <FaHeart className="w-3 h-3 pointer-events-none" />
      </button>
      {/* Etiquetas VIP/Premium/Destacado en slider/compact */}
      {compact && tipoPromocion && tipoPromocion !== 'Básico' && anuncio.destacado && (
        <div className={`absolute left-3 top-3 flex items-center justify-center w-6 h-6 rounded-full shadow-md z-20 ${
          tipoPromocion === 'VIP' 
            ? 'bg-gradient-to-r from-pink-500 to-red-500' 
            : tipoPromocion === 'Premium' 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500'
              : 'bg-gradient-to-r from-yellow-400 to-orange-500'
        } text-white`}>
          <FaStar className="w-3 h-3" />
        </div>
      )}
      <div
        ref={imageAreaRef}
        className={`relative w-full ${aspect ? aspect : (compact ? 'aspect-[3/4]' : 'aspect-[4/5]')} bg-gray-100`}
        onMouseMove={e => {
          if (images.length <= 1 || !imageAreaRef.current) return;
          const rect = imageAreaRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const zone = Math.floor((x / rect.width) * images.length);
          if (zone >= 0 && zone < images.length && zone !== index) {
            setIndex(zone);
          }
        }}
        onMouseLeave={() => {
          setIndex(0);
        }}
      >
        <Image
          src={imageError ? '/placeholder.jpg' : images[index]}
          alt={anuncio.titulo}
          fill
          sizes="(max-width: 640px) 50vw, 33vw"
          className="object-cover transition-opacity duration-150"
          onError={() => setImageError(true)}
        />
        {/* Dots */}
        {images.length > 1 && (
          <div className={`absolute left-1/2 -translate-x-1/2 ${compact ? 'bottom-4' : 'bottom-4'} z-20 flex gap-1 opacity-80 hover:opacity-100 transition-opacity duration-200 pointer-events-none`}>
            {images.map((_, idx) => (
              <button
                key={idx}
                type="button"
                aria-label={`Ver foto ${idx + 1}`}
                className={`w-2 h-2 rounded-full border-2 border-white flex items-center justify-center ${idx === index ? 'bg-white' : 'bg-black/80'} transition-colors pointer-events-auto`}
                style={idx === index ? { boxShadow: '0 0 0 1px #000' } : undefined}
                onClick={e => { e.stopPropagation(); setIndex(idx); }}
              />
            ))}
          </div>
        )}
      </div>
      {/* El botón de favorito ahora se renderiza siempre y previene navegación */}

      {/* Precio y título */}
      {!hideContent && (
        <div className="p-2">
          <p className="text-sm font-bold text-gray-900 truncate">{anuncio.precio?.toLocaleString('es-ES')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}</p>
          <p className="text-xs text-gray-500 truncate">{anuncio.titulo}</p>
        </div>
      )}
    </div>
  );
}
