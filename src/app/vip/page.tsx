"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { getFeaturedAnuncios } from '@/lib/anuncios.service';
import { UniversalCard } from '@/components/DesignCards';
import { Anuncio } from '@/types';
import { Rocket, Sparkles } from 'lucide-react';

export default function VipPage() {
  const { t } = useLanguage();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromovidos = async () => {
      try {
        const destacados = await getFeaturedAnuncios(100); // Obtener hasta 100 anuncios VIP/destacados
        setAnuncios(destacados);
      } catch (error) {
        console.error('Error al cargar anuncios VIP:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromovidos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header VIP */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <Rocket className="w-10 h-10 text-amber-500" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent">
              Anunțuri Promovate
            </h1>
            <Rocket className="w-10 h-10 text-amber-500" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Cele mai bune oferte selectate pentru tine
          </p>
          <div className="flex items-center justify-center gap-2 mt-4 text-amber-600">
            <Sparkles className="w-5 h-5" />
            <span className="font-medium">{anuncios.length} anuncios destacados</span>
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* Grid de anuncios */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : anuncios.length === 0 ? (
          <div className="text-center py-16">
            <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Nu există anunțuri VIP momentan</p>
            <p className="text-gray-400 text-sm mt-2">Reveniți mai târziu pentru oferte exclusive</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {anuncios.map(anuncio => (
              <UniversalCard key={anuncio.id} anuncio={anuncio} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
