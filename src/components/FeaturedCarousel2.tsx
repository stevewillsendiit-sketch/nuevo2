'use client';

import React, { useEffect, useState } from 'react';
import { Anuncio } from '@/types';
import { getFeaturedAnuncios } from '@/lib/anuncios.service';
import FeaturedSmallCard from './FeaturedSmallCard';
import { useRouter } from 'next/navigation';

export default function FeaturedCarousel({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getFeaturedAnuncios(limit);
        if (!mounted) return;
        setItems(res);
      } catch (err) {
        console.error('Error cargando destacados:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const onFeaturedChanged = () => {
      (async () => {
        try {
          const res = await getFeaturedAnuncios(limit);
          if (mounted) setItems(res);
        } catch (err) {
          console.error('Error re-cargando destacados:', err);
        }
      })();
    };

    window.addEventListener('featured-changed', onFeaturedChanged as EventListener);

    return () => { mounted = false; window.removeEventListener('featured-changed', onFeaturedChanged as EventListener); };
  }, [limit]);

  if (!items || items.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Anuncios destacados</h2>
        <button onClick={() => router.push('/search?destacados=1')} className="text-sm text-blue-600 hover:underline">Ver todos</button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((a) => (
          <FeaturedSmallCard key={a.id} anuncio={a} />
        ))}
      </div>
    </section>
  );
}
