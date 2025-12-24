'use client';

import { Categoria } from '@/types';
import { getCategoriaIcon, AllCategoriesIcon } from '@/lib/categoriaIcons';
import { useState } from 'react';

interface CategoryChipsProps {
  selectedCategory: Categoria | null;
  onSelectCategory: (category: Categoria | null) => void;
  vertical?: boolean;
  mode?: 'default' | 'tiles';
}

// Mapeo de categorías a nombres cortos y colores - Estilo elegante monocromático
const categoryConfig: Record<string, { label: string; color: string; bgColor: string; hoverBg: string }> = {
  'null': { label: 'Todos', color: 'text-gray-900', bgColor: 'bg-gray-900', hoverBg: 'hover:bg-gray-50' },
  'Imobiliare': { label: 'Inmuebles', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Auto moto': { label: 'Vehículos', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Locuri de muncă': { label: 'Empleo', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Matrimoniale': { label: 'Contactos', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Servicii': { label: 'Servicios', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Electronice': { label: 'Electrónica', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Modă și accesorii': { label: 'Moda', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Animale': { label: 'Mascotas', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Casă și grădină': { label: 'Hogar', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Timp liber și sport': { label: 'Deporte', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Mama și copilul': { label: 'Bebé', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Cazare turism': { label: 'Turismo', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
  'Otros': { label: 'Otros', color: 'text-gray-700', bgColor: 'bg-gray-800', hoverBg: 'hover:bg-gray-50' },
};

export default function CategoryChips({ selectedCategory, onSelectCategory, vertical = false, mode = 'default' }: CategoryChipsProps) {
  const categories: (Categoria | null)[] = [
    ...Object.values(Categoria),
  ];

  const getCategoryLabel = (category: Categoria | null): string => {
    const key = category === null ? 'null' : category;
    return categoryConfig[key]?.label || (category || 'Todos');
  };

  const getCategoryConfig = (category: Categoria | null) => {
    const key = category === null ? 'null' : category;
    return categoryConfig[key] || categoryConfig['Otros'];
  };

  if (vertical) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-h-[70vh] overflow-y-auto">
        <button
          onClick={() => onSelectCategory(null)}
          aria-pressed={selectedCategory === null}
          className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all duration-200 ${
            selectedCategory === null 
              ? 'bg-gray-50' 
              : 'hover:bg-gray-50/50'
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
            selectedCategory === null 
              ? 'bg-gray-900 text-white' 
              : 'bg-gray-100 text-gray-500'
          }`}>
            <AllCategoriesIcon />
          </div>
          <div className="flex-1">
            <span className={`text-sm tracking-wide ${selectedCategory === null ? 'text-gray-900' : 'text-gray-600'}`}>
              Todas las categorías
            </span>
          </div>
        </button>

        {categories.map((category) => {
          const config = getCategoryConfig(category);
          const isSelected = selectedCategory === category;
          return (
            <button
              key={String(category)}
              onClick={() => onSelectCategory(category)}
              aria-pressed={isSelected}
              className={`w-full text-left px-5 py-4 flex items-center gap-4 transition-all duration-200 ${
                isSelected 
                  ? 'bg-gray-50' 
                  : 'hover:bg-gray-50/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                isSelected 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-500'
              }`}>
                {category ? getCategoriaIcon(category) : <AllCategoriesIcon />}
              </div>
              <span className={`text-sm tracking-wide ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                {getCategoryLabel(category)}
              </span>
            </button>
          );
        })}
      </div>
    );
  }

  // Tiles mode - Diseño profesional moderno en 2 columnas
  if (mode === 'tiles') {
    const allCategories = [null, ...categories];
    
    return (
      <div className="relative">
        {/* Grid elegante */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 p-4 bg-white dark:bg-[#1e2128] rounded-2xl border border-gray-100 dark:border-gray-700/50">
          {allCategories.map((category, index) => (
            <CategoryTile
              key={String(category)}
              category={category}
              isSelected={selectedCategory === category}
              onClick={() => onSelectCategory(category)}
              config={getCategoryConfig(category)}
              label={getCategoryLabel(category)}
              index={index}
            />
          ))}
        </div>
      </div>
    );
  }

  // Default mode
  return (
    <div className="flex gap-3 overflow-x-auto py-4 px-2 scrollbar-hide justify-center flex-wrap">
      <CategoryTile
        category={null}
        isSelected={selectedCategory === null}
        onClick={() => onSelectCategory(null)}
        config={getCategoryConfig(null)}
        label={getCategoryLabel(null)}
      />
      {categories.map((category) => (
        <CategoryTile
          key={String(category)}
          category={category}
          isSelected={selectedCategory === category}
          onClick={() => onSelectCategory(category)}
          config={getCategoryConfig(category)}
          label={getCategoryLabel(category)}
        />
      ))}
    </div>
  );
}

// Componente de tile individual - Estilo elegante
function CategoryTile({ 
  category, 
  isSelected, 
  onClick, 
  config, 
  label,
  index = 0
}: { 
  category: Categoria | null; 
  isSelected: boolean; 
  onClick: () => void; 
  config: { label: string; color: string; bgColor: string; hoverBg: string };
  label: string;
  index?: number;
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={isSelected}
      className={`
        relative flex flex-col items-center gap-2.5 p-4 rounded-xl
        transition-all duration-200 ease-out
        ${isSelected 
          ? 'bg-gray-50 dark:bg-gray-800' 
          : 'bg-transparent hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
        }
      `}
    >
      {/* Icono container */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center
        transition-all duration-200
        ${isSelected 
          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900' 
          : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
        }
      `}>
        <div className="text-lg">
          {category ? getCategoriaIcon(category) : <AllCategoriesIcon />}
        </div>
      </div>

      {/* Label */}
      <span className={`
        text-xs text-center leading-tight tracking-wide
        ${isSelected ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}
      `}>
        {label}
      </span>
    </button>
  );
}
