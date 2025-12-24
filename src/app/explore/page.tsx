'use client';

import { useState, useEffect } from 'react';
import { getAnuncios } from '@/lib/anuncios.service';
import { Anuncio } from '@/types';
import { UniversalCard } from '@/components/DesignCards';

export default function ExplorePage() {
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnuncios();
  }, []);

  const loadAnuncios = async () => {
    setLoading(true);
    try {
      const data = await getAnuncios();
      // Solo mostrar anuncios activos
      const activos = data.filter(a => a.estado === 'Activo');
      setAnuncios(activos);
    } catch (error) {
      console.error('Error loading anuncios:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Contador de resultados */}
        <div className="mb-4">
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">{anuncios.length}</span> anunțuri
          </p>
        </div>

        {/* Grid de anuncios */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nu am găsit rezultate</h3>
            <p className="text-gray-500">Nu există anunțuri disponibile</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {anuncios.map((anuncio) => (
              <UniversalCard
                key={anuncio.id}
                anuncio={anuncio}
                variant="default"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
