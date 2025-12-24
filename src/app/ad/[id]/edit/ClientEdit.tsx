"use client";

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getAnuncioById, updateAnuncio } from '@/lib/anuncios.service';
import { Anuncio, Categoria, CondicionProducto, EstadoAnuncio } from '@/types';
import { FaArrowLeft, FaClock, FaExclamationTriangle } from 'react-icons/fa';

type Props = { id: string };

// Lista de județe rumanos
const judete = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov', 'București',
  'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț',
  'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea',
  'Vaslui', 'Vrancea'
];

export default function ClientEdit({ id }: Props) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('0');
  const [moneda, setMoneda] = useState<'EUR' | 'LEI'>('LEI');
  const [categoria, setCategoria] = useState<Categoria | ''>('');
  const [condicion, setCondicion] = useState<CondicionProducto | ''>('');
  const [ubicacion, setUbicacion] = useState('');
  const [provincia, setProvincia] = useState('');
  const [negociable, setNegociable] = useState(false);
  const [destacado, setDestacado] = useState(false);
  const [destacadoPrioridad, setDestacadoPrioridad] = useState<number>(0);
  const [imagenesExistentes, setImagenesExistentes] = useState<string[]>([]);
  const [imagenesNuevas, setImagenesNuevas] = useState<File[]>([]);
  const [previewNuevas, setPreviewNuevas] = useState<string[]>([]);

  // Control de edición 24h
  const [canEditFull, setCanEditFull] = useState(true);
  const [horasRestantes, setHorasRestantes] = useState(0);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('Cargando anuncio:', id);
        const data = await getAnuncioById(id);
        console.log('Anuncio cargado:', data);
        
        if (!data) {
          console.log('Anuncio no encontrado');
          router.push('/');
          return;
        }
        setAnuncio(data);
        setTitulo(data.titulo);
        setDescripcion(data.descripcion);
        setPrecio(String(Math.round(data.precio)));
        setMoneda((data as any).moneda || 'EUR');
        setCategoria(data.categoria as Categoria);
        setCondicion(data.condicion as CondicionProducto);
        setUbicacion(data.ubicacion);
        setProvincia(data.provincia || '');
        setNegociable(!!data.negociable);
        setDestacado(!!data.destacado);
        setDestacadoPrioridad(data.destacadoPrioridad || 0);
        setImagenesExistentes(Array.isArray(data.imagenes) ? data.imagenes : []);

        // Verificar si puede editar (24h desde última edición)
        const ultimaEdicion = (data as any).ultimaEdicion;
        if (ultimaEdicion) {
          const fechaUltimaEdicion = ultimaEdicion.toDate ? ultimaEdicion.toDate() : new Date(ultimaEdicion);
          const ahora = new Date();
          const horasPasadas = (ahora.getTime() - fechaUltimaEdicion.getTime()) / (1000 * 60 * 60);
          
          if (horasPasadas < 24) {
            setCanEditFull(false);
            setHorasRestantes(Math.ceil(24 - horasPasadas));
          }
        }
      } catch (err) {
        console.error('Error cargando anuncio para editar:', err);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [id, router]);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  // Verificar si hubo cambios (excepto precio/moneda)
  const hasNonPriceChanges = useMemo(() => {
    if (!anuncio) return false;
    
    const originalImages = Array.isArray(anuncio.imagenes) ? anuncio.imagenes : [];
    
    return (
      titulo !== anuncio.titulo ||
      descripcion !== anuncio.descripcion ||
      categoria !== anuncio.categoria ||
      condicion !== anuncio.condicion ||
      ubicacion !== anuncio.ubicacion ||
      provincia !== (anuncio.provincia || '') ||
      negociable !== !!anuncio.negociable ||
      imagenesExistentes.length !== originalImages.length ||
      imagenesNuevas.length > 0
    );
  }, [anuncio, titulo, descripcion, categoria, condicion, ubicacion, provincia, negociable, imagenesExistentes, imagenesNuevas]);

  // Debug
  console.log('ClientEdit Debug:', { loading, authLoading, user: user?.uid, anuncio: anuncio?.id });

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!anuncio) return null;

  // Verificar permisos - soportar tanto vendedorId como usuarioId (legacy)
  const anuncioOwnerId = anuncio.vendedorId || (anuncio as any).usuarioId;
  if (user?.uid !== anuncioOwnerId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <p className="text-gray-700 mb-4">No tienes permisos para editar este anuncio.</p>
          <button onClick={() => router.push(`/ad/${anuncio.id}`)} className="px-6 py-3 bg-blue-600 text-white rounded-lg">Volver</button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!titulo.trim()) { 
      setError('El título es obligatorio'); 
      return; 
    }

    // Si no puede editar completamente y hay cambios que no son de precio
    if (!canEditFull && hasNonPriceChanges) {
      setError(`Solo puedes cambiar el precio. Podrás editar el resto en ${horasRestantes} horas.`);
      return;
    }

    setSaving(true);
    try {
      const uploadedUrls: string[] = [];
      for (const file of imagenesNuevas) {
        const storageRef = ref(storage, `anuncios/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        uploadedUrls.push(url);
      }

      const finalImagenes = [...imagenesExistentes, ...uploadedUrls];

      const updateData: any = {
        precio: parseFloat(precio) || 0,
        moneda,
        negociable,
      };

      // Solo actualizar campos completos si puede o si no hay cambios en ellos
      if (canEditFull || !hasNonPriceChanges) {
        updateData.titulo = titulo.trim();
        updateData.descripcion = descripcion.trim();
        updateData.categoria = categoria as Categoria;
        updateData.condicion = condicion as CondicionProducto;
        updateData.ubicacion = ubicacion.trim();
        updateData.provincia = provincia.trim();
        updateData.destacado = !!destacado;
        updateData.destacadoPrioridad = destacado ? destacadoPrioridad : 0;
        updateData.imagenes = finalImagenes;
        
        // Solo actualizar fecha de edición si hay cambios reales (no solo precio)
        if (hasNonPriceChanges) {
          updateData.ultimaEdicion = new Date();
        }
      }

      await updateAnuncio(anuncio.id, updateData);

      window.dispatchEvent(new CustomEvent('featured-changed', { detail: { id: anuncio.id, destacado } }));

      router.push(`/ad/${anuncio.id}`);
    } catch (err) {
      console.error('Error actualizando anuncio:', err);
      setError('Error al guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canEditFull) {
      setError(`No puedes cambiar las imágenes. Espera ${horasRestantes} horas.`);
      return;
    }
    const files = Array.from(e.target.files || []);
    const total = imagenesExistentes.length + imagenesNuevas.length + files.length;
    if (total > 8) {
      setError('Máximo 8 imágenes permitidas');
      return;
    }
    setImagenesNuevas(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewNuevas(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingImage = (index: number) => {
    if (!canEditFull) {
      setError(`No puedes eliminar imágenes. Espera ${horasRestantes} horas.`);
      return;
    }
    setImagenesExistentes(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setImagenesNuevas(prev => prev.filter((_, i) => i !== index));
    setPreviewNuevas(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg"><FaArrowLeft /></button>
          <h1 className="text-2xl font-bold">Editar anuncio</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Aviso de restricción 24h */}
        {!canEditFull && (
          <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <FaClock className="text-amber-500 text-xl flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-800">Edición limitada</p>
              <p className="text-sm text-amber-700">
                Solo puedes cambiar el <strong>precio</strong> y la <strong>moneda</strong> en este momento. 
                Podrás editar el resto del anuncio en <strong>{horasRestantes} horas</strong>.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
            <FaExclamationTriangle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección de Precio - Siempre editable */}
          <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-green-200">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold text-green-700">💰 Precio</h2>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Siempre editable</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Precio</label>
                <input 
                  type="number" 
                  value={precio} 
                  onChange={(e) => setPrecio(e.target.value)} 
                  className="w-full px-4 py-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Moneda</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setMoneda('LEI')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      moneda === 'LEI' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Lei
                  </button>
                  <button
                    type="button"
                    onClick={() => setMoneda('EUR')}
                    className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                      moneda === 'EUR' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    € Euro
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input 
                id="negociable" 
                type="checkbox" 
                checked={negociable} 
                onChange={(e) => setNegociable(e.target.checked)} 
                className="w-5 h-5 text-green-600 rounded" 
              />
              <label htmlFor="negociable" className="text-sm text-gray-700">Precio negociable</label>
            </div>
          </div>

          {/* Sección de Información - Restringida por 24h */}
          <div className={`bg-white rounded-xl shadow-sm p-6 ${!canEditFull ? 'opacity-60' : ''}`}>
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-semibold">Información del anuncio</h2>
              {!canEditFull && (
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full flex items-center gap-1">
                  <FaClock size={10} /> Bloqueado {horasRestantes}h
                </span>
              )}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Imágenes</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                {imagenesExistentes.map((src, idx) => (
                  <div key={src} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <Image src={src} alt={`Imagen ${idx + 1}`} fill className="object-cover" />
                    {canEditFull && (
                      <button 
                        type="button" 
                        onClick={() => removeExistingImage(idx)} 
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    )}
                    {idx === 0 && <span className="absolute bottom-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">Portada</span>}
                  </div>
                ))}

                {previewNuevas.map((p, idx) => (
                  <div key={p} className="relative aspect-square bg-gray-50 rounded-lg overflow-hidden">
                    <Image src={p} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removeNewImage(idx)} 
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 hover:opacity-100 transition-opacity"
                    >
                      ✕
                    </button>
                  </div>
                ))}

                {imagenesExistentes.length + previewNuevas.length < 8 && canEditFull && (
                  <label className="relative aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl text-gray-400">＋</div>
                      <div className="text-sm text-gray-600">Añadir</div>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleNewImages} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input 
              value={titulo} 
              onChange={(e) => setTitulo(e.target.value)} 
              disabled={!canEditFull}
              className={`w-full px-4 py-3 border rounded-lg ${!canEditFull ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
            />
            
            <label className="block text-sm font-medium text-gray-700 mt-4 mb-2">Descripción</label>
            <textarea 
              value={descripcion} 
              onChange={(e) => setDescripcion(e.target.value)} 
              disabled={!canEditFull}
              rows={6} 
              className={`w-full px-4 py-3 border rounded-lg ${!canEditFull ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
            />

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select 
                  value={categoria} 
                  onChange={(e) => setCategoria(e.target.value as Categoria)} 
                  disabled={!canEditFull}
                  className={`w-full px-4 py-3 border rounded-lg ${!canEditFull ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  {Object.values(Categoria).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Condición</label>
                <select 
                  value={condicion} 
                  onChange={(e) => setCondicion(e.target.value as CondicionProducto)} 
                  disabled={!canEditFull}
                  className={`w-full px-4 py-3 border rounded-lg ${!canEditFull ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  {Object.values(CondicionProducto).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ciudad</label>
                <input 
                  value={ubicacion} 
                  onChange={(e) => setUbicacion(e.target.value)} 
                  disabled={!canEditFull}
                  placeholder="Ej: București, Cluj-Napoca..."
                  className={`w-full px-4 py-3 border rounded-lg ${!canEditFull ? 'bg-gray-100 cursor-not-allowed' : ''}`} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Județ</label>
                <select 
                  value={provincia} 
                  onChange={(e) => setProvincia(e.target.value)} 
                  disabled={!canEditFull}
                  className={`w-full px-4 py-3 border rounded-lg ${!canEditFull ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                >
                  <option value="">Selecciona un județ</option>
                  {judete.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => router.push(`/ad/${anuncio.id}`)} 
              className="px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={saving} 
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
