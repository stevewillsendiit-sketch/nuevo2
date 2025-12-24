'use client';

import { useState, useEffect } from 'react';
import { Save, Monitor, CheckCircle, XCircle, Loader2, Code, Layout } from 'lucide-react';
import { 
  getPublicidadConfig, 
  savePublicidadConfig,
  SLOTS_INFO,
  type PublicidadConfig,
  type AdSlotConfig,
  type AdSlot
} from '@/lib/publicidad.service';

// Posiciones de anuncios disponibles
const SLOTS_DISPONIBLES: { slot: AdSlot; nombre: string; descripcion: string; ubicacion: string }[] = [
  { slot: 'header_banner', nombre: 'Banner Header', descripcion: 'Banner horizontal debajo del menú', ubicacion: 'Todas las páginas - Arriba' },
  { slot: 'sidebar_top', nombre: 'Sidebar Superior', descripcion: 'Lateral derecho, parte superior', ubicacion: 'Páginas con sidebar' },
  { slot: 'sidebar_bottom', nombre: 'Sidebar Inferior', descripcion: 'Lateral derecho, parte inferior', ubicacion: 'Páginas con sidebar' },
  { slot: 'home_hero', nombre: 'Home Principal', descripcion: 'Banner grande en inicio', ubicacion: 'Página de inicio' },
  { slot: 'home_middle', nombre: 'Home Medio', descripcion: 'Entre secciones del inicio', ubicacion: 'Página de inicio' },
  { slot: 'search_top', nombre: 'Búsqueda Superior', descripcion: 'Arriba de resultados', ubicacion: 'Página de búsqueda' },
  { slot: 'search_sidebar', nombre: 'Búsqueda Lateral', descripcion: 'Sidebar en búsqueda', ubicacion: 'Página de búsqueda' },
  { slot: 'detail_top', nombre: 'Detalle Superior', descripcion: 'Arriba del anuncio', ubicacion: 'Página de detalle' },
  { slot: 'detail_sidebar', nombre: 'Detalle Lateral', descripcion: 'Sidebar en detalle', ubicacion: 'Página de detalle' },
  { slot: 'footer_banner', nombre: 'Banner Footer', descripcion: 'Banner antes del pie', ubicacion: 'Todas las páginas - Abajo' },
];

export default function PublicidadSimplePanel() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publisherId, setPublisherId] = useState('');
  const [slots, setSlots] = useState<AdSlotConfig[]>([]);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  // Cargar configuración
  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    try {
      setLoading(true);
      const config = await getPublicidadConfig();
      
      if (config) {
        setPublisherId(config.adsensePublisherId || '');
        setSlots(config.slots || []);
      } else {
        // Inicializar con slots vacíos
        setSlots(SLOTS_DISPONIBLES.map(s => ({
          slot: s.slot,
          nombre: s.nombre,
          descripcion: s.descripcion,
          adsenseCode: '',
          activo: false,
        })));
      }
    } catch (error) {
      console.error('Error cargando config:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar la configuración' });
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      await savePublicidadConfig({
        adsensePublisherId: publisherId,
        slots: slots,
      });
      setMensaje({ tipo: 'success', texto: '¡Configuración guardada correctamente!' });
      setTimeout(() => setMensaje(null), 3000);
    } catch (error: any) {
      console.error('Error guardando:', error);
      const errorMsg = error?.message || error?.code || 'Error desconocido';
      setMensaje({ tipo: 'error', texto: `Error al guardar: ${errorMsg}` });
    } finally {
      setSaving(false);
    }
  }

  function updateSlot(slotId: AdSlot, updates: Partial<AdSlotConfig>) {
    setSlots(prev => {
      const existing = prev.find(s => s.slot === slotId);
      if (existing) {
        return prev.map(s => s.slot === slotId ? { ...s, ...updates } : s);
      } else {
        const slotInfo = SLOTS_DISPONIBLES.find(s => s.slot === slotId);
        return [...prev, {
          slot: slotId,
          nombre: slotInfo?.nombre || slotId,
          descripcion: slotInfo?.descripcion || '',
          adsenseCode: '',
          activo: false,
          ...updates,
        }];
      }
    });
  }

  function getSlotConfig(slotId: AdSlot): AdSlotConfig | undefined {
    return slots.find(s => s.slot === slotId);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Configuración de Publicidad</h3>
          <p className="text-sm text-gray-500">Configura Google AdSense en las diferentes posiciones de tu web</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          mensaje.tipo === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {mensaje.tipo === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
          {mensaje.texto}
        </div>
      )}

      {/* Publisher ID */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Code className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 mb-1">ID de Publisher de AdSense</h4>
            <p className="text-sm text-gray-500 mb-4">
              Tu ID de editor de Google AdSense (ej: ca-pub-1234567890123456)
            </p>
            <input
              type="text"
              value={publisherId}
              onChange={(e) => setPublisherId(e.target.value)}
              className="w-full max-w-md px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="ca-pub-XXXXXXXXXXXXXXXX"
            />
          </div>
        </div>
      </div>

      {/* Slots de publicidad */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-gray-600" />
            <h4 className="font-bold text-gray-900">Posiciones de Anuncios</h4>
          </div>
          <p className="text-sm text-gray-500 mt-1">Activa las posiciones y pega el código de AdSense de cada bloque</p>
        </div>

        <div className="divide-y">
          {SLOTS_DISPONIBLES.map((slotInfo) => {
            const config = getSlotConfig(slotInfo.slot);
            const isActive = config?.activo || false;
            
            return (
              <div key={slotInfo.slot} className={`p-6 ${isActive ? 'bg-blue-50/50' : ''}`}>
                <div className="flex items-start gap-4">
                  {/* Toggle */}
                  <button
                    onClick={() => updateSlot(slotInfo.slot, { activo: !isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 mt-1 ${
                      isActive ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h5 className="font-semibold text-gray-900">{slotInfo.nombre}</h5>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{slotInfo.descripcion}</p>
                    <p className="text-xs text-gray-400">📍 {slotInfo.ubicacion}</p>

                    {/* Campo de código AdSense - solo si está activo */}
                    {isActive && (
                      <div className="mt-4">
                        <label className="text-sm font-medium text-gray-700 mb-2 block">
                          Código de AdSense para esta posición:
                        </label>
                        <textarea
                          value={config?.adsenseCode || ''}
                          onChange={(e) => updateSlot(slotInfo.slot, { adsenseCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={4}
                          placeholder={`<!-- Pega aquí el código de AdSense para ${slotInfo.nombre} -->
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
     data-ad-slot="XXXXXXXXXX"
     data-ad-format="auto"></ins>
<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>`}
                        />
                      </div>
                    )}
                  </div>

                  {/* Icono de posición */}
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Monitor className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Instrucciones */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h4 className="font-bold text-amber-800 mb-2">📋 Cómo configurar AdSense</h4>
        <ol className="text-sm text-amber-700 space-y-2 list-decimal list-inside">
          <li>Ve a <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer" className="underline">Google AdSense</a> y accede a tu cuenta</li>
          <li>En el menú, ve a <strong>Anuncios → Por bloque de anuncios</strong></li>
          <li>Crea un nuevo bloque de anuncios para cada posición que quieras usar</li>
          <li>Copia el código generado y pégalo en la posición correspondiente aquí</li>
          <li>Activa cada posición con el interruptor</li>
          <li>Guarda los cambios</li>
        </ol>
      </div>

      {/* Resumen */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h4 className="font-bold text-gray-900 mb-4">📊 Resumen</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-blue-600">{slots.filter(s => s.activo).length}</p>
            <p className="text-sm text-gray-500">Posiciones activas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-gray-400">{SLOTS_DISPONIBLES.length - slots.filter(s => s.activo).length}</p>
            <p className="text-sm text-gray-500">Posiciones inactivas</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-green-600">{slots.filter(s => s.activo && s.adsenseCode).length}</p>
            <p className="text-sm text-gray-500">Con código configurado</p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-3xl font-bold text-amber-600">{slots.filter(s => s.activo && !s.adsenseCode).length}</p>
            <p className="text-sm text-gray-500">Pendientes de código</p>
          </div>
        </div>
      </div>
    </div>
  );
}
