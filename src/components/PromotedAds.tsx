"use client";

import React from 'react';
import Link from 'next/link';

export default function PromotedAds() {
  return (
    <div className="max-w-7xl w-full px-6 mb-6">
      <div className="grid grid-cols-1 gap-6">
        <Link href="/search?promoted=combo" className="block">
          <div className="rounded-3xl p-0 h-full shadow-2xl hover:shadow-[0_20px_40px_rgba(2,6,23,0.45)] transition-shadow transform-gpu hover:-translate-y-1 overflow-hidden relative ring-1 ring-white/10">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-6 bg-gradient-to-br from-gray-100 to-white text-gray-900 flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-gray-100 flex items-center justify-center ring-1 ring-gray-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.163c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.287 3.95c.3.921-.755 1.688-1.538 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.783.57-1.838-.197-1.538-1.118l1.287-3.95a1 1 0 00-.364-1.118L2.07 9.377c-.783-.57-.38-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.95z"/></svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">Promovido</h3>
                    <p className="mt-2 text-sm text-gray-700 leading-relaxed">Los anuncios con el distintivo “Promovido” reciben mayor visibilidad dentro de la plataforma. Se muestran más veces y llegan a más personas.</p>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-sm text-gray-700">Destaca tu anuncio y consigue más visibilidad y contactos.</div>
                </div>
              </div>

              <div className="p-6 bg-gradient-to-br from-white to-yellow-50 backdrop-blur-sm flex flex-col justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-xl bg-[#2b1b45] flex items-center justify-center text-[#bfa25a] ring-1 ring-[#bfa25a]/30">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7l3-7z"/></svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 via-white to-yellow-200">Ofertas locales</h4>
                    <p className="mt-2 text-sm text-gray-700">Encuentra ofertas cerca de ti. Publicaciones destacadas y promociones temporales.</p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700">Explora las mejores opciones cerca de ti</div>
                  <div className="flex items-center gap-3">
                    <a href="/search?promoted=1" className="inline-flex items-center gap-2 rounded-full bg-yellow-400 text-white px-4 py-2 text-sm font-semibold shadow-md hover:shadow-lg transition">Ver promovidos</a>
                    <a href="/search?promoted=2" className="inline-flex items-center gap-2 rounded-full bg-green-600 text-white px-4 py-2 text-sm font-semibold ring-1 ring-gray-200 hover:bg-green-700 transition">Explorar</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
