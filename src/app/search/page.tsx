"use client";

export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useRef, useState, useContext } from 'react';
import { CategoryContext } from '@/components/GlobalCategoryBar';
import { useRouter } from 'next/navigation';
import { Categoria, Anuncio } from '@/types';
import AnunciosListView from '@/components/AnunciosListView';
import AnunciosPhotoView from '@/components/AnunciosPhotoView';
import { SearchTopAd } from '@/components/AdBanner';
import Image from 'next/image';
import { UniversalCard } from '@/components/DesignCards';
import { 
  Search, X, ChevronDown, Filter, MapPin, Euro, SlidersHorizontal,
  ArrowUpDown, Rows3, ImageIcon, RefreshCw, Sparkles, Clock, ChevronUp, Tag, ArrowLeft, Grid3X3, Truck, Check
} from 'lucide-react';

const HISTORY_KEY = 'searchHistory';

type HistoryItem = { q: string; categoria: Categoria | null; ts: number };

const VIEW_MODE_KEY = 'searchViewMode';

interface CategoriaConteo {
  nombre: string;
  cantidad: number;
}

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
  { ciudad: 'Florești', judet: 'Cluj' },
  { ciudad: 'Sinaia', judet: 'Prahova' },
  { ciudad: 'Predeal', judet: 'Brașov' },
  { ciudad: 'Eforie Nord', judet: 'Constanța' },
  { ciudad: 'Mamaia', judet: 'Constanța' },
  { ciudad: 'Neptun', judet: 'Constanța' },
  { ciudad: 'Costinești', judet: 'Constanța' },
  { ciudad: 'Poiana Brașov', judet: 'Brașov' },
  { ciudad: 'Băile Felix', judet: 'Bihor' },
  { ciudad: 'Sovata', judet: 'Mureș' },
  { ciudad: 'Bran', judet: 'Brașov' },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { selectedCategory, setSelectedCategory } = useContext(CategoryContext);
  const [results, setResults] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'photo' | 'grid'>('grid');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [ubicacion, setUbicacion] = useState<string>('');
  const [showUbicacionSugerencias, setShowUbicacionSugerencias] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categorias, setCategorias] = useState<CategoriaConteo[]>([]);
  const [totalAnuncios, setTotalAnuncios] = useState(0);
  const [totalResults, setTotalResults] = useState(0); // Total real de resultados de búsqueda
  const [hoverImageIndex, setHoverImageIndex] = useState<{ [key: string]: number }>({});
  const searchInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const ubicacionRef = useRef<HTMLDivElement>(null);
  const pageSize = 20;
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Filtrar localidades
  const localidadesFiltradas = ubicacion.length >= 2
    ? localidades.filter(loc => 
        loc.ciudad.toLowerCase().includes(ubicacion.toLowerCase()) ||
        loc.judet.toLowerCase().includes(ubicacion.toLowerCase())
      ).slice(0, 6)
    : [];

  const handleSeleccionarUbicacion = (loc: {ciudad: string, judet: string}) => {
    const nuevaUbicacion = `${loc.ciudad}, ${loc.judet}`;
    setUbicacion(nuevaUbicacion);
    setShowUbicacionSugerencias(false);
    // Ejecutar búsqueda con la nueva ubicación
    setResults([]);
    setNextCursor(null);
    fetchPage(query, selectedCategory, null, nuevaUbicacion);
    // Actualizar URL
    let url = `/search?q=${encodeURIComponent(query)}`;
    if (selectedCategory) url += `&categoria=${encodeURIComponent(selectedCategory)}`;
    url += `&ubicacion=${encodeURIComponent(nuevaUbicacion)}`;
    window.history.replaceState(null, '', url);
  };

  // Cargar viewMode de localStorage después del montaje
  useEffect(() => {
    const saved = localStorage.getItem(VIEW_MODE_KEY);
    if (saved === 'list' || saved === 'photo' || saved === 'grid') {
      setViewMode(saved);
    }
  }, []);

  // Cerrar sugerencias de ubicación al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ubicacionRef.current && !ubicacionRef.current.contains(e.target as Node)) {
        setShowUbicacionSugerencias(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cargar categorías con conteo
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          setCategorias(data.categorias);
          setTotalAnuncios(data.total);
        }
      } catch (e) {
        console.error('Error loading categories:', e);
      }
    }
    loadCategories();
  }, []);

  // Cerrar dropdown de categorías al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(e.target as Node)) {
        setShowCategoryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Guardar viewMode en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch (e) {}
  }, []);

  const saveHistory = (item: HistoryItem) => {
    try {
      const next = [item, ...(history.filter(h => !(h.q === item.q && h.categoria === item.categoria)))].slice(0, 5);
      setHistory(next);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
    } catch (e) {}
  };

  const fetchPage = useCallback(async (searchQuery: string, cat: Categoria | null, cursor: number | null, ubicacionFilter?: string) => {
    if (loading) return; // Evitar llamadas múltiples mientras carga
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('q', searchQuery);
      if (cat) params.set('categoria', String(cat));
      const ubi = ubicacionFilter !== undefined ? ubicacionFilter : ubicacion;
      if (ubi) params.set('ubicacion', ubi);
      params.set('pageSize', String(pageSize));
      if (cursor) params.set('cursor', String(cursor));

      const res = await fetch(`/api/search?${params.toString()}`);
      if (!res.ok) throw new Error('Fetch failed');
      const body = await res.json();
      const page: Anuncio[] = (body.results || []).map((r: any) => ({
        ...r,
        fechaPublicacion: r.fechaPublicacion ? new Date(r.fechaPublicacion) : new Date(),
      }));

      if (!cursor) {
        setResults(page);
        setTotalResults(body.total || page.length);
      } else {
        // Evitar duplicados al agregar nuevos resultados
        setResults(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newItems = page.filter(a => !existingIds.has(a.id));
          return [...prev, ...newItems];
        });
      }

      setNextCursor(body.nextCursor || null);
      if (!cursor && searchQuery.trim()) saveHistory({ q: searchQuery.trim(), categoria: cat, ts: Date.now() });
    } catch (err) {
      console.error('Error', err);
    } finally {
      setLoading(false);
    }
  }, [history, loading]);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const qParam = params.get('q') || '';
      const catParam = params.get('categoria') || null;
      const ubicacionParam = params.get('ubicacion') || '';
      setQuery(qParam);
      setSelectedCategory(catParam as Categoria | null);
      setUbicacion(ubicacionParam);
      fetchPage(qParam, catParam as Categoria | null, null, ubicacionParam);
    } catch (e) {
      fetchPage('', null, null, '');
    }
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    // Ejecutar búsqueda directamente y actualizar URL
    setResults([]);
    setNextCursor(null);
    fetchPage(query, selectedCategory, null, ubicacion);
    // Actualizar URL sin recargar
    let url = `/search?q=${encodeURIComponent(query)}`;
    if (selectedCategory) url += `&categoria=${encodeURIComponent(selectedCategory)}`;
    if (ubicacion) url += `&ubicacion=${encodeURIComponent(ubicacion)}`;
    window.history.replaceState(null, '', url);
  };

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && nextCursor && !loading) {
          fetchPage(query, selectedCategory, nextCursor, ubicacion);
        }
      });
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => obs.disconnect();
  }, [sentinelRef, nextCursor, query, selectedCategory, fetchPage, loading, ubicacion]);

  const activeFilters = [minPrice, maxPrice, ubicacion].filter(f => f).length;

  const handleQuickSearch = (q: string) => {
    setQuery(q);
    setShowSuggestions(false);
    // Ejecutar búsqueda directamente y actualizar URL
    setResults([]);
    setNextCursor(null);
    fetchPage(q, selectedCategory, null, ubicacion);
    let url = `/search?q=${encodeURIComponent(q)}`;
    if (selectedCategory) url += `&categoria=${encodeURIComponent(selectedCategory)}`;
    if (ubicacion) url += `&ubicacion=${encodeURIComponent(ubicacion)}`;
    window.history.replaceState(null, '', url);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Header con flecha de retroceso */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <div className="px-3 sm:px-4 lg:px-6 py-3 sm:py-4">
            {/* Barra superior con flecha y filtros */}
            <div className="flex items-center gap-3 mb-3">
              <button
                onClick={() => router.back()}
                className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all active:scale-95"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex-1">
                Buscar
              </h1>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative p-2.5 rounded-xl transition-all active:scale-95 ${
                  showFilters || activeFilters > 0
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                {activeFilters > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {activeFilters}
                  </span>
                )}
              </button>
            </div>

            {/* Search Bar - Diseño completamente renovado */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-stretch">

              {/* Selector de Categorías - Elegante */}
              <div className="relative flex-shrink-0" ref={categoryDropdownRef}>
                <button
                  onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  className="group flex items-center gap-4 px-5 py-3.5 bg-white hover:bg-gray-50/50 rounded-full border border-gray-200/60 hover:border-gray-300 transition-all duration-300 min-w-[180px]"
                >
                  <Tag className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                  <span className="font-normal text-gray-600 truncate text-sm flex-1 text-left tracking-wide">
                    {selectedCategory || 'Categorías'}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-all duration-300 ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown de categorías - Rediseñado */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 max-h-[400px] overflow-hidden min-w-[280px] animate-in fade-in slide-in-from-top-1 duration-200">
                    <div className="overflow-y-auto max-h-[400px] py-2">
                      {/* Opción "Todas las categorías" */}
                      <button
                        onClick={() => {
                          setSelectedCategory(null);
                          setShowCategoryDropdown(false);
                          setQuery('');
                          setResults([]);
                          setNextCursor(null);
                          setTotalResults(0);
                          fetchPage('', null, null, ubicacion);
                        }}
                        className={`w-full flex items-center justify-between px-5 py-3 transition-all duration-200 ${
                          !selectedCategory 
                            ? 'bg-gray-50 text-gray-900' 
                            : 'hover:bg-gray-50/50 text-gray-600'
                        }`}
                      >
                        <span className="text-sm tracking-wide">Todas las categorías</span>
                        <span className="text-xs text-gray-400 font-light">
                          {totalAnuncios}
                        </span>
                      </button>

                      <div className="h-px bg-gray-100 mx-4 my-1" />

                      {/* Lista de categorías */}
                      {categorias.map((cat) => (
                        <button
                          key={cat.nombre}
                          onClick={() => {
                            setSelectedCategory(cat.nombre as Categoria);
                            setShowCategoryDropdown(false);
                            setQuery('');
                            setResults([]);
                            setNextCursor(null);
                            setTotalResults(0);
                            fetchPage('', cat.nombre as Categoria, null, ubicacion);
                          }}
                          className={`w-full flex items-center justify-between px-5 py-3 transition-all duration-200 ${
                            selectedCategory === cat.nombre 
                              ? 'bg-gray-50 text-gray-900' 
                              : 'hover:bg-gray-50/50 text-gray-600'
                          }`}
                        >
                          <span className="flex-1 text-left text-sm tracking-wide">{cat.nombre}</span>
                          <span className="text-xs text-gray-400 font-light">
                            {cat.cantidad}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Form - Elegante */}
              <form onSubmit={handleSubmit} className="flex-1 relative">
                <div className="relative">
                  <div className="flex items-center bg-white rounded-full border border-gray-200/60 hover:border-gray-300 focus-within:border-gray-400 transition-all duration-300 overflow-hidden pr-2">
                    {/* Icono de búsqueda */}
                    <div className="flex items-center justify-center pl-5">
                      <Search className="w-4 h-4 text-gray-300" />
                    </div>

                    <input
                      ref={searchInputRef}
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(e.target.value.length > 0);
                      }}
                      onFocus={() => setShowSuggestions(query.length > 0 || history.length > 0)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                      placeholder="¿Qué estás buscando?"
                      className="flex-1 px-4 py-3.5 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-sm tracking-wide"
                    />
                    
                    {/* Botón limpiar búsqueda */}
                    {query && (
                      <button 
                        type="button" 
                        onClick={() => setQuery('')} 
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                      >
                        <X className="w-3.5 h-3.5 text-gray-400" />
                      </button>
                    )}
                    
                    {/* Botón Buscar - Elegante */}
                    <button
                      type="submit"
                      className="ml-2 px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-full text-sm font-medium flex items-center gap-2 transition-colors duration-300"
                    >
                      <Search className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Buscar</span>
                    </button>
                  </div>

                  {/* Search Suggestions - Elegante */}
                  {showSuggestions && history.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 z-50 max-h-72 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                      {history.length > 0 && query.length === 0 && (
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              Recientes
                            </span>
                            <button 
                              onClick={clearHistory} 
                              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              Borrar
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            {history.slice(0, 5).map((h) => (
                              <button
                                key={`${h.q}-${h.ts}`}
                                onClick={() => handleQuickSearch(h.q)}
                                className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-violet-50 rounded-xl transition-all duration-200 text-left group/history active:bg-violet-100"
                              >
                                <div className="w-10 h-10 bg-gradient-to-br from-violet-50 to-purple-50 group-hover/history:from-violet-100 group-hover/history:to-purple-100 rounded-xl flex items-center justify-center flex-shrink-0 transition-all">
                                  <Clock className="w-5 h-5 text-violet-600" />
                                </div>
                                <span className="text-gray-800 font-semibold text-sm truncate flex-1">{h.q}</span>
                                <ChevronDown className="w-4 h-4 text-gray-400 -rotate-90 opacity-0 group-hover/history:opacity-100 transition-opacity" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>

              {/* Desktop Filter Toggle - Elegante */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`hidden sm:flex px-5 py-3.5 rounded-full text-sm transition-all duration-300 items-center gap-4 whitespace-nowrap ${
                  showFilters || activeFilters > 0
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-600 border border-gray-200/60 hover:border-gray-300'
                }`}
              >
                <SlidersHorizontal className={`w-4 h-4 ${
                  showFilters || activeFilters > 0 ? 'text-white' : 'text-gray-400'
                }`} />
                <span className="font-normal tracking-wide">Filtros</span>
                {activeFilters > 0 && (
                  <span className={`min-w-5 h-5 px-1.5 rounded-full text-xs flex items-center justify-center ${
                    showFilters 
                      ? 'bg-white text-gray-900' 
                      : 'bg-gray-900 text-white'
                  }`}>
                    {activeFilters}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''} ${
                  showFilters || activeFilters > 0 ? 'text-white/60' : 'text-gray-300'
                }`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
        {/* Filters Panel - Mobile Optimized */}
        {showFilters && (
          <div className="mb-4 sm:mb-6 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden animate-in slide-in-from-top-2 duration-300">
            <div className="p-4 sm:p-6 bg-gradient-to-b from-gray-50/80 to-white">
              {/* Mobile Filter Header */}
              <div className="flex items-center justify-between mb-4 sm:hidden">
                <h3 className="text-lg font-bold text-gray-800">Filtros</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {/* Price Range */}
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                      <Euro className="w-4 h-4 text-green-600" />
                    </div>
                    Precio
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        placeholder="Mín"
                        className="w-full px-3 py-3 sm:py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white outline-none transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    </div>
                    <span className="text-gray-300 self-center font-bold">—</span>
                    <div className="relative flex-1">
                      <input
                        type="number"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        placeholder="Máx"
                        className="w-full px-3 py-3 sm:py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white outline-none transition-all"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2.5" ref={ubicacionRef}>
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      ubicacion.includes(',') ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      <MapPin className={`w-4 h-4 ${ubicacion.includes(',') ? 'text-green-500' : 'text-red-500'}`} />
                    </div>
                    Ubicación
                  </label>
                  <div className="relative">
                    <div className={`flex items-center rounded-xl border-2 transition-all ${
                      ubicacion.includes(',')
                        ? 'bg-green-50 border-green-300 shadow-sm shadow-green-100'
                        : 'bg-gray-50 border-gray-100 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-500 focus-within:bg-white'
                    }`}>
                      <input
                        value={ubicacion}
                        onChange={(e) => {
                          setUbicacion(e.target.value);
                          setShowUbicacionSugerencias(true);
                        }}
                        onFocus={() => setShowUbicacionSugerencias(true)}
                        placeholder="Caută localitatea..."
                        className={`flex-1 px-3 py-3 sm:py-2.5 bg-transparent text-base sm:text-sm outline-none transition-all ${
                          ubicacion.includes(',')
                            ? 'text-green-700 font-medium placeholder-green-400'
                            : 'text-gray-900 placeholder-gray-400'
                        }`}
                      />
                      {ubicacion && (
                        <button
                          type="button"
                          onClick={() => {
                            setUbicacion('');
                            setResults([]);
                            setNextCursor(null);
                            fetchPage(query, selectedCategory, null, '');
                            window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}${selectedCategory ? `&categoria=${encodeURIComponent(selectedCategory)}` : ''}`);
                          }}
                          className={`p-2 mr-2 rounded-full transition-all active:scale-90 ${
                            ubicacion.includes(',')
                              ? 'bg-green-200 hover:bg-green-300'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          <X className={`w-3.5 h-3.5 ${ubicacion.includes(',') ? 'text-green-600' : 'text-gray-500'}`} />
                        </button>
                      )}
                    </div>
                    
                    {/* Lista de sugerencias */}
                    {showUbicacionSugerencias && localidadesFiltradas.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {localidadesFiltradas.map((loc, index) => (
                          <button
                            key={`${loc.ciudad}-${loc.judet}-${index}`}
                            type="button"
                            onClick={() => handleSeleccionarUbicacion(loc)}
                            className="w-full px-3 py-2.5 text-left hover:bg-purple-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4 text-purple-500 flex-shrink-0" />
                            <div className="text-sm">
                              <span className="font-medium text-gray-900">{loc.ciudad}</span>
                              <span className="text-gray-500">, {loc.judet}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                    
                    {/* Mensaje si no hay resultados */}
                    {showUbicacionSugerencias && ubicacion.length >= 2 && localidadesFiltradas.length === 0 && !ubicacion.includes(',') && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-center text-gray-500 text-sm">
                        Nu s-au găsit rezultate
                      </div>
                    )}
                  </div>
                </div>

                {/* Sort */}
                <div className="space-y-2.5">
                  <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                      <ArrowUpDown className="w-4 h-4 text-blue-600" />
                    </div>
                    Ordenar
                  </label>
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-3 py-3 sm:py-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-base sm:text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-300 focus:bg-white outline-none appearance-none cursor-pointer transition-all pr-10"
                    >
                      <option value="recent">Más recientes</option>
                      <option value="price_asc">Menor precio</option>
                      <option value="price_desc">Mayor precio</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2.5 sm:space-y-2.5">
                  <label className="text-sm font-bold text-gray-700 hidden sm:block">&nbsp;</label>
                  <div className="flex gap-2 sm:flex-col">
                    <button
                      onClick={() => {
                        setMinPrice('');
                        setMaxPrice('');
                        setUbicacion('');
                      }}
                      className="flex-1 sm:flex-none px-4 py-3 sm:py-2.5 bg-red-50 text-red-600 rounded-xl font-semibold text-sm hover:bg-red-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Limpiar
                    </button>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="flex-1 sm:hidden px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg active:scale-95"
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Banner publicitario arriba de resultados */}
        <SearchTopAd className="mb-4 sm:mb-6 rounded-xl overflow-hidden" />

        {/* Results Header - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25">
              <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold text-gray-800">{totalResults}</span>
                <span className="text-sm sm:text-base text-gray-500 font-medium">resultados</span>
              </div>
              {query && (
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                  para "<span className="text-purple-600 font-semibold">{query}</span>"
                  {selectedCategory && (
                    <span className="ml-1">
                      en <span className="text-indigo-600 font-semibold">{selectedCategory}</span>
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* View Mode & Sort - Mobile */}
          <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3">
            {/* Mobile Sort */}
            <div className="sm:hidden relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-100 text-gray-700 text-sm font-medium px-3 py-2.5 pr-8 rounded-xl outline-none"
              >
                <option value="recent">Recientes</option>
                <option value="price_asc">- Precio</option>
                <option value="price_desc">+ Precio</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 sm:p-2 rounded-lg transition-all active:scale-95 ${
                  viewMode === 'grid' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista grid"
              >
                <Grid3X3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 sm:p-2 rounded-lg transition-all active:scale-95 ${
                  viewMode === 'list' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista lista"
              >
                <Rows3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('photo')}
                className={`p-2.5 sm:p-2 rounded-lg transition-all active:scale-95 ${
                  viewMode === 'photo' 
                    ? 'bg-white text-purple-600 shadow-md' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                title="Vista fotos"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Pills - Mobile */}
        {activeFilters > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
            {minPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <Euro className="w-3.5 h-3.5" />
                Desde {minPrice}€
                <button onClick={() => setMinPrice('')} className="ml-0.5 hover:text-purple-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <Euro className="w-3.5 h-3.5" />
                Hasta {maxPrice}€
                <button onClick={() => setMaxPrice('')} className="ml-0.5 hover:text-purple-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
            {ubicacion && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <MapPin className="w-3.5 h-3.5" />
                {ubicacion}
                <button onClick={() => {
                  setUbicacion('');
                  setResults([]);
                  setNextCursor(null);
                  fetchPage(query, selectedCategory, null, '');
                  window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}${selectedCategory ? `&categoria=${encodeURIComponent(selectedCategory)}` : ''}`);
                }} className="ml-0.5 hover:text-purple-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* Results Container - Mobile Optimized */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {loading && !nextCursor ? (
            <div className="py-16 sm:py-24 text-center px-4">
              <div className="inline-flex flex-col items-center">
                <div className="relative inline-flex mb-5">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-100 rounded-full" />
                  <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-600 font-semibold text-base sm:text-lg">Buscando anuncios...</p>
                <p className="text-gray-400 text-sm mt-1">Esto puede tardar unos segundos</p>
              </div>
            </div>
          ) : results.length === 0 && !loading ? (
            <div className="py-16 sm:py-24 text-center px-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner">
                <Search className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">No hay resultados</h3>
              <p className="text-gray-500 mb-6 sm:mb-8 text-sm sm:text-base max-w-sm mx-auto">
                No encontramos anuncios que coincidan con tu búsqueda
              </p>
              <button
                onClick={() => { setQuery(''); setSelectedCategory(null); setMinPrice(''); setMaxPrice(''); setUbicacion(''); setNextCursor(null); }}
                className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:from-purple-700 hover:to-indigo-700 transition-all shadow-xl shadow-purple-500/25 active:scale-95"
              >
                <RefreshCw className="w-5 h-5" />
                Nueva búsqueda
              </button>
            </div>
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              {(() => {
                let filtered = results.filter(r => {
                  if (minPrice !== '' && r.precio < Number(minPrice)) return false;
                  if (maxPrice !== '' && r.precio > Number(maxPrice)) return false;
                  // El filtro de ubicación ya se aplica en la API, no filtrar aquí
                  return true;
                });

                if (sortBy === 'price_asc') filtered = [...filtered].sort((a, b) => a.precio - b.precio);
                if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.precio - a.precio);

                if (filtered.length === 0) {
                  return (
                    <div className="py-12 sm:py-16 text-center px-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <Filter className="w-8 h-8 text-orange-500" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Filtros muy restrictivos</h3>
                      <p className="text-gray-500 text-sm sm:text-base mb-5 max-w-sm mx-auto">
                        No hay anuncios que coincidan con estos filtros
                      </p>
                      <button
                        onClick={() => {
                          setMinPrice('');
                          setMaxPrice('');
                          setUbicacion('');
                          // Buscar sin filtro de ubicación
                          setResults([]);
                          setNextCursor(null);
                          fetchPage(query, selectedCategory, null, '');
                          window.history.replaceState(null, '', `/search?q=${encodeURIComponent(query)}${selectedCategory ? `&categoria=${encodeURIComponent(selectedCategory)}` : ''}`);
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg active:scale-95"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Quitar filtros
                      </button>
                    </div>
                  );
                }

                return viewMode === 'photo' ? (
                  <AnunciosPhotoView anuncios={filtered} onToggleFavorito={() => {}} compact={true} />
                ) : viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filtered.map((anuncio) => (
                      <UniversalCard key={anuncio.id} anuncio={anuncio} />
                    ))}
                  </div>
                ) : (
                  <AnunciosListView anuncios={filtered} compact={true} />
                );
              })()}
            </div>
          )}

          {/* Load More Indicator */}
          {loading && nextCursor && (
            <div className="py-5 sm:py-6 text-center border-t border-gray-100">
              <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-purple-50 rounded-full">
                <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-purple-700 font-semibold text-sm">Cargando más anuncios...</span>
              </div>
            </div>
          )}

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />
        </div>

        {/* Tips Section - Mobile Optimized */}
        {results.length === 0 && !loading && (
          <div className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-100/50">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-4 flex items-center gap-2.5">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-blue-600" />
              </div>
              Consejos para mejorar tu búsqueda
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3 sm:p-4">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <p className="text-gray-800 font-medium text-sm sm:text-base">Palabras generales</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Usa términos más amplios</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3 sm:p-4">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <p className="text-gray-800 font-medium text-sm sm:text-base">Revisa ortografía</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Verifica que esté bien escrito</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-white/60 rounded-xl p-3 sm:p-4">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <p className="text-gray-800 font-medium text-sm sm:text-base">Amplía filtros</p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Quita o ajusta los filtros</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Bottom Action Bar */}
      {results.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 sm:hidden bg-white/95 backdrop-blur-xl border-t border-gray-200 p-3 safe-area-pb z-30">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <button
              onClick={() => setShowFilters(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95 ${
                activeFilters > 0
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filtros
              {activeFilters > 0 && (
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{activeFilters}</span>
              )}
            </button>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="p-3 bg-gray-100 text-gray-700 rounded-xl active:scale-95 transition-all"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bottom Padding for Mobile Action Bar */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
