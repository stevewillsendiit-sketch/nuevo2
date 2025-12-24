'use client';

import { FaSearch, FaTimes } from 'react-icons/fa';
import { useLanguage } from '@/contexts/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const { t } = useLanguage();
  const searchPlaceholder = placeholder || t('home.hero.title');
  
  return (
    <div className="relative w-full">
      {/* Icono de búsqueda */}
      <div className="absolute left-5 top-1/2 -translate-y-1/2">
        <FaSearch className="w-4 h-4 text-gray-300" />
      </div>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={searchPlaceholder}
        aria-label={t('nav.search')}
        className="w-full pl-12 pr-12 py-3.5 bg-white border border-gray-200/60 hover:border-gray-300 focus:border-gray-400 rounded-full text-sm text-gray-700 placeholder-gray-400 tracking-wide outline-none transition-all duration-300"
      />

      {value && (
        <button
          aria-label={t('search.clearFilters')}
          onClick={() => onChange('')}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
        >
          <FaTimes className="w-3.5 h-3.5 text-gray-400" />
        </button>
      )}
    </div>
  );
}
