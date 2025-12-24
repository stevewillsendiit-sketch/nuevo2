'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  getConversacionesByUsuario,
  getMensajesByConversacion,
  enviarMensaje,
  marcarMensajesComoLeidos,
  borrarConversacion,
} from '@/lib/mensajes.service';
import { getAnuncioById } from '@/lib/anuncios.service';
import { getUsuario } from '@/lib/auth.service';
import { Conversacion, Mensaje, Anuncio, Usuario } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Image from 'next/image';
import { 
  Search, 
  Send, 
  ArrowLeft, 
  MoreVertical, 
  Trash2, 
  MessageCircle,
  CheckCheck,
  Circle,
  Smile,
  Info
} from 'lucide-react';

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [otroUsuario, setOtroUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);
  const [conversacionABorrar, setConversacionABorrar] = useState<string | null>(null);
  const [conversacionesConDatos, setConversacionesConDatos] = useState<Map<string, {usuario: Usuario, anuncio: Anuncio}>>(new Map());
  const [searchQuery, setSearchQuery] = useState('');
  const mensajesEndRef = useRef<HTMLDivElement>(null);
  const mensajesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cacheUsuarios, setCacheUsuarios] = useState<Map<string, Usuario>>(() => {
    try {
      if (typeof window === 'undefined') return new Map<string, Usuario>();
      const raw = localStorage.getItem('cache_usuarios');
      if (raw) {
        const parsed = JSON.parse(raw);
        return new Map(Object.entries(parsed) as [string, Usuario][]);
      }
    } catch (e) {
      console.error('Error cargando cache_usuarios:', e);
    }
    return new Map<string, Usuario>();
  });

  const [cacheAnuncios, setCacheAnuncios] = useState<Map<string, Anuncio>>(() => {
    try {
      if (typeof window === 'undefined') return new Map<string, Anuncio>();
      const raw = localStorage.getItem('cache_anuncios');
      if (raw) {
        const parsed = JSON.parse(raw);
        return new Map(Object.entries(parsed) as [string, Anuncio][]);
      }
    } catch (e) {
      console.error('Error cargando cache_anuncios:', e);
    }
    return new Map<string, Anuncio>();
  });

  // Cargar conversaciones
  useEffect(() => {
    // Esperar a que termine de cargar la autenticación
    if (authLoading) return;
    
    if (!user) {
      router.push('/login');
      return;
    }

    const unsubscribe = getConversacionesByUsuario(user.uid, async (convs) => {
      // Filtrar conversaciones que no tienen mensaje (conversaciones vacías)
      const convsConMensajes = convs.filter(conv => conv.ultimoMensaje && conv.ultimoMensaje.trim());
      
      setConversaciones(convsConMensajes);
      setLoading(false);
      
      // Obtener todos los IDs únicos de usuarios y anuncios
      const usuarioIds = new Set<string>();
      const anuncioIds = new Set<string>();
      
      convsConMensajes.forEach(conv => {
        const otroUsuarioId = conv.participantes.find(p => p !== user.uid);
        if (otroUsuarioId) usuarioIds.add(otroUsuarioId);
        anuncioIds.add(conv.anuncioId);
      });
      
      // Cargar todos los usuarios y anuncios en paralelo
      const [usuarios, anuncios] = await Promise.all([
        Promise.all(
          Array.from(usuarioIds).map(async (id) => {
            if (cacheUsuarios.has(id)) {
              return { id, data: cacheUsuarios.get(id)! };
            }
            const data = await getUsuario(id);
            if (data) setCacheUsuarios(prev => {
              const next = new Map(prev);
              next.set(id, data);
              return next;
            });
            return { id, data };
          })
        ),
        Promise.all(
          Array.from(anuncioIds).map(async (id) => {
            if (cacheAnuncios.has(id)) {
              return { id, data: cacheAnuncios.get(id)! };
            }
            const data = await getAnuncioById(id);
            if (data) setCacheAnuncios(prev => {
              const next = new Map(prev);
              next.set(id, data);
              return next;
            });
            return { id, data };
          })
        )
      ]);
      
      // Guardar cache en localStorage para persistencia
      try {
        localStorage.setItem('cache_usuarios', JSON.stringify(
          Object.fromEntries(cacheUsuarios)
        ));
        localStorage.setItem('cache_anuncios', JSON.stringify(
          Object.fromEntries(cacheAnuncios)
        ));
      } catch (error) {
        console.error('Error guardando cache:', error);
      }
      
      // Crear mapa con datos completos
      const newMap = new Map();
      for (const conv of convsConMensajes) {
        const otroUsuarioId = conv.participantes.find(p => p !== user.uid);
        if (otroUsuarioId) {
          const usuarioData = usuarios.find(u => u.id === otroUsuarioId)?.data;
          const anuncioData = anuncios.find(a => a.id === conv.anuncioId)?.data;
          
          if (usuarioData && anuncioData) {
            newMap.set(conv.id, { usuario: usuarioData, anuncio: anuncioData });
          }
        }
      }
      
      setConversacionesConDatos(newMap);
    });

    return () => unsubscribe();
  }, [user, router, authLoading, cacheUsuarios, cacheAnuncios]);

  // Cargar mensajes de conversación activa
  useEffect(() => {
    if (!conversacionActiva) return;

    const unsubscribe = getMensajesByConversacion(conversacionActiva.id, async (msgs) => {
      setMensajes(msgs);
      
      // Marcar como leídos
      if (user) {
        await marcarMensajesComoLeidos(conversacionActiva.id, user.uid);
      }
    });

    return () => unsubscribe();
  }, [conversacionActiva, user, cacheAnuncios, cacheUsuarios]);

  // Cargar detalles del anuncio y otro usuario
  useEffect(() => {
    if (!conversacionActiva || !user) return;

    const cargarDetalles = async () => {
      // Usar cache si está disponible
      let anuncioData: Anuncio | null | undefined = cacheAnuncios.get(conversacionActiva.anuncioId);
      if (!anuncioData) {
        anuncioData = await getAnuncioById(conversacionActiva.anuncioId);
        if (anuncioData) setCacheAnuncios(prev => {
          const next = new Map(prev);
          next.set(conversacionActiva.anuncioId, anuncioData as Anuncio);
          return next;
        });
      }
      setAnuncio(anuncioData || null);

      // Cargar otro usuario con cache
      const otroUsuarioId = conversacionActiva.participantes.find(p => p !== user.uid);
      if (otroUsuarioId) {
        let usuarioData: Usuario | null | undefined = cacheUsuarios.get(otroUsuarioId);
        if (!usuarioData) {
          usuarioData = await getUsuario(otroUsuarioId);
          if (usuarioData) setCacheUsuarios(prev => {
            const next = new Map(prev);
            next.set(otroUsuarioId, usuarioData as Usuario);
            return next;
          });
        }
        setOtroUsuario(usuarioData || null);
      }
    };

    cargarDetalles();
  }, [conversacionActiva, user, cacheAnuncios, cacheUsuarios]);

  // Scroll automático al último mensaje
  const scrollToBottom = (smooth = true) => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTo({
        top: mensajesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }
  };

  useEffect(() => {
    // Scroll suave para nuevos mensajes
    if (mensajes.length > 0) {
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [mensajes]);

  // Scroll cuando se selecciona una conversación
  useEffect(() => {
    if (conversacionActiva) {
      setTimeout(() => scrollToBottom(false), 200);
    }
  }, [conversacionActiva]);

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (menuAbierto) setMenuAbierto(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [menuAbierto]);

  // Focus en input cuando se selecciona conversación
  useEffect(() => {
    if (conversacionActiva) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [conversacionActiva]);

  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nuevoMensaje.trim() || !conversacionActiva || !user) return;

    try {
      await enviarMensaje(conversacionActiva.id, user.uid, nuevoMensaje.trim());
      setNuevoMensaje('');
      // Scroll inmediato al enviar
      setTimeout(() => scrollToBottom(true), 100);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
    }
  };

  const handleBorrarConversacion = async () => {
    if (!conversacionABorrar) return;
    
    try {
      await borrarConversacion(conversacionABorrar);
      if (conversacionActiva?.id === conversacionABorrar) {
        setConversacionActiva(null);
      }
      setMostrarConfirmacion(false);
      setConversacionABorrar(null);
    } catch (error) {
      console.error('Error al borrar conversación:', error);
      alert('Error al borrar la conversación');
    }
  };

  // Filtrar conversaciones por búsqueda
  const conversacionesFiltradas = conversaciones.filter(conv => {
    if (!searchQuery.trim()) return true;
    const datos = conversacionesConDatos.get(conv.id);
    const nombreUsuario = datos?.usuario?.nombre?.toLowerCase() || '';
    const tituloAnuncio = datos?.anuncio?.titulo?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    return nombreUsuario.includes(query) || tituloAnuncio.includes(query);
  });

  if (!user) {
    return null;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-blue-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
            <MessageCircle className="absolute inset-0 m-auto w-8 h-8 text-blue-600" />
          </div>
          <p className="text-gray-600 font-medium">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-140px)] bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
      <div className="max-w-7xl mx-auto h-full p-4">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-full overflow-hidden flex">
          
          {/* Panel izquierdo - Lista de conversaciones */}
          <div className={`w-full md:w-96 border-r border-gray-100 flex flex-col bg-white ${conversacionActiva ? 'hidden md:flex' : 'flex'}`}>
            
            {/* Header del panel */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <MessageCircle className="w-6 h-6" />
                  Mensajes
                </h1>
                <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {conversaciones.length}
                </span>
              </div>
              
              {/* Barra de búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                <input
                  type="text"
                  placeholder="Buscar conversaciones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all text-sm"
                />
              </div>
            </div>

            {/* Lista de conversaciones */}
            <div className="flex-1 overflow-y-auto">
              {conversacionesFiltradas.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                    <MessageCircle className="w-10 h-10 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {searchQuery ? 'Sin resultados' : 'No tienes mensajes'}
                  </h3>
                  <p className="text-gray-500 text-sm">
                    {searchQuery ? 'Intenta con otra búsqueda' : 'Contacta con vendedores desde sus anuncios'}
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {conversacionesFiltradas.map((conv) => {
                    const datos = conversacionesConDatos.get(conv.id);
                    const otroUsuarioId = conv.participantes.find(p => p !== user?.uid);
                    const usuario = datos?.usuario || (otroUsuarioId ? cacheUsuarios.get(otroUsuarioId) : null);
                    const anuncioConv = datos?.anuncio || cacheAnuncios.get(conv.anuncioId);
                    const unreadForUser = user?.uid ? Number((((conv as unknown) as Record<string, unknown>)[`noLeidos_${user.uid}`]) || 0) : 0;
                    const isActive = conversacionActiva?.id === conv.id;

                    return (
                      <div key={conv.id} className="relative group">
                        <button
                          onClick={() => setConversacionActiva(conv)}
                          className={`w-full p-4 text-left transition-all duration-200 hover:bg-gray-50 ${
                            isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'border-l-4 border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              {anuncioConv?.imagenes?.[0] ? (
                                <div className="w-14 h-14 rounded-full overflow-hidden ring-2 ring-white shadow-md">
                                  <Image 
                                    src={anuncioConv.imagenes[0]} 
                                    alt="" 
                                    width={56} 
                                    height={56} 
                                    className="object-cover w-full h-full" 
                                  />
                                </div>
                              ) : (
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                  {usuario?.nombre?.charAt(0).toUpperCase() || '?'}
                                </div>
                              )}
                              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className={`font-semibold truncate ${isActive ? 'text-blue-700' : 'text-gray-900'}`}>
                                  {usuario?.nombre || 'Usuario'}
                                </h3>
                                <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                                  {formatDistanceToNow(conv.fechaUltimoMensaje, { addSuffix: false, locale: es })}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-500 truncate mb-1">
                                {anuncioConv?.titulo || 'Anuncio'}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <p className={`text-sm truncate ${unreadForUser > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                  {conv.ultimoMensaje || 'Sin mensajes'}
                                </p>
                                {unreadForUser > 0 && (
                                  <span className="ml-2 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                                    {unreadForUser > 9 ? '9+' : unreadForUser}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Botón de opciones */}
                        <button
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setMenuAbierto(menuAbierto === conv.id ? null : conv.id); 
                          }}
                          className={`absolute top-4 right-4 p-2 rounded-full transition-all ${
                            menuAbierto === conv.id ? 'bg-gray-200' : 'opacity-0 group-hover:opacity-100 hover:bg-gray-100'
                          }`}
                        >
                          <MoreVertical className="w-4 h-4 text-gray-500" />
                        </button>

                        {/* Menú desplegable */}
                        {menuAbierto === conv.id && (
                          <>
                            <div className="fixed inset-0 z-30" onClick={() => setMenuAbierto(null)} />
                            <div className="absolute right-4 top-14 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-40">
                              <button
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setConversacionABorrar(conv.id); 
                                  setMostrarConfirmacion(true); 
                                  setMenuAbierto(null); 
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Eliminar chat
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho - Chat */}
          <div className={`flex-1 flex flex-col bg-gray-50 ${!conversacionActiva ? 'hidden md:flex' : 'flex'}`}>
            {conversacionActiva ? (
              <>
                {/* Header del chat */}
                <div className="bg-white border-b border-gray-100 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setConversacionActiva(null)}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                    
                    {/* Avatar del usuario */}
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {otroUsuario?.nombre?.charAt(0).toUpperCase() || '?'}
                      </div>
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>

                    {/* Nombre del usuario */}
                    <div className="min-w-0">
                      <h2 className="font-semibold text-gray-900 truncate">
                        {otroUsuario?.nombre || 'Usuario'}
                      </h2>
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <Circle className="w-2 h-2 fill-current" />
                        En línea
                      </p>
                    </div>

                    {/* Separador */}
                    <div className="hidden sm:block w-px h-8 bg-gray-200 mx-2"></div>

                    {/* Info del anuncio - en la misma línea */}
                    {anuncio && (
                      <div 
                        onClick={() => router.push(`/ad/${anuncio.id}`)}
                        className="hidden sm:flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-gray-50 rounded-xl p-2 -m-2 transition-colors"
                      >
                        {anuncio.imagenes?.[0] && (
                          <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                            <Image 
                              src={anuncio.imagenes[0]} 
                              alt="" 
                              width={40} 
                              height={40} 
                              className="object-cover w-full h-full" 
                            />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500">Conversación sobre:</p>
                          <p className="text-sm font-medium text-gray-900 truncate">{anuncio.titulo}</p>
                        </div>
                        <p className="text-sm font-bold text-blue-600 flex-shrink-0">{anuncio.precio?.toLocaleString('es-ES')} €</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Área de mensajes */}
                <div 
                  ref={mensajesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  }}
                >
                  {mensajes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-4">
                        <MessageCircle className="w-12 h-12 text-blue-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Inicia la conversación</h3>
                      <p className="text-gray-500 text-sm max-w-xs">
                        Envía un mensaje para empezar a chatear sobre este anuncio
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mensajes */}
                      {mensajes.map((mensaje, index) => {
                        const esMio = mensaje.remitenteId === user?.uid;
                        const showAvatar = !esMio && (index === 0 || mensajes[index - 1]?.remitenteId === user?.uid);
                        
                        return (
                          <div
                            key={mensaje.id}
                            className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}
                          >
                            {!esMio && showAvatar && (
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end mb-5">
                                {otroUsuario?.nombre?.charAt(0).toUpperCase() || '?'}
                              </div>
                            )}
                            {!esMio && !showAvatar && <div className="w-10 mr-2" />}
                            
                            <div className={`max-w-[70%] ${esMio ? 'items-end' : 'items-start'} flex flex-col`}>
                              <div
                                className={`px-4 py-2.5 shadow-sm ${
                                  esMio
                                    ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl rounded-br-md'
                                    : 'bg-white text-gray-900 rounded-2xl rounded-bl-md border border-gray-100'
                                }`}
                              >
                                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
                                  {mensaje.contenido}
                                </p>
                              </div>
                              <div className={`flex items-center gap-1 mt-1 px-1 ${esMio ? 'justify-end' : 'justify-start'}`}>
                                <span className="text-[10px] text-gray-400">
                                  {mensaje.fecha && formatDistanceToNow(mensaje.fecha, { addSuffix: false, locale: es })}
                                </span>
                                {esMio && (
                                  <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={mensajesEndRef} />
                </div>

                {/* Input de mensaje */}
                <div className="bg-white border-t border-gray-100 p-4">
                  <form onSubmit={handleEnviarMensaje} className="flex items-center gap-3">
                    <button
                      type="button"
                      className="p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={nuevoMensaje}
                        onChange={(e) => setNuevoMensaje(e.target.value)}
                        placeholder="Escribe un mensaje..."
                        className="w-full px-5 py-3 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={!nuevoMensaje.trim()}
                      className={`p-3 rounded-full transition-all transform ${
                        nuevoMensaje.trim()
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* Estado vacío - Sin conversación seleccionada */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                  <MessageCircle className="w-16 h-16 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Tus mensajes</h2>
                <p className="text-gray-500 max-w-sm mb-6">
                  Selecciona una conversación de la lista para empezar a chatear con compradores y vendedores
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Mensajes encriptados de extremo a extremo</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de borrado */}
      {mostrarConfirmacion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-red-500" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 text-center mb-2">
              ¿Eliminar conversación?
            </h3>
            <p className="text-gray-500 text-center mb-6">
              Esta acción no se puede deshacer. Se eliminarán todos los mensajes de esta conversación.
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMostrarConfirmacion(false);
                  setConversacionABorrar(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleBorrarConversacion}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-lg shadow-red-600/25"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
