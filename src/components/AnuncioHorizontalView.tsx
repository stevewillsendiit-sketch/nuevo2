'use client';

import { Anuncio, EstadoAnuncio } from '@/types';
import { getCategoriaIcon } from '@/lib/categoriaIcons';
import Image from 'next/image';
import { useState } from 'react';
import { FaEye, FaHeart, FaTrash, FaStar, FaEdit, FaBullhorn, FaEnvelope } from 'react-icons/fa';
import { useRouter } from 'next/navigation';


interface AnuncioHorizontalViewProps {
  anuncio: Anuncio;
  compact?: boolean;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDestacar?: (id: string) => void;
  onPromote?: (id: string) => void;
  onToggleActivo?: (id: string, activo: boolean) => void;
  showActionsBar?: boolean;
}

export default function AnuncioHorizontalView({ anuncio, compact = false, onDelete, onEdit, onDestacar, onPromote, onToggleActivo, showActionsBar }: AnuncioHorizontalViewProps) {
  const [imageError, setImageError] = useState(false);
  const router = useRouter();
  // Elegante y profesional para panel usuario
  // Vista elegante para panel usuario o normal (inicio, etc)
  const esActivo = anuncio.estado === EstadoAnuncio.ACTIVO;
  // Calcular días restantes (30 días desde fechaPublicacion)
  let diasRestantes = 30;
  if (anuncio.fechaPublicacion) {
    const fechaPub = new Date(anuncio.fechaPublicacion);
    const ahora = new Date();
    const diff = Math.max(0, 30 - Math.floor((ahora.getTime() - fechaPub.getTime()) / (1000 * 60 * 60 * 24)));
    diasRestantes = diff;
  }
  return (
    showActionsBar ? (
      <div className="bg-white rounded-xl shadow-md border border-gray-100 mb-3 overflow-hidden group hover:shadow-lg transition-shadow">
        <div className="flex items-center px-2 py-2 gap-2">
          <input type="checkbox" className="accent-blue-600 w-4 h-4" tabIndex={-1} />
          <div className="relative w-16 h-14 rounded-md overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
            <Image
              src={imageError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
              alt={anuncio.titulo}
              fill
              sizes="64px"
              className="object-cover"
              onError={() => setImageError(true)}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 mb-0.5">
              {esActivo ? (
                  <span className="text-green-600 font-semibold text-xs flex items-center gap-1">● <span className="font-normal text-gray-500">{diasRestantes} días</span></span>
                ) : (
                  <span className="text-red-600 font-semibold text-xs flex items-center gap-1">⏸ Pausado: <span className="font-normal">{diasRestantes} días</span></span>
                )}
            </div>
            <div className="flex items-center gap-1">
              <h3 className="font-bold text-blue-700 text-sm hover:underline cursor-pointer truncate" onClick={() => router.push(`/ad/${anuncio.id}`)}>{anuncio.titulo}</h3>
              <span className="text-base font-bold text-gray-900 ml-1">{anuncio.precio.toFixed(0)} €</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-500">
              <span>ID {anuncio.id?.slice(-6)}</span>
              <span>Publicado: hoy</span>
              <span><FaEye className="inline mr-1" />{anuncio.vistas}</span>
              <span><FaHeart className="inline mr-1" />{anuncio.favoritos}</span>
            </div>
            <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-400">
              <span><FaEnvelope className="inline mr-1" /> Msg (0)</span>
              <span>Estadísticas</span>
            </div>
          </div>
          <div className="flex flex-col gap-1 ml-2">
            <button
              className={`flex items-center gap-1 px-2 py-1 rounded font-medium text-[11px] shadow-sm transition ${esActivo ? 'bg-gray-100 text-gray-500 hover:bg-gray-200' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
              title={esActivo ? 'Desactivar anuncio' : 'Activar anuncio'}
              onClick={e => { e.stopPropagation(); onToggleActivo && onToggleActivo(anuncio.id, !esActivo); }}
            >
              {esActivo ? 'Desactivar' : 'Activar'}
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] shadow-sm"
              title="Editar anuncio"
              onClick={e => { e.stopPropagation(); onEdit && onEdit(anuncio.id); }}
            >
              <FaEdit className="w-4 h-4" /> Editar
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded bg-yellow-50 hover:bg-yellow-100 text-yellow-700 font-medium text-[11px] shadow-sm"
              title="Destacar anuncio"
              onClick={e => { e.stopPropagation(); onDestacar && onDestacar(anuncio.id); }}
            >
              <FaStar className="w-4 h-4" /> Destacar
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded bg-green-50 hover:bg-green-100 text-green-700 font-medium text-[11px] shadow-sm"
              title="Promover anuncio"
              onClick={e => { e.stopPropagation(); onPromote && onPromote(anuncio.id); }}
            >
              <FaBullhorn className="w-4 h-4" /> Promover
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-medium text-[11px] shadow-sm"
              title="Eliminar anuncio"
              onClick={e => { e.stopPropagation(); onDelete && onDelete(anuncio.id); }}
            >
              <FaTrash className="w-4 h-4" /> Eliminar
            </button>
          </div>
        </div>
        <div className="bg-blue-50 px-3 py-2 text-[11px] text-blue-900 border-t border-blue-100 flex items-center gap-2">
          <FaStar className="text-blue-400 w-4 h-4" />
          <span className="font-semibold">¡Promociona tu anuncio y recibe hasta 15x más visualizaciones!</span>
        </div>
      </div>
    ) : (
      <div className={`flex gap-4 bg-white ${compact ? 'p-3' : 'p-4'} rounded-2xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer border border-gray-100 group relative`}>
        <div className={`relative ${compact ? 'w-[110px] h-[110px]' : 'w-[140px] h-[140px]'} flex-shrink-0 rounded-xl overflow-hidden`}>
          <Image
            src={imageError ? '/placeholder.jpg' : (anuncio.imagenes[0] || '/placeholder.jpg')}
            alt={anuncio.titulo}
            fill
            sizes="140px"
            className="object-cover"
            onError={() => setImageError(true)}
          />
          <div className="absolute bottom-2 left-2 bg-gradient-to-br from-blue-600 to-blue-400 text-white px-3 py-1 rounded-lg text-base font-bold shadow-lg backdrop-blur-sm">
            {anuncio.precio.toFixed(0)} €
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-md bg-blue-50 text-blue-600 ring-1 ring-blue-50">
              {getCategoriaIcon(anuncio.categoria)}
            </span>
            <h3 className={`text-lg font-semibold text-gray-900 leading-tight tracking-tight line-clamp-1`}>{anuncio.titulo}</h3>
          </div>
          <div className="flex items-center gap-4 text-gray-500 text-xs mb-2">
            <span className="flex items-center gap-1"><FaEye /> {anuncio.vistas}</span>
            <span className="flex items-center gap-1"><FaHeart /> {anuncio.favoritos}</span>
            <span className="flex items-center gap-1">📍 {anuncio.ubicacion}</span>
          </div>

          {/* Mostrar descripción solo si NO es panel usuario (no hay barra de acciones) */}
          {!showActionsBar && (
            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-2">
              {anuncio.descripcion}
            </p>
          )}
        </div>
      </div>
    )
  );
}
