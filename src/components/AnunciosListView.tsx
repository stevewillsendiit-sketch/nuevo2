"use client";

import React from 'react';
import { Anuncio } from '@/types';
import AnuncioHorizontalView from './AnuncioHorizontalView';
import { useRouter } from 'next/navigation';
import { useDesign } from '@/contexts/DesignContext';
import { UniversalCard } from './DesignCards';

interface AnunciosListViewProps {
  anuncios: Anuncio[];
  compact?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDestacar?: (id: string) => void;
  onPromote?: (id: string) => void;
  onToggleActivo?: (id: string, activo: boolean) => void;
  showActionsBar?: boolean;
}

export default function AnunciosListView({ anuncios, compact = false, onDelete, onEdit, onDestacar, onPromote, onToggleActivo, showActionsBar }: AnunciosListViewProps) {
  const router = useRouter();
  const { design } = useDesign();
  
  if (!anuncios || anuncios.length === 0) {
    return (
      <div className="py-8 text-center text-gray-500">No hay anuncios para mostrar.</div>
    );
  }

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

  // Diseño por defecto original (vista horizontal)
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 mb-8">
      {anuncios.map((a) => (
        <div
          key={a.id}
          role="link"
          tabIndex={0}
          onClick={() => router.push(`/ad/${a.id}`)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/ad/${a.id}`); }}
          className="cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-lg"
        >
          <AnuncioHorizontalView
            anuncio={a}
            compact={compact}
            onDelete={onDelete}
            onEdit={onEdit}
            onDestacar={onDestacar}
            onPromote={onPromote}
            onToggleActivo={onToggleActivo}
            showActionsBar={showActionsBar}
          />
        </div>
      ))}
    </div>
  );
}

