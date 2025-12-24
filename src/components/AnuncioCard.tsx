'use client';

import { Anuncio } from '@/types';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { FaHeart, FaRegHeart, FaEye, FaStar, FaRegStar, FaMapMarkerAlt, FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/contexts/AuthContext';
import { updateAnuncio } from '@/lib/anuncios.service';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface AnuncioCardProps {
  anuncio: Anuncio;
  soloImagen?: boolean;
  onToggleFavorito?: (id: string) => void;
  esFavorito?: boolean;
  compact?: boolean;
  horizontal?: boolean;
}

export default function AnuncioCard({ 
  anuncio, 
  soloImagen = false,
  onToggleFavorito,
  esFavorito = false 
  , compact = false
  , horizontal = false
}: AnuncioCardProps) {
  const [imageError, setImageError] = useState(false);
  const [destacadoLocal, setDestacadoLocal] = useState<boolean>(!!anuncio.destacado);
  const { usuario } = useAuth();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const { t } = useLanguage();
  const localFavorito = favoritos.has(anuncio.id!) || esFavorito;

  if (soloImagen) {
    return (
      <article className={`relative w-full ${compact ? 'h-40' : 'h-[280px]'} rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-transform transform-gpu hover:scale-[1.02]`} aria-label={anuncio.titulo}>
        <Image
          src={imageError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
          alt={anuncio.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onToggleFavorito) {
              onToggleFavorito(anuncio.id!);
            } else {
              toggleFav(anuncio.id!);
            }
          }}
          aria-label={localFavorito ? `Quitar ${anuncio.titulo} de favoritos` : `Agregar ${anuncio.titulo} a favoritos`}
          aria-pressed={localFavorito}
          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        >
          {localFavorito ? (
            <FaHeart className="text-red-500 w-4 h-4" aria-hidden />
          ) : (
            <FaRegHeart className="text-gray-700 w-4 h-4" aria-hidden />
          )}
        </button>

        <div className="absolute bottom-3 left-3 bg-white px-2 py-1 rounded-lg shadow-md">
          <p className="font-bold text-blue-700 text-base">{new Intl.NumberFormat('es-ES').format(Math.round(anuncio.precio))} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}</p>
          <span className="sr-only">Precio: {anuncio.precio} {anuncio.moneda === 'LEI' ? 'Lei' : 'euros'}</span>
        </div>
      </article>
    );
  }

  // Horizontal layout for list view - Diseño profesional 2 columnas
  if (horizontal) {
    return (
      <article className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl dark:shadow-gray-900/30 transition-all duration-300 cursor-pointer group border border-gray-200/60 dark:border-gray-700/60 flex h-[140px]" aria-labelledby={`anuncio-title-${anuncio.id}`}>
        {/* Image Section - Compacta */}
        <div className="relative w-[140px] h-full flex-shrink-0 overflow-hidden">
          <Image
            src={imageError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
            alt={anuncio.titulo}
            fill
            sizes="140px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
          
          {/* Botón favorito */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onToggleFavorito) {
                onToggleFavorito(anuncio.id!);
              } else {
                toggleFav(anuncio.id!);
              }
            }}
            aria-label={localFavorito ? `Quitar de favoritos` : `Agregar a favoritos`}
            aria-pressed={localFavorito}
            className="absolute top-2 left-2 p-2 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-600 transition-all shadow-md hover:scale-110 z-10"
          >
            {localFavorito ? (
              <FaHeart className="text-red-500 w-4 h-4" aria-hidden />
            ) : (
              <FaRegHeart className="text-gray-500 dark:text-gray-400 w-4 h-4 hover:text-red-400" aria-hidden />
            )}
          </button>

          {/* Badge de plan */}
          {anuncio.planPromocion && anuncio.planPromocion !== 'Básico' && anuncio.destacado && (
            <span className={`absolute bottom-2 left-2 text-[9px] px-2 py-0.5 ${
              anuncio.planPromocion === 'VIP' 
                ? 'bg-gradient-to-r from-pink-500 to-red-500' 
                : anuncio.planPromocion === 'Premium'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                  : 'bg-gradient-to-r from-yellow-400 to-orange-500'
            } text-white font-bold rounded-full shadow`}>
              {anuncio.planPromocion}
            </span>
          )}
          {(anuncio.destacado || destacadoLocal) && (!anuncio.planPromocion || anuncio.planPromocion === 'Básico') && (
            <span className="absolute bottom-2 left-2 bg-yellow-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
              ⭐
            </span>
          )}

          {/* Contador de imágenes */}
          {anuncio.imagenes && anuncio.imagenes.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
              +{anuncio.imagenes.length - 1}
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
          {/* Título y precio */}
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3
                id={`anuncio-title-${anuncio.id}`}
                className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug flex-1"
              >
                {anuncio.titulo}
              </h3>
              <span className="text-base font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                {new Intl.NumberFormat('es-ES').format(Math.round(anuncio.precio))} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
              </span>
            </div>
            
            {/* Ubicación */}
            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-1">
              <FaMapMarkerAlt className="w-3 h-3 mr-1 text-gray-400 dark:text-gray-500" />
              <span className="truncate">{anuncio.ubicacion}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full font-medium truncate max-w-[100px]">
              {anuncio.categoria}
            </span>
            
            <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
              <span className="flex items-center gap-1">
                <FaEye className="w-3 h-3" />
                {anuncio.vistas || 0}
              </span>
              <span className="flex items-center gap-1">
                <FaHeart className="w-3 h-3" />
                {anuncio.favoritos || 0}
              </span>
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className={`bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl dark:shadow-gray-900/30 transition-all duration-300 transform-gpu hover:scale-[1.03] cursor-pointer group border border-gray-100 dark:border-gray-700`} aria-labelledby={`anuncio-title-${anuncio.id}`}>
      <div className={`relative ${compact ? 'h-40' : 'h-64'} overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200`}>
        <Image
          src={imageError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
          alt={anuncio.titulo}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          onError={() => setImageError(true)}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        <button
          onClick={(e) => {
            e.preventDefault();
            if (onToggleFavorito) {
              onToggleFavorito(anuncio.id!);
            } else {
              toggleFav(anuncio.id!);
            }
          }}
          aria-label={localFavorito ? `Quitar ${anuncio.titulo} de favoritos` : `Agregar ${anuncio.titulo} a favoritos`}
          aria-pressed={localFavorito}
          className={`absolute ${compact ? 'top-2 right-2 p-2' : 'top-4 right-4 p-2.5'} bg-white/95 backdrop-blur-md rounded-xl hover:bg-white transition-all shadow-lg hover:scale-110 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2`}
        >
          {localFavorito ? (
            <FaHeart className={`text-red-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} aria-hidden />
          ) : (
            <FaRegHeart className={`text-gray-700 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} aria-hidden />
          )}
        </button>
        {usuario?.id === anuncio.vendedorId && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const newVal = !destacadoLocal;
              setDestacadoLocal(newVal);
              (async () => {
                try {
                  await updateAnuncio(anuncio.id, { destacado: newVal });
                  window.dispatchEvent(new CustomEvent('featured-changed', { detail: { id: anuncio.id, destacado: newVal } }));
                } catch (err) {
                  console.error('Error actualizando destacado:', err);
                  setDestacadoLocal(!newVal);
                }
              })();
            }}
            aria-label={destacadoLocal ? `Quitar ${anuncio.titulo} de destacados` : `Marcar ${anuncio.titulo} como destacado`}
            className={`absolute ${compact ? 'top-2 left-2 p-2' : 'top-4 left-4 p-2.5'} bg-white/95 backdrop-blur-md rounded-xl hover:bg-white transition-all shadow-lg hover:scale-110 z-10 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 focus-visible:ring-offset-2`}
          >
            {destacadoLocal ? (
              <FaStar className={`text-yellow-500 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} aria-hidden />
            ) : (
              <FaRegStar className={`text-gray-700 ${compact ? 'w-4 h-4' : 'w-5 h-5'}`} aria-hidden />
            )}
          </button>
        )}
        {/* Badge de plan de promoción (VIP, Premium, Destacado) */}
        {anuncio.planPromocion && anuncio.planPromocion !== 'Básico' && anuncio.destacado && (
          <span className={`absolute ${compact ? 'top-2 left-12 text-[10px] px-2 py-1' : 'top-4 left-16 text-xs px-3 py-1.5'} ${
            anuncio.planPromocion === 'VIP' 
              ? 'bg-gradient-to-r from-pink-500 to-red-500' 
              : anuncio.planPromocion === 'Premium'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500'
                : 'bg-gradient-to-r from-yellow-400 to-orange-500'
          } text-white font-bold rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1`}>
            {anuncio.planPromocion === 'VIP' ? '★' : anuncio.planPromocion === 'Premium' ? '✦' : '⭐'}
            {anuncio.planPromocion}
          </span>
        )}
        {/* Badge destacado solo si no tiene plan de promoción de pago */}
        {(anuncio.destacado || destacadoLocal) && (!anuncio.planPromocion || anuncio.planPromocion === 'Básico') && (
          <span className={`absolute ${compact ? 'top-2 left-12 text-[10px] px-2 py-1' : 'top-4 left-16 text-xs px-4 py-1.5'} bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 text-white font-bold rounded-full shadow-lg backdrop-blur-sm`}>
            ⭐ Destacado
          </span>
        )}
        
        {/* Price badge - now positioned at bottom */}
        <div className={`absolute ${compact ? 'bottom-2 left-2 px-3 py-1.5' : 'bottom-4 left-4 px-4 py-2'} bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg backdrop-blur-sm`}>
          <p className={`font-bold text-white ${compact ? 'text-sm' : 'text-lg'}`} aria-label={`Precio ${anuncio.precio} ${anuncio.moneda === 'LEI' ? 'Lei' : 'euros'}`}>
            {new Intl.NumberFormat('es-ES').format(Math.round(anuncio.precio))} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}
          </p>
        </div>
      </div>

      <div className={compact ? 'p-3' : 'p-5'}>
        <h3
          id={`anuncio-title-${anuncio.id}`}
          className={`${compact ? 'text-sm' : 'text-base'} font-bold text-gray-900 dark:text-gray-100 ${compact ? 'mb-1.5' : 'mb-2'} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug`}
        >
          {anuncio.titulo}
        </h3>

        <div className={`flex items-center ${compact ? 'text-xs' : 'text-sm'} text-gray-600 dark:text-gray-300 ${compact ? 'mb-2' : 'mb-3'} bg-gray-50 dark:bg-gray-700/50 rounded-lg ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
          <FaMapMarkerAlt className={`${compact ? 'w-3 h-3 mr-1.5' : 'w-4 h-4 mr-2'} text-blue-600 dark:text-blue-400`} />
          <span className="font-medium">{anuncio.ubicacion}</span>
        </div>
        
        {/* Sólo venta en persona */}
        <div className={`flex items-center ${compact ? 'gap-1.5 mb-2' : 'gap-2 mb-4'} bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg ${compact ? 'px-2 py-1.5' : 'px-3 py-2'}`}>
          <FaUserCircle className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-green-600 dark:text-green-400`} />
          <span className={`${compact ? 'text-[10px]' : 'text-xs'} font-semibold text-green-700 dark:text-green-300`}>{t('ad.inPerson')}</span>
        </div>

        <div className={`flex items-center justify-between ${compact ? 'pt-2' : 'pt-4'} border-t border-gray-100 dark:border-gray-700`}>
          <div className={`flex items-center ${compact ? 'gap-2 text-xs' : 'gap-4 text-sm'} text-gray-500 dark:text-gray-400`}>
            <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'} hover:text-blue-600 dark:hover:text-blue-400 transition-colors`}>
              <FaEye className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              <span className="font-medium">{anuncio.vistas}</span>
            </div>
            <div className={`flex items-center ${compact ? 'gap-1' : 'gap-1.5'} hover:text-red-500 transition-colors`}>
              <FaHeart className={compact ? 'w-3 h-3' : 'w-4 h-4'} />
              <span className="font-medium">{anuncio.favoritos}</span>
            </div>
          </div>
          <div className={`${compact ? 'text-[10px]' : 'text-xs'} text-gray-400 dark:text-gray-500 font-medium`}>
            Reciente
          </div>
        </div>
      </div>
    </article>
  );
}
