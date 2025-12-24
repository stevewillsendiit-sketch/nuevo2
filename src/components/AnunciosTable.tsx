"use client";

import { Anuncio } from '@/types';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, Edit, Trash2, MoreVertical } from 'lucide-react';

interface AnunciosTableProps {
  anuncios: Anuncio[];
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
}

export default function AnunciosTable({ anuncios, onDelete, onEdit }: AnunciosTableProps) {
  if (!anuncios || anuncios.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No tienes anuncios publicados
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Anuncio</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Precio</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Estado</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Vistas</th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {anuncios.map((anuncio) => (
            <tr key={anuncio.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={anuncio.imagenes?.[0] || '/placeholder.jpg'}
                      alt={anuncio.titulo}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <Link href={`/ad/${anuncio.id}`} className="font-medium text-gray-900 hover:text-blue-600 line-clamp-1">
                      {anuncio.titulo}
                    </Link>
                    <p className="text-sm text-gray-500">{anuncio.categoria}</p>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold text-gray-900">
                  {anuncio.precio?.toLocaleString('es-ES')} €
                </span>
              </td>
              <td className="py-4 px-4">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  anuncio.estado === 'Activo' 
                    ? 'bg-green-100 text-green-700'
                    : anuncio.estado === 'Pausado'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-gray-100 text-gray-700'
                }`}>
                  {anuncio.estado}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-1 text-gray-500">
                  <Eye size={14} />
                  <span>{anuncio.vistas || 0}</span>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/ad/${anuncio.id}/edit`}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </Link>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(anuncio.id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
