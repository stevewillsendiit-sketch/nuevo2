

"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import { Search, MapPin, Grid3X3, ChevronUp, ChevronDown, X, Check } from 'lucide-react';

import { createContext } from 'react';
// Contexto para compartir la categoría seleccionada globalmente
export const CategoryContext = createContext<{
  selectedCategory: Categoria | null;
  setSelectedCategory: (cat: Categoria | null) => void;
}>({ selectedCategory: null, setSelectedCategory: () => {} });

import { usePathname } from 'next/navigation';
import { useContext } from 'react';
import CategoryChips from './CategoryChips';
import { Categoria } from '@/types';
import FeaturedSlider from './FeaturedSlider';
import { useLanguage } from '@/contexts/LanguageContext';

// Base de datos de localidades de Rumania
const localidades: Array<{ciudad: string, judet: string}> = [
  { ciudad: 'București', judet: 'București' },
  { ciudad: 'Cluj-Napoca', judet: 'Cluj' },
  { ciudad: 'Timișoara', judet: 'Timiș' },
  { ciudad: 'Iași', judet: 'Iași' },
  { ciudad: 'Constanța', judet: 'Constanța' },
  { ciudad: 'Craiova', judet: 'Dolj' },
  { ciudad: 'Brașov', judet: 'Brașov' },
  { ciudad: 'Galați', judet: 'Galați' },
  { ciudad: 'Ploiești', judet: 'Prahova' },
  { ciudad: 'Oradea', judet: 'Bihor' },
  { ciudad: 'Brăila', judet: 'Brăila' },
  { ciudad: 'Arad', judet: 'Arad' },
  { ciudad: 'Pitești', judet: 'Argeș' },
  { ciudad: 'Sibiu', judet: 'Sibiu' },
  { ciudad: 'Bacău', judet: 'Bacău' },
  { ciudad: 'Târgu Mureș', judet: 'Mureș' },
  { ciudad: 'Baia Mare', judet: 'Maramureș' },
  { ciudad: 'Buzău', judet: 'Buzău' },
  { ciudad: 'Botoșani', judet: 'Botoșani' },
  { ciudad: 'Satu Mare', judet: 'Satu Mare' },
  { ciudad: 'Râmnicu Vâlcea', judet: 'Vâlcea' },
  { ciudad: 'Drobeta-Turnu Severin', judet: 'Mehedinți' },
  { ciudad: 'Suceava', judet: 'Suceava' },
  { ciudad: 'Piatra Neamț', judet: 'Neamț' },
  { ciudad: 'Târgu Jiu', judet: 'Gorj' },
  { ciudad: 'Târgoviște', judet: 'Dâmbovița' },
  { ciudad: 'Focșani', judet: 'Vrancea' },
  { ciudad: 'Bistrița', judet: 'Bistrița-Năsăud' },
  { ciudad: 'Reșița', judet: 'Caraș-Severin' },
  { ciudad: 'Tulcea', judet: 'Tulcea' },
  { ciudad: 'Călărași', judet: 'Călărași' },
  { ciudad: 'Giurgiu', judet: 'Giurgiu' },
  { ciudad: 'Alba Iulia', judet: 'Alba' },
  { ciudad: 'Deva', judet: 'Hunedoara' },
  { ciudad: 'Hunedoara', judet: 'Hunedoara' },
  { ciudad: 'Zalău', judet: 'Sălaj' },
  { ciudad: 'Sfântu Gheorghe', judet: 'Covasna' },
  { ciudad: 'Bârlad', judet: 'Vaslui' },
  { ciudad: 'Vaslui', judet: 'Vaslui' },
  { ciudad: 'Roman', judet: 'Neamț' },
  { ciudad: 'Turda', judet: 'Cluj' },
  { ciudad: 'Mediaș', judet: 'Sibiu' },
  { ciudad: 'Slobozia', judet: 'Ialomița' },
  { ciudad: 'Alexandria', judet: 'Teleorman' },
  { ciudad: 'Voluntari', judet: 'Ilfov' },
  { ciudad: 'Lugoj', judet: 'Timiș' },
  { ciudad: 'Medgidia', judet: 'Constanța' },
  { ciudad: 'Onești', judet: 'Bacău' },
  { ciudad: 'Slatina', judet: 'Olt' },
  { ciudad: 'Mangalia', judet: 'Constanța' },
  { ciudad: 'Tecuci', judet: 'Galați' },
  { ciudad: 'Odorheiu Secuiesc', judet: 'Harghita' },
  { ciudad: 'Mioveni', judet: 'Argeș' },
  { ciudad: 'Râmnicu Sărat', judet: 'Buzău' },
  { ciudad: 'Petroșani', judet: 'Hunedoara' },
  { ciudad: 'Câmpina', judet: 'Prahova' },
  { ciudad: 'Miercurea Ciuc', judet: 'Harghita' },
  { ciudad: 'Săcele', judet: 'Brașov' },
  { ciudad: 'Câmpulung', judet: 'Argeș' },
  { ciudad: 'Caracal', judet: 'Olt' },
  { ciudad: 'Făgăraș', judet: 'Brașov' },
  { ciudad: 'Reghin', judet: 'Mureș' },
  { ciudad: 'Huși', judet: 'Vaslui' },
  { ciudad: 'Dorohoi', judet: 'Botoșani' },
  { ciudad: 'Sighișoara', judet: 'Mureș' },
  { ciudad: 'Câmpia Turzii', judet: 'Cluj' },
  { ciudad: 'Pașcani', judet: 'Iași' },
  { ciudad: 'Dej', judet: 'Cluj' },
  { ciudad: 'Fetești', judet: 'Ialomița' },
  { ciudad: 'Caransebeș', judet: 'Caraș-Severin' },
  { ciudad: 'Roșiorii de Vede', judet: 'Teleorman' },
  { ciudad: 'Curtea de Argeș', judet: 'Argeș' },
  { ciudad: 'Sebeș', judet: 'Alba' },
  { ciudad: 'Năvodari', judet: 'Constanța' },
  { ciudad: 'Petrila', judet: 'Hunedoara' },
  { ciudad: 'Aiud', judet: 'Alba' },
  { ciudad: 'Lupeni', judet: 'Hunedoara' },
  { ciudad: 'Oltenița', judet: 'Călărași' },
  { ciudad: 'Turnu Măgurele', judet: 'Teleorman' },
  { ciudad: 'Vulcan', judet: 'Hunedoara' },
  { ciudad: 'Codlea', judet: 'Brașov' },
  { ciudad: 'Blaj', judet: 'Alba' },
  { ciudad: 'Rădăuți', judet: 'Suceava' },
  { ciudad: 'Adjud', judet: 'Vrancea' },
  { ciudad: 'Moreni', judet: 'Dâmbovița' },
  { ciudad: 'Comănești', judet: 'Bacău' },
  { ciudad: 'Vatra Dornei', judet: 'Suceava' },
  { ciudad: 'Sighetu Marmației', judet: 'Maramureș' },
  { ciudad: 'Borșa', judet: 'Maramureș' },
  { ciudad: 'Găești', judet: 'Dâmbovița' },
  { ciudad: 'Motru', judet: 'Gorj' },
  { ciudad: 'Carei', judet: 'Satu Mare' },
  { ciudad: 'Gherla', judet: 'Cluj' },
  { ciudad: 'Urziceni', judet: 'Ialomița' },
  { ciudad: 'Fălticeni', judet: 'Suceava' },
  { ciudad: 'Orăștie', judet: 'Hunedoara' },
  { ciudad: 'Rovinari', judet: 'Gorj' },
  { ciudad: 'Buftea', judet: 'Ilfov' },
  { ciudad: 'Târnăveni', judet: 'Mureș' },
  { ciudad: 'Târgu Neamț', judet: 'Neamț' },
  { ciudad: 'Breaza', judet: 'Prahova' },
  { ciudad: 'Pantelimon', judet: 'Ilfov' },
  { ciudad: 'Măgurele', judet: 'Ilfov' },
  { ciudad: 'Popești-Leordeni', judet: 'Ilfov' },
  { ciudad: 'Chitila', judet: 'Ilfov' },
  { ciudad: 'Bragadiru', judet: 'Ilfov' },
  { ciudad: 'Otopeni', judet: 'Ilfov' },
  { ciudad: 'Florești', judet: 'Cluj' },
  { ciudad: 'Sinaia', judet: 'Prahova' },
  { ciudad: 'Predeal', judet: 'Brașov' },
  { ciudad: 'Eforie Nord', judet: 'Constanța' },
  { ciudad: 'Eforie Sud', judet: 'Constanța' },
  { ciudad: 'Mamaia', judet: 'Constanța' },
  { ciudad: 'Neptun', judet: 'Constanța' },
  { ciudad: 'Jupiter', judet: 'Constanța' },
  { ciudad: 'Venus', judet: 'Constanța' },
  { ciudad: 'Costinești', judet: 'Constanța' },
  { ciudad: 'Poiana Brașov', judet: 'Brașov' },
  { ciudad: 'Băile Felix', judet: 'Bihor' },
  { ciudad: 'Băile Herculane', judet: 'Caraș-Severin' },
  { ciudad: 'Sovata', judet: 'Mureș' },
  { ciudad: 'Bran', judet: 'Brașov' },
];

export default function GlobalCategoryBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { t } = useLanguage();
  const { selectedCategory, setSelectedCategory } = useContext(CategoryContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [ubicacionBusqueda, setUbicacionBusqueda] = useState('');
  const [ubicacionSeleccionada, setUbicacionSeleccionada] = useState('');
  const [showUbicacionSugerencias, setShowUbicacionSugerencias] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const ubicacionRef = useRef<HTMLDivElement>(null);

  // Cargar preferencia de localStorage al montar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('showCategories');
      if (saved !== null) {
        setShowCategories(saved === 'true');
      }
    }
  }, []);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ubicacionRef.current && !ubicacionRef.current.contains(e.target as Node)) {
        setShowUbicacionSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // No mostrar en la página de explorar (después de todos los hooks)
  if (pathname === '/explore') return null;

  // Filtrar localidades
  const localidadesFiltradas = ubicacionBusqueda.length >= 2
    ? localidades.filter(loc => 
        loc.ciudad.toLowerCase().includes(ubicacionBusqueda.toLowerCase()) ||
        loc.judet.toLowerCase().includes(ubicacionBusqueda.toLowerCase())
      ).slice(0, 8)
    : [];

  const handleSeleccionarUbicacion = (loc: {ciudad: string, judet: string}) => {
    setUbicacionSeleccionada(`${loc.ciudad}, ${loc.judet}`);
    setUbicacionBusqueda(`${loc.ciudad}, ${loc.judet}`);
    setShowUbicacionSugerencias(false);
  };

  const limpiarUbicacion = () => {
    setUbicacionBusqueda('');
    setUbicacionSeleccionada('');
  };

  // Guardar preferencia en localStorage
  const toggleCategories = () => {
    const newValue = !showCategories;
    setShowCategories(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('showCategories', String(newValue));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('q', searchQuery.trim());
    }
    if (ubicacionSeleccionada || ubicacionBusqueda.trim()) {
      params.set('ubicacion', ubicacionSeleccionada || ubicacionBusqueda.trim());
    }
    const queryString = params.toString();
    router.push(`/search${queryString ? `?${queryString}` : ''}`);
  };

  // Solo mostrar en la página principal, no en búsqueda
  if (pathname !== '/') return null;
  return (
    <div className="w-full flex flex-col items-center bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl w-full px-4 sm:px-6">
        {/* Barra de búsqueda */}
        <div className="pt-6">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            {/* Botón mostrar/ocultar categorías - Al principio */}
            <button
              type="button"
              onClick={toggleCategories}
              className={`px-4 py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 text-sm font-medium border-2 active:scale-95 ${
                showCategories 
                  ? 'bg-purple-50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/50' 
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
              <span className="hidden sm:inline">{showCategories ? t('general.close') : t('home.categories')}</span>
              {showCategories ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {/* Input de búsqueda */}
            <div className="relative group flex-1">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 group-focus-within:border-purple-300 dark:group-focus-within:border-purple-600 focus-within:shadow-lg dark:focus-within:shadow-purple-900/20 transition-all duration-300">
                <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 ml-4 flex-shrink-0" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('home.hero.title')}
                  className="flex-1 px-3 py-3.5 bg-transparent outline-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 text-base"
                />
              </div>
            </div>

            {/* Input de ubicación con autocompletado */}
            <div className="relative sm:w-64" ref={ubicacionRef}>
              <div className={`relative flex items-center bg-white dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300 ${
                ubicacionSeleccionada 
                  ? 'border-green-400 dark:border-green-500 shadow-sm shadow-green-100' 
                  : 'border-gray-200 dark:border-gray-700 focus-within:border-blue-300 dark:focus-within:border-blue-600 focus-within:shadow-lg'
              }`}>
                <MapPin className={`w-5 h-5 ml-4 flex-shrink-0 transition-colors ${
                  ubicacionSeleccionada 
                    ? 'text-green-500' 
                    : 'text-gray-400 dark:text-gray-500'
                }`} />
                <input
                  value={ubicacionBusqueda}
                  onChange={(e) => {
                    setUbicacionBusqueda(e.target.value);
                    setShowUbicacionSugerencias(true);
                    if (ubicacionSeleccionada) {
                      setUbicacionSeleccionada('');
                    }
                  }}
                  onFocus={() => setShowUbicacionSugerencias(true)}
                  placeholder={t('ad.location')}
                  className={`flex-1 px-3 py-3.5 bg-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 text-base min-w-0 ${
                    ubicacionSeleccionada 
                      ? 'text-green-700 dark:text-green-300 font-medium' 
                      : 'text-gray-800 dark:text-gray-100'
                  }`}
                />
                {ubicacionBusqueda && (
                  <button
                    type="button"
                    onClick={limpiarUbicacion}
                    className={`p-2 mr-2 rounded-full transition-all active:scale-90 ${
                      ubicacionSeleccionada 
                        ? 'bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900' 
                        : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                    }`}
                  >
                    <X className={`w-3.5 h-3.5 ${ubicacionSeleccionada ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  </button>
                )}
              </div>

              {/* Lista de sugerencias */}
              {showUbicacionSugerencias && localidadesFiltradas.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto">
                  {localidadesFiltradas.map((loc, index) => (
                    <button
                      key={`${loc.ciudad}-${loc.judet}-${index}`}
                      type="button"
                      onClick={() => handleSeleccionarUbicacion(loc)}
                      className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 flex items-center gap-3"
                    >
                      <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{loc.ciudad}</span>
                        <span className="text-gray-500 dark:text-gray-400">, {loc.judet}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Mensaje si no hay resultados */}
              {showUbicacionSugerencias && ubicacionBusqueda.length >= 2 && localidadesFiltradas.length === 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl p-4 text-center text-gray-500 dark:text-gray-400">
                  Nu s-au găsit rezultate pentru &quot;{ubicacionBusqueda}&quot;
                </div>
              )}
            </div>

            {/* Botón de búsqueda */}
            <button
              type="submit"
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 text-sm font-semibold shadow-lg shadow-purple-500/25 active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span>{t('home.search.button')}</span>
            </button>
          </form>
        </div>

        {/* Categorías - con animación de mostrar/ocultar */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showCategories ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
          <div className="py-6 mt-4 mb-6">
          <CategoryChips
            mode="tiles"
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
          </div>
        </div>
      </div>

      {/* Slider de anuncios Destacados - Solo mostrar cuando NO hay categoría seleccionada */}
      {!selectedCategory && <FeaturedSlider limit={10} source="destacado" />}
    </div>
  );
}
