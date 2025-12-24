'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export default function EnConstruccion() {
  const { t } = useLanguage();
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6 border border-blue-100">
        <span className="text-6xl">🚧</span>
        <h1 className="text-3xl font-extrabold text-blue-700">{t('construction.title')}</h1>
        <p className="text-gray-600 text-lg text-center max-w-md">
          {t('construction.description')}
        </p>
      </div>
    </div>
  );
}
