"use client";

import React from "react";

// Componente de shimmer animado
const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] ${className}`} 
    style={{ animation: 'shimmer 1.5s infinite' }}
  />
);

// Skeleton para las tarjetas de planes
const PlanCardSkeleton = ({ highlight = false }: { highlight?: boolean }) => (
  <div className={`rounded-2xl p-5 ${highlight ? 'bg-gradient-to-br from-gray-300 to-gray-400' : 'bg-white border-2 border-gray-200'}`}>
    <div className="flex items-center gap-3 mb-4">
      <Shimmer className="w-12 h-12 rounded-xl" />
      <div className="flex-1">
        <Shimmer className="h-5 w-24 rounded mb-2" />
        <Shimmer className="h-3 w-16 rounded" />
      </div>
    </div>
    <Shimmer className="h-8 w-20 rounded mb-4" />
    <div className="space-y-2 mb-5">
      <Shimmer className="h-4 w-full rounded" />
      <Shimmer className="h-4 w-3/4 rounded" />
      <Shimmer className="h-4 w-5/6 rounded" />
    </div>
    <Shimmer className="h-10 w-full rounded-xl" />
  </div>
);

// Skeleton para el banner de perfil
const ProfileBannerSkeleton = () => (
  <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl p-6 mb-6">
    <div className="flex items-center gap-6">
      <Shimmer className="w-24 h-24 rounded-2xl" />
      <div className="flex-1">
        <Shimmer className="h-7 w-48 rounded mb-2" />
        <Shimmer className="h-4 w-32 rounded mb-3" />
        <div className="flex gap-6">
          <Shimmer className="h-12 w-24 rounded-lg" />
          <Shimmer className="h-12 w-24 rounded-lg" />
          <Shimmer className="h-12 w-24 rounded-lg" />
        </div>
      </div>
      <Shimmer className="w-64 h-36 rounded-2xl" />
    </div>
  </div>
);

// Skeleton para tarjetas de anuncios
const AnuncioCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
    <Shimmer className="w-full h-48" />
    <div className="p-4">
      <Shimmer className="h-5 w-3/4 rounded mb-2" />
      <Shimmer className="h-4 w-1/2 rounded mb-3" />
      <div className="flex justify-between items-center">
        <Shimmer className="h-6 w-20 rounded" />
        <Shimmer className="h-8 w-8 rounded-full" />
      </div>
    </div>
  </div>
);

// Skeleton para la lista horizontal
const AnuncioListSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
    <Shimmer className="w-32 h-24 rounded-lg flex-shrink-0" />
    <div className="flex-1">
      <Shimmer className="h-5 w-3/4 rounded mb-2" />
      <Shimmer className="h-4 w-1/2 rounded mb-2" />
      <Shimmer className="h-6 w-24 rounded" />
    </div>
  </div>
);

// Componente principal de loading
export default function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Shimmer className="w-10 h-10 rounded-lg" />
            <Shimmer className="h-6 w-32 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <Shimmer className="w-10 h-10 rounded-full" />
            <Shimmer className="w-10 h-10 rounded-full" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar skeleton */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <Shimmer className="w-16 h-16 rounded-full" />
                <div>
                  <Shimmer className="h-5 w-28 rounded mb-2" />
                  <Shimmer className="h-3 w-20 rounded" />
                </div>
              </div>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map(i => (
                  <Shimmer key={i} className="h-12 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </aside>

          {/* Main content skeleton */}
          <main className="flex-1">
            {/* Tabs skeleton */}
            <div className="flex gap-2 mb-6">
              {[1, 2, 3, 4].map(i => (
                <Shimmer key={i} className="h-10 w-28 rounded-lg" />
              ))}
            </div>

            {/* Banner skeleton */}
            <ProfileBannerSkeleton />

            {/* Plans section skeleton */}
            <div className="mb-6">
              <Shimmer className="h-7 w-48 rounded mb-2" />
              <Shimmer className="h-4 w-64 rounded mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PlanCardSkeleton />
                <PlanCardSkeleton />
                <PlanCardSkeleton highlight />
                <PlanCardSkeleton highlight />
              </div>
            </div>

            {/* Info cards skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <Shimmer className="h-6 w-40 rounded mb-4" />
                <div className="space-y-4">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex justify-between">
                      <Shimmer className="h-4 w-24 rounded" />
                      <Shimmer className="h-4 w-32 rounded" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-200">
                <Shimmer className="h-6 w-40 rounded mb-4" />
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <Shimmer key={i} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* CSS para la animación shimmer */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

// Skeleton más pequeño para secciones individuales
export function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }).map((_, i) => (
        <Shimmer key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

// Skeleton para grid de anuncios
export function AnunciosGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <AnuncioCardSkeleton key={i} />
      ))}
    </div>
  );
}

// Skeleton para lista de anuncios
export function AnunciosListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <AnuncioListSkeleton key={i} />
      ))}
    </div>
  );
}
