"use client";
import AnunciosTable from './AnunciosTable';
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAnunciosByUsuario } from '@/lib/anuncios.service';
import { Anuncio } from '@/types';
import { useLanguage } from '@/contexts/LanguageContext';

export default function DashboardMain() {
  const { usuario } = useAuth();
  const { t } = useLanguage();
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  useEffect(() => {
    if (!usuario) return;
    getAnunciosByUsuario(usuario.id).then(setAnuncios);
  }, [usuario]);

  const totalAnuncios = anuncios.length;
  const totalFavoritos = anuncios.reduce((acc, a) => acc + (a.favoritos || 0), 0);
  const totalVisitas = anuncios.reduce((acc, a) => acc + (a.vistas || 0), 0);
  const totalVentas = anuncios.filter(a => a.estado === 'Vendido').length;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold mb-4">{t('dashboard.overview')}</h1>
      {/* Tarjetas de resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 shadow text-center">
          <div className="text-gray-500">{t('dashboard.totalAds')}</div>
          <div className="text-2xl font-bold">{totalAnuncios}</div>
          <div className="text-xs text-gray-400">{t('dashboard.totalAdsDesc')}</div>
        </div>
        <div className="bg-purple-100 rounded-xl p-6 shadow text-center">
          <div className="text-gray-500">{t('dashboard.totalFavorites')}</div>
          <div className="text-2xl font-bold">{totalFavoritos}</div>
          <div className="text-xs text-gray-400">{t('dashboard.totalFavoritesDesc')}</div>
        </div>
        <div className="bg-orange-100 rounded-xl p-6 shadow text-center">
          <div className="text-gray-500">{t('dashboard.totalViews')}</div>
          <div className="text-2xl font-bold">{totalVisitas}</div>
          <div className="text-xs text-gray-400">{t('dashboard.totalViewsDesc')}</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-6 shadow text-center">
          <div className="text-gray-500">{t('dashboard.totalSales')}</div>
          <div className="text-2xl font-bold">{totalVentas}</div>
          <div className="text-xs text-gray-400">{t('dashboard.totalSalesDesc')}</div>
        </div>
      </div>
      {/* Tabla de anuncios del usuario */}
      <AnunciosTable anuncios={anuncios} />
    </div>
  );
}
