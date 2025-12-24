'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { Globe, Check, ChevronDown } from 'lucide-react';

const languages: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', nativeName: 'Română' },
];

interface LanguageSelectorProps {
  variant?: 'default' | 'compact' | 'minimal';
  className?: string;
}

export default function LanguageSelector({ variant = 'default', className = '' }: LanguageSelectorProps) {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(l => l.code === language) || languages[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  // Variante minimal - solo icono
  if (variant === 'minimal') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
          title={currentLanguage.nativeName}
        >
          <span className="text-xl">{currentLanguage.flag}</span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-gray-700">{lang.nativeName}</span>
                {language === lang.code && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variante compact - bandera + chevron
  if (variant === 'compact') {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
        >
          <span className="text-lg">{currentLanguage.flag}</span>
          <ChevronDown size={14} className={`text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'bg-blue-50' : ''
                }`}
              >
                <span className="text-xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-medium text-gray-700">{lang.nativeName}</p>
                </div>
                {language === lang.code && (
                  <Check size={16} className="text-blue-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Variante default - completo con icono globe
  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gray-100 transition-all border border-gray-200 hover:border-gray-300"
      >
        <Globe size={18} className="text-gray-500" />
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="font-medium text-gray-700 hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Seleccionar idioma</p>
          </div>
          <div className="py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                  language === lang.code ? 'bg-blue-50/50' : ''
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-800">{lang.nativeName}</p>
                  <p className="text-xs text-gray-500">{lang.name}</p>
                </div>
                {language === lang.code && (
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Check size={14} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
