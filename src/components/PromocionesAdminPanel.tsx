'use client';

import { useState, useEffect } from 'react';
import {
  Euro,
  Percent,
  Tag,
  Users,
  Gift,
  Trash2,
  Plus,
  CheckCircle,
  XCircle,
  Calendar,
  Loader2,
  Search,
  X,
  Sparkles,
  Crown,
  Star,
  Copy,
  Edit,
} from 'lucide-react';
import {
  getConfiguracionPromociones,
  updateConfiguracionPromociones,
  getCodigosDescuento,
  crearCodigoDescuento,
  toggleCodigoDescuento,
  eliminarCodigoDescuento,
  darCreditosATodos,
  type ConfiguracionPromociones,
  type CodigoDescuento,
} from '@/lib/promociones.service';
import { addCreditosManual } from '@/lib/bonificaciones.service';
import { Usuario } from '@/types';

interface PromocionesAdminPanelProps {
  usuarios: Usuario[];
  user: { uid: string; email: string } | null;
  toastSuccess: (title: string, message?: string) => void;
  toastError: (title: string, message?: string) => void;
  toastWarning: (title: string, message?: string) => void;
}

export default function PromocionesAdminPanel({
  usuarios,
  user,
  toastSuccess,
  toastError,
  toastWarning,
}: PromocionesAdminPanelProps) {
  // Estados
  const [activeSection, setActiveSection] = useState<'creditos' | 'precios' | 'codigos'>('creditos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Configuración de promociones
  const [config, setConfig] = useState<ConfiguracionPromociones>({
    precioVIP: 10,
    precioPremium: 5,
    precioDestacado: 2,
    descuentoGlobalPorcentaje: 0,
    descuentoGlobalActivo: false,
    mensajePromo: '',
    mensajePromoActivo: false,
  });
  
  // Códigos de descuento
  const [codigos, setCodigos] = useState<CodigoDescuento[]>([]);
  const [showCrearCodigo, setShowCrearCodigo] = useState(false);
  const [nuevoCodigo, setNuevoCodigo] = useState({
    codigo: '',
    tipo: 'porcentaje' as 'porcentaje' | 'fijo',
    valor: 10,
    descripcion: '',
    aplicaA: 'todo' as 'todo' | 'promociones' | 'recargas',
    usosMaximos: 0,
    diasValidez: 30,
  });
  
  // Dar créditos
  const [showDarCreditos, setShowDarCreditos] = useState(false);
  const [creditosParaTodos, setCreditosParaTodos] = useState(true);
  const [cantidadCreditos, setCantidadCreditos] = useState(1);
  const [motivoCreditos, setMotivoCreditos] = useState('');
  const [usuarioSearch, setUsuarioSearch] = useState('');
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);
  const [dandoCreditos, setDandoCreditos] = useState(false);

  // Cargar datos
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [configData, codigosData] = await Promise.all([
        getConfiguracionPromociones(),
        getCodigosDescuento(),
      ]);
      setConfig(configData);
      setCodigos(codigosData);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  // Guardar configuración de precios
  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const success = await updateConfiguracionPromociones(config);
      if (success) {
        toastSuccess('Configuración guardada', 'Los precios de promociones han sido actualizados');
      } else {
        toastError('Error', 'No se pudo guardar la configuración');
      }
    } catch (error) {
      toastError('Error', 'No se pudo guardar la configuración');
    }
    setSaving(false);
  };

  // Crear código de descuento
  const handleCrearCodigo = async () => {
    if (!nuevoCodigo.codigo.trim()) {
      toastWarning('Código requerido', 'Introduce un código de descuento');
      return;
    }
    
    setSaving(true);
    try {
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + nuevoCodigo.diasValidez);
      
      await crearCodigoDescuento({
        codigo: nuevoCodigo.codigo.toUpperCase(),
        tipo: nuevoCodigo.tipo,
        valor: nuevoCodigo.valor,
        descripcion: nuevoCodigo.descripcion,
        aplicaA: nuevoCodigo.aplicaA,
        usosMaximos: nuevoCodigo.usosMaximos,
        fechaInicio,
        fechaFin,
        activo: true,
        creadoPor: user?.uid || '',
      });
      
      toastSuccess('Código creado', `El código ${nuevoCodigo.codigo.toUpperCase()} está listo para usar`);
      setShowCrearCodigo(false);
      setNuevoCodigo({
        codigo: '',
        tipo: 'porcentaje',
        valor: 10,
        descripcion: '',
        aplicaA: 'todo',
        usosMaximos: 0,
        diasValidez: 30,
      });
      loadData();
    } catch (error) {
      toastError('Error', 'No se pudo crear el código');
    }
    setSaving(false);
  };

  // Dar créditos
  const handleDarCreditos = async () => {
    if (!creditosParaTodos && !usuarioSeleccionado) {
      toastWarning('Usuario requerido', 'Selecciona un usuario');
      return;
    }
    
    setDandoCreditos(true);
    try {
      if (creditosParaTodos) {
        const resultado = await darCreditosATodos(
          cantidadCreditos,
          motivoCreditos || 'Regalo de administración',
          user?.uid || '',
          usuarios.map(u => u.id)
        );
        toastSuccess(
          `¡${cantidadCreditos}€ enviados!`,
          `${resultado.exitosos} usuarios recibieron créditos${resultado.fallidos > 0 ? ` (${resultado.fallidos} fallidos)` : ''}`
        );
      } else {
        const resultado = await addCreditosManual(
          usuarioSeleccionado!.id,
          cantidadCreditos,
          motivoCreditos || 'Regalo de administración'
        );
        if (resultado.success) {
          toastSuccess(
            `¡${cantidadCreditos}€ enviados!`,
            `${usuarioSeleccionado!.nombre || usuarioSeleccionado!.email} ahora tiene ${resultado.nuevoSaldo?.toFixed(2)}€`
          );
        } else {
          toastError('Error', 'No se pudieron enviar los créditos');
        }
      }
      setShowDarCreditos(false);
      setCantidadCreditos(1);
      setMotivoCreditos('');
      setUsuarioSeleccionado(null);
    } catch (error) {
      toastError('Error', 'No se pudieron enviar los créditos');
    }
    setDandoCreditos(false);
  };

  // Filtrar usuarios para búsqueda
  const usuariosFiltrados = usuarioSearch.trim()
    ? usuarios.filter(u =>
        u.nombre?.toLowerCase().includes(usuarioSearch.toLowerCase()) ||
        u.email?.toLowerCase().includes(usuarioSearch.toLowerCase())
      ).slice(0, 5)
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-500" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con tabs */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button
            onClick={() => setActiveSection('creditos')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              activeSection === 'creditos'
                ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Euro size={20} />
            <span>Dar Créditos</span>
          </button>
          <button
            onClick={() => setActiveSection('precios')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              activeSection === 'precios'
                ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Percent size={20} />
            <span>Precios y Descuentos</span>
          </button>
          <button
            onClick={() => setActiveSection('codigos')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-medium transition-all ${
              activeSection === 'codigos'
                ? 'bg-amber-50 text-amber-700 border-b-2 border-amber-500'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Tag size={20} />
            <span>Códigos de Descuento</span>
          </button>
        </div>

        {/* Sección: Dar Créditos */}
        {activeSection === 'creditos' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel principal */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Gift size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Dar Créditos</h3>
                      <p className="text-emerald-100 text-sm">Regala euros a tus usuarios</p>
                    </div>
                  </div>
                  
                  {/* Selector: Todos o Individual */}
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => {
                        setCreditosParaTodos(true);
                        setUsuarioSeleccionado(null);
                      }}
                      className={`flex-1 p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                        creditosParaTodos
                          ? 'bg-white text-emerald-600 font-semibold'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Users size={18} />
                      Todos ({usuarios.length})
                    </button>
                    <button
                      onClick={() => setCreditosParaTodos(false)}
                      className={`flex-1 p-3 rounded-xl transition-all flex items-center justify-center gap-2 ${
                        !creditosParaTodos
                          ? 'bg-white text-emerald-600 font-semibold'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      <Search size={18} />
                      Usuario específico
                    </button>
                  </div>
                  
                  {/* Búsqueda de usuario */}
                  {!creditosParaTodos && (
                    <div className="mb-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-200" size={18} />
                        <input
                          type="text"
                          value={usuarioSearch}
                          onChange={(e) => setUsuarioSearch(e.target.value)}
                          placeholder="Buscar usuario..."
                          className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-emerald-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                      </div>
                      
                      {/* Resultados de búsqueda */}
                      {usuariosFiltrados.length > 0 && !usuarioSeleccionado && (
                        <div className="mt-2 bg-white rounded-xl overflow-hidden shadow-lg">
                          {usuariosFiltrados.map(u => (
                            <button
                              key={u.id}
                              onClick={() => {
                                setUsuarioSeleccionado(u);
                                setUsuarioSearch('');
                              }}
                              className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 border-b last:border-0"
                            >
                              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                                {u.nombre?.[0] || u.email?.[0] || '?'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{u.nombre || 'Sin nombre'}</p>
                                <p className="text-sm text-gray-500">{u.email}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Usuario seleccionado */}
                      {usuarioSeleccionado && (
                        <div className="mt-2 bg-white/20 rounded-xl p-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-emerald-600 font-semibold">
                              {usuarioSeleccionado.nombre?.[0] || usuarioSeleccionado.email?.[0] || '?'}
                            </div>
                            <div>
                              <p className="font-medium text-white">{usuarioSeleccionado.nombre || 'Sin nombre'}</p>
                              <p className="text-sm text-emerald-100">{usuarioSeleccionado.email}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setUsuarioSeleccionado(null)}
                            className="p-2 hover:bg-white/20 rounded-lg"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Cantidad */}
                  <div className="mb-4">
                    <label className="text-emerald-100 text-sm mb-2 block">Cantidad (€)</label>
                    <div className="flex gap-2 mb-2">
                      {[1, 5, 10, 25, 50].map(cant => (
                        <button
                          key={cant}
                          onClick={() => setCantidadCreditos(cant)}
                          className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                            cantidadCreditos === cant
                              ? 'bg-white text-emerald-600'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {cant}€
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      value={cantidadCreditos}
                      onChange={(e) => setCantidadCreditos(parseFloat(e.target.value) || 0)}
                      min="0.01"
                      step="0.01"
                      className="w-full px-4 py-3 bg-white/20 text-white placeholder-emerald-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Cantidad personalizada..."
                    />
                  </div>
                  
                  {/* Motivo */}
                  <div className="mb-4">
                    <label className="text-emerald-100 text-sm mb-2 block">Motivo (opcional)</label>
                    <input
                      type="text"
                      value={motivoCreditos}
                      onChange={(e) => setMotivoCreditos(e.target.value)}
                      className="w-full px-4 py-3 bg-white/20 text-white placeholder-emerald-200 rounded-xl border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Ej: Regalo de Navidad, compensación..."
                    />
                  </div>
                  
                  {/* Resumen y botón */}
                  <div className="bg-white/10 rounded-xl p-4 mb-4">
                    <p className="text-emerald-100 text-sm">
                      {creditosParaTodos ? (
                        <>Se enviarán <span className="font-bold text-white">{cantidadCreditos}€</span> a <span className="font-bold text-white">{usuarios.length} usuarios</span></>
                      ) : usuarioSeleccionado ? (
                        <>Se enviarán <span className="font-bold text-white">{cantidadCreditos}€</span> a <span className="font-bold text-white">{usuarioSeleccionado.nombre || usuarioSeleccionado.email}</span></>
                      ) : (
                        <>Selecciona un usuario</>
                      )}
                    </p>
                    {creditosParaTodos && (
                      <p className="text-emerald-200 text-xs mt-1">
                        Total: {(cantidadCreditos * usuarios.length).toFixed(2)}€
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={handleDarCreditos}
                    disabled={dandoCreditos || (!creditosParaTodos && !usuarioSeleccionado) || cantidadCreditos <= 0}
                    className="w-full py-4 bg-white text-emerald-600 rounded-xl font-bold hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {dandoCreditos ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        Enviando...
                      </>
                    ) : (
                      <>
                        <Gift size={20} />
                        {creditosParaTodos ? `Enviar ${cantidadCreditos}€ a todos` : `Enviar ${cantidadCreditos}€`}
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              {/* Estadísticas */}
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Resumen de Usuarios</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-gray-500 text-sm">Total usuarios</p>
                      <p className="text-2xl font-bold text-gray-900">{usuarios.length}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4">
                      <p className="text-gray-500 text-sm">Verificados</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        {usuarios.filter(u => u.verificado).length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección: Precios y Descuentos */}
        {activeSection === 'precios' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Precios de promociones */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="text-purple-500" size={20} />
                  Precios de Promociones
                </h3>
                
                <div className="space-y-4">
                  {/* VIP */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                    <div className="flex items-center gap-3">
                      <Crown className="text-amber-500" size={24} />
                      <div>
                        <p className="font-semibold text-amber-800">VIP</p>
                        <p className="text-xs text-amber-600">Máxima visibilidad</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.precioVIP}
                        onChange={(e) => setConfig({ ...config, precioVIP: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-3 py-2 border border-amber-300 rounded-lg text-center font-bold"
                        min="0"
                        step="0.5"
                      />
                      <span className="font-semibold text-amber-600">€</span>
                    </div>
                  </div>
                  
                  {/* Premium */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <div className="flex items-center gap-3">
                      <Star className="text-purple-500" size={24} />
                      <div>
                        <p className="font-semibold text-purple-800">Premium</p>
                        <p className="text-xs text-purple-600">Alta visibilidad</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.precioPremium}
                        onChange={(e) => setConfig({ ...config, precioPremium: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-3 py-2 border border-purple-300 rounded-lg text-center font-bold"
                        min="0"
                        step="0.5"
                      />
                      <span className="font-semibold text-purple-600">€</span>
                    </div>
                  </div>
                  
                  {/* Destacado */}
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Sparkles className="text-blue-500" size={24} />
                      <div>
                        <p className="font-semibold text-blue-800">Destacado</p>
                        <p className="text-xs text-blue-600">Visibilidad básica</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={config.precioDestacado}
                        onChange={(e) => setConfig({ ...config, precioDestacado: parseFloat(e.target.value) || 0 })}
                        className="w-20 px-3 py-2 border border-blue-300 rounded-lg text-center font-bold"
                        min="0"
                        step="0.5"
                      />
                      <span className="font-semibold text-blue-600">€</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Descuento global */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Percent className="text-red-500" size={20} />
                  Descuento Global
                </h3>
                
                <div className="space-y-4">
                  {/* Activar descuento */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-semibold text-gray-900">Activar descuento</p>
                      <p className="text-sm text-gray-500">Aplica a todas las promociones</p>
                    </div>
                    <button
                      onClick={() => setConfig({ ...config, descuentoGlobalActivo: !config.descuentoGlobalActivo })}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        config.descuentoGlobalActivo ? 'bg-emerald-500' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                          config.descuentoGlobalActivo ? 'left-8' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  {/* Porcentaje de descuento */}
                  <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200">
                    <label className="text-sm font-medium text-red-800 block mb-2">Porcentaje de descuento</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        value={config.descuentoGlobalPorcentaje}
                        onChange={(e) => setConfig({ ...config, descuentoGlobalPorcentaje: parseInt(e.target.value) })}
                        min="0"
                        max="90"
                        step="5"
                        className="flex-1"
                      />
                      <span className="text-2xl font-bold text-red-600 w-16 text-right">
                        {config.descuentoGlobalPorcentaje}%
                      </span>
                    </div>
                    
                    {config.descuentoGlobalActivo && config.descuentoGlobalPorcentaje > 0 && (
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Precios con descuento:</p>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-xs text-gray-500">VIP</p>
                            <p className="text-sm line-through text-gray-400">{config.precioVIP}€</p>
                            <p className="font-bold text-emerald-600">{(config.precioVIP * (1 - config.descuentoGlobalPorcentaje / 100)).toFixed(2)}€</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Premium</p>
                            <p className="text-sm line-through text-gray-400">{config.precioPremium}€</p>
                            <p className="font-bold text-emerald-600">{(config.precioPremium * (1 - config.descuentoGlobalPorcentaje / 100)).toFixed(2)}€</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Destacado</p>
                            <p className="text-sm line-through text-gray-400">{config.precioDestacado}€</p>
                            <p className="font-bold text-emerald-600">{(config.precioDestacado * (1 - config.descuentoGlobalPorcentaje / 100)).toFixed(2)}€</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Mensaje promocional */}
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700">Mensaje promocional</label>
                      <button
                        onClick={() => setConfig({ ...config, mensajePromoActivo: !config.mensajePromoActivo })}
                        className={`text-xs px-2 py-1 rounded ${
                          config.mensajePromoActivo
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {config.mensajePromoActivo ? 'Activo' : 'Inactivo'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={config.mensajePromo}
                      onChange={(e) => setConfig({ ...config, mensajePromo: e.target.value })}
                      placeholder="Ej: ¡Black Friday! -50% en todas las promociones"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleSaveConfig}
                  disabled={saving}
                  className="w-full mt-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                  Guardar cambios
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sección: Códigos de Descuento */}
        {activeSection === 'codigos' && (
          <div className="p-6">
            {/* Botón crear */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Códigos de Descuento</h3>
                <p className="text-sm text-gray-500">Crea códigos que los usuarios pueden usar al pagar</p>
              </div>
              <button
                onClick={() => setShowCrearCodigo(true)}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-all"
              >
                <Plus size={20} />
                Crear código
              </button>
            </div>
            
            {/* Lista de códigos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {codigos.map(codigo => (
                <div
                  key={codigo.id}
                  className={`relative p-4 rounded-xl border-2 transition-all ${
                    codigo.activo
                      ? 'bg-white border-amber-200 hover:border-amber-400'
                      : 'bg-gray-50 border-gray-200 opacity-60'
                  }`}
                >
                  {/* Badge activo/inactivo */}
                  <span className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded-full ${
                    codigo.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {codigo.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  
                  {/* Código */}
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="text-amber-500" size={20} />
                    <span className="font-mono font-bold text-lg text-gray-900">{codigo.codigo}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(codigo.codigo);
                        toastSuccess('Copiado', 'Código copiado al portapapeles');
                      }}
                      className="p-1 hover:bg-gray-100 rounded"
                    >
                      <Copy size={14} className="text-gray-400" />
                    </button>
                  </div>
                  
                  {/* Valor */}
                  <p className="text-2xl font-bold text-amber-600 mb-1">
                    {codigo.tipo === 'porcentaje' ? `${codigo.valor}%` : `${codigo.valor}€`}
                    <span className="text-sm font-normal text-gray-500 ml-1">
                      {codigo.tipo === 'porcentaje' ? 'descuento' : 'fijo'}
                    </span>
                  </p>
                  
                  {/* Info */}
                  <p className="text-sm text-gray-500 mb-2">{codigo.descripcion || 'Sin descripción'}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>Usos: {codigo.usosActuales}/{codigo.usosMaximos || '∞'}</span>
                    <span>•</span>
                    <span>Expira: {codigo.fechaFin instanceof Date 
                      ? codigo.fechaFin.toLocaleDateString() 
                      : (codigo.fechaFin as { toDate?: () => Date })?.toDate?.()?.toLocaleDateString() || 'N/A'}
                    </span>
                  </div>
                  
                  {/* Acciones */}
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        await toggleCodigoDescuento(codigo.id!, !codigo.activo);
                        loadData();
                      }}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                        codigo.activo
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }`}
                    >
                      {codigo.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar este código?')) {
                          await eliminarCodigoDescuento(codigo.id!);
                          loadData();
                          toastSuccess('Código eliminado');
                        }
                      }}
                      className="p-2 bg-red-50 text-red-500 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
              
              {codigos.length === 0 && (
                <div className="col-span-full text-center py-12 bg-gray-50 rounded-xl">
                  <Tag className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No hay códigos de descuento</p>
                  <p className="text-sm text-gray-400">Crea uno para empezar</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal Crear Código */}
      {showCrearCodigo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Nuevo Código de Descuento</h3>
                <button onClick={() => setShowCrearCodigo(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X size={20} className="text-gray-500" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              {/* Código */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Código</label>
                <input
                  type="text"
                  value={nuevoCodigo.codigo}
                  onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, codigo: e.target.value.toUpperCase() })}
                  placeholder="Ej: NAVIDAD2024"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl font-mono uppercase"
                />
              </div>
              
              {/* Tipo y valor */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Tipo</label>
                  <select
                    value={nuevoCodigo.tipo}
                    onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, tipo: e.target.value as 'porcentaje' | 'fijo' })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Cantidad fija (€)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Valor</label>
                  <input
                    type="number"
                    value={nuevoCodigo.valor}
                    onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, valor: parseFloat(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    min="0"
                  />
                </div>
              </div>
              
              {/* Descripción */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label>
                <input
                  type="text"
                  value={nuevoCodigo.descripcion}
                  onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, descripcion: e.target.value })}
                  placeholder="Ej: Descuento especial de Navidad"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                />
              </div>
              
              {/* Aplica a */}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Aplica a</label>
                <select
                  value={nuevoCodigo.aplicaA}
                  onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, aplicaA: e.target.value as 'todo' | 'promociones' | 'recargas' })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                >
                  <option value="todo">Todo</option>
                  <option value="promociones">Solo promociones</option>
                  <option value="recargas">Solo recargas</option>
                </select>
              </div>
              
              {/* Usos y validez */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Usos máximos (0 = ilimitado)</label>
                  <input
                    type="number"
                    value={nuevoCodigo.usosMaximos}
                    onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, usosMaximos: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    min="0"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Días de validez</label>
                  <input
                    type="number"
                    value={nuevoCodigo.diasValidez}
                    onChange={(e) => setNuevoCodigo({ ...nuevoCodigo, diasValidez: parseInt(e.target.value) || 30 })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    min="1"
                  />
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowCrearCodigo(false)}
                className="flex-1 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCrearCodigo}
                disabled={saving || !nuevoCodigo.codigo.trim()}
                className="flex-1 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
                Crear código
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
