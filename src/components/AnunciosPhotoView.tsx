"use client";

import React from 'react';
import { Anuncio } from '@/types';
import AnuncioPhotoCard from './AnuncioPhotoCard';
import { useRouter } from 'next/navigation';
import { useDesign } from '@/contexts/DesignContext';
import { UniversalCard } from './DesignCards';

interface Props {
  anuncios: Anuncio[];
  onToggleFavorito?: (id: string) => void;
  compact?: boolean;
}

export default function AnunciosPhotoView({ anuncios, onToggleFavorito, compact = false }: Props) {
  const router = useRouter();
  const { design } = useDesign();

  if (!anuncios || anuncios.length === 0) return <div className="py-8 text-center text-gray-500">No hay anuncios para mostrar.</div>;

  // Si hay un diseño personalizado activo, usar UniversalCard
  if (design !== 'default') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {anuncios.map(a => (
          <UniversalCard key={a.id} anuncio={a} />
        ))}
      </div>
    );
  }

  // Diseño por defecto original
  return (
    <div className={`${compact ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-6'} grid gap-4 pointer-events-none`}> 
      {anuncios.map(a => (
        <div key={a.id} className="relative">
          <div
            className="cursor-pointer pointer-events-auto"
            onClick={e => {
              router.push(`/ad/${a.id}`);
            }}
            role="link"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter') router.push(`/ad/${a.id}`); }}
          >
            <AnuncioPhotoCard anuncio={a} hideFavoriteButton />
          </div>
          {/* Botón de favorito fuera del área clickeable */}
          <div className="absolute top-3 right-3 z-30">
            <AnuncioPhotoCard anuncio={a} compact hideContent hideImage />
          </div>
        </div>
      ))}
    </div>
  );
}
