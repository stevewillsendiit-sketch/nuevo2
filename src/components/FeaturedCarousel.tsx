'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Anuncio } from '@/types';
import { getFeaturedAnuncios } from '@/lib/anuncios.service';
import FeaturedSmallCard from './FeaturedSmallCard';
import { useRouter } from 'next/navigation';

export default function FeaturedCarousel({ limit = 6 }: { limit?: number }) {
  const [items, setItems] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [startIndex, setStartIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getFeaturedAnuncios(limit);
        
        // Obtener promociones Premium y VIP del localStorage - solo en cliente
        const promocionesGuardadas = typeof window !== 'undefined' ? localStorage.getItem('promocionesActivas') : null;
        let anunciosPromocionados: Anuncio[] = [];
        
        if (promocionesGuardadas) {
          try {
            const promocionesActivas = JSON.parse(promocionesGuardadas);
            // Filtrar solo Premium y VIP activos
            const promocionesVIP = promocionesActivas.filter(
              (p: any) => (p.tipo === 'VIP' || p.tipo === 'Premium') && p.diasRestantes > 0
            );
            
            // Mapear a anuncios si tenemos datos
            anunciosPromocionados = res.filter((anuncio: Anuncio) => 
              promocionesVIP.some((p: any) => p.anuncioId === anuncio.id)
            ).map((anuncio: Anuncio) => {
              const promocion = promocionesVIP.find((p: any) => p.anuncioId === anuncio.id);
              return { ...anuncio, promocion };
            });
            
            // Ordenar por tipo de plan (VIP primero, luego Premium)
            anunciosPromocionados.sort((a: any, b: any) => {
              if (a.promocion?.tipo === 'VIP' && b.promocion?.tipo !== 'VIP') return -1;
              if (a.promocion?.tipo !== 'VIP' && b.promocion?.tipo === 'VIP') return 1;
              return 0;
            });
          } catch (e) {
            console.error('Error procesando promociones:', e);
          }
        }
        
        // Combinar: primero promocionados VIP/Premium, luego destacados normales
        const anunciosDestacados = res.filter((anuncio: Anuncio) => 
          !anunciosPromocionados.some((p: Anuncio) => p.id === anuncio.id)
        );
        
        const todosAnuncios = [...anunciosPromocionados, ...anunciosDestacados];
        
        if (!mounted) return;
        setItems(todosAnuncios);
        // initialize startIndex from session (rotate on each load)
        try {
          const key = 'featured_start';
          const stored = sessionStorage.getItem(key);
          const parsed = stored ? Number(stored) : Math.floor(Math.random() * Math.max(1, todosAnuncios.length));
          const safe = Number.isFinite(parsed) ? parsed % Math.max(1, todosAnuncios.length) : 0;
          setStartIndex(safe);
          // prepare next index for subsequent visits: advance by visibleCount
          const visibleCount = Math.min(limit, todosAnuncios.length);
          const next = (safe + visibleCount) % Math.max(1, todosAnuncios.length);
          sessionStorage.setItem(key, String(next));
        } catch (e) {
          // ignore sessionStorage errors
        }
      } catch (err) {
        console.error('Error cargando destacados:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    const onFeaturedChanged = () => {
      // re-fetch when featured status changes elsewhere
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

  // attach visibility handler when items available so it sees latest `items`
  useEffect(() => {
    if (!items || items.length === 0) return;
    const key = 'featured_start';
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        const visibleCount = Math.min(limit, items.length);
        setStartIndex((s) => {
          const next = (s + visibleCount) % items.length;
          try { sessionStorage.setItem(key, String((next + visibleCount) % items.length)); } catch (e) {}
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [items, limit]);

  // determine visible window early so effects/hooks order stays stable
  const visibleCount = Math.min(limit, items.length);

  // auto-advance every X ms so the visible 6 rotate and include the other items
  const intervalMs = 5000; // 5 seconds
  useEffect(() => {
    if (!items || items.length <= visibleCount) return;
    const id = window.setInterval(() => {
      setStartIndex((s) => {
        const next = (s + visibleCount) % items.length;
        try { sessionStorage.setItem('featured_start', String((next + visibleCount) % items.length)); } catch (e) {}
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [items, visibleCount]);

  if (!items || items.length === 0) return null;

  // compute displayed slice with wrap-around
  const doubled = items.concat(items);
  const displayed = items.length <= visibleCount ? items : doubled.slice(startIndex, startIndex + visibleCount);

  return (
    <section className="mb-8">

      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text text-transparent tracking-tight drop-shadow-sm">
              Anuncios destacados
            </h2>
            <span className="text-base font-semibold bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 bg-clip-text text-transparent ml-2">{items.length} encontrados</span>
          </div>
        </div>
        <div className="mt-2 w-32 h-1 rounded-full bg-gradient-to-r from-blue-900 via-blue-400 to-blue-200 shadow-md" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {displayed.map((a) => (
          <FeaturedSmallCard key={a.id} anuncio={a} />
        ))}
      </div>
    </section>
  );
}

