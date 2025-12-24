"use client";

import React from 'react';
import Image from 'next/image';
import { Anuncio } from '@/types';
import { useRouter } from 'next/navigation';
import { useFavoritos } from '@/contexts/FavoritosContext';
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa';

export default function FeaturedSmallCard({ anuncio }: { anuncio: Anuncio | any }) {
  const router = useRouter();
  const { favoritos, toggle: toggleFav } = useFavoritos();
  const fav = favoritos.has(anuncio.id);

  const onToggleFavHandler = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFav(anuncio.id);
  };

  return (
    <article onClick={() => router.push(`/ad/${anuncio.id}`)} className="group relative cursor-pointer rounded-xl overflow-hidden transition-colors hover:shadow-md">
      <div className="relative h-40 md:h-36 lg:h-40 overflow-hidden rounded-xl">
        <Image
          src={anuncio.imagenes[0] || '/placeholder.jpg'}
          alt={anuncio.titulo}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="object-cover"
        />

        {/* Badge de promoción VIP/Premium - con mayor prioridad */}
        {anuncio.promocion?.tipo === 'VIP' ? (
          <div className="absolute left-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
              <FaStar className="w-2.5 h-2.5" />
              VIP
            </span>
          </div>
        ) : anuncio.promocion?.tipo === 'Premium' ? (
          <div className="absolute left-2 top-2 z-10">
            <span className="inline-flex items-center gap-1 bg-purple-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-lg">
              <FaStar className="w-2.5 h-2.5" />
              Premium
            </span>
          </div>
        ) : null}



        {/* Price badge bottom-left (smaller) */}
        <div className="absolute left-3 bottom-3 bg-white/90 px-2 py-0.5 rounded-md border border-gray-100">
          <span className="text-xs font-medium text-gray-900">{new Intl.NumberFormat('es-ES').format(Math.round(anuncio.precio))} €</span>
        </div>
      </div>

      {/* Visible title on hover (hidden by default), kept sr-only for assistive tech */}
      <div className="p-2 h-8 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-900 truncate opacity-0 transform translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0">
          {anuncio.titulo}
        </span>
        <span className="sr-only">{anuncio.titulo}</span>
      </div>
    </article>
  );
}
