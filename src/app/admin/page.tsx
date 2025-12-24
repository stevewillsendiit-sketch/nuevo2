'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  isAdmin,
  getUserRole,
  getEstadisticasSistema,
  getEstadisticasCompletas,
  getAllUsuarios,
  getAllAnuncios,
  getAnunciosPendientes,
  getReportesPendientes,
  getAdminLogs,
  suspenderUsuario,
  reactivarUsuario,
  verificarUsuario,
  eliminarUsuario,
  updateUsuarioRol,
  aprobarAnuncio,
  rechazarAnuncio,
  eliminarAnuncioAdmin,
  destacarAnuncio,
  resolverReporte,
  logAdminAction,
  searchUsuarios,
  createInitialSuperAdmin,
  getTodasPromociones,
  getPromocionesActivas,
  cancelarPromocion,
  getAnunciosExtraComprados,
  getFacturasDetalladas,
  getResumenIngresosPorMes,
  getIngresosPorPeriodo,
  getDetallesUsuarioCompleto,
  extenderPlanUsuario,
  agregarAnunciosExtraUsuario,
  type PromocionComprada,
  type AnuncioExtraComprado,
  type FacturaDetallada,
  type EstadisticasCompletas,
  type ResumenIngresos,
  type IngresosDiarios,
  type DetallesUsuarioCompleto,
  type PlanUsuario,
  type AnuncioPromocionado,
} from '@/lib/admin.service';
import {
  getMensajesContacto,
  marcarMensajeLeido,
  actualizarEstadoMensaje,
  responderMensaje,
  eliminarMensajeContacto,
  agregarNotaMensaje,
  type MensajeContacto,
} from '@/lib/contacto.service';
import {
  crearBonificacion,
  crearBonificacionMasiva,
  getAllBonificaciones,
  addCreditosManual,
  getConfiguracionCreditos,
  toggleJuegoActivo,
  type Bonificacion,
} from '@/lib/bonificaciones.service';
import PromocionesAdminPanel from '@/components/PromocionesAdminPanel';
import {
  getPaymentConfig,
  updatePaymentConfig,
  addPromoCode,
  togglePromoCode,
  deletePromoCode,
  type PaymentConfig,
  type PromoCode,
} from '@/lib/payment.service';
import { Usuario, Anuncio, EstadisticasSistema, ReporteAnuncio, LogAdmin, RolUsuario, EstadoAnuncio, Factura } from '@/types';
import {
  Shield,
  Users,
  FileText,
  AlertTriangle,
  Settings,
  Activity,
  BarChart3,
  Search,
  Eye,
  Trash2,
  CheckCircle,
  XCircle,
  Pause,
  Star,
  UserCheck,
  UserX,
  Ban,
  RefreshCw,
  Clock,
  TrendingUp,
  MessageSquare,
  ChevronRight,
  Home,
  LogOut,
  User,
  Menu,
  X,
  Filter,
  Download,
  MoreVertical,
  Edit,
  ExternalLink,
  Crown,
  Zap,
  DollarSign,
  Receipt,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Package,
  CreditCard,
  Euro,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Gift,
  TrendingDown,
  LayoutGrid,
  Table,
  Loader2,
  Briefcase,
  Mail,
  Reply,
  Inbox,
} from 'lucide-react';
import Image from 'next/image';
import { useToast, ToastContainer } from '@/components/Toast';
import PublicidadSimplePanel from '@/components/PublicidadSimplePanel';
import { 
  getEstadisticasRealTime, 
  getResumenStats, 
  getHistorialVisitas,
  type EstadisticasRealTime as AnalyticsStats,
  type StatsResumen
} from '@/lib/analytics.service';
import {
  getPublicidadConfig,
  type AdSlot,
} from '@/lib/publicidad.service';

type TabType = 'dashboard' | 'usuarios' | 'anuncios' | 'mensajes' | 'promociones' | 'extras' | 'ingresos' | 'bonificaciones' | 'publicidad' | 'reportes' | 'logs' | 'configuracion' | 'estadisticas';

export default function AdminPage() {
  const { user, usuario, loading: authLoading, signOut } = useAuth();
  const { toast, hideToast, success: toastSuccess, error: toastError, warning: toastWarning, points: toastPoints } = useToast();
  const router = useRouter();
  
  const [authorized, setAuthorized] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userRole, setUserRole] = useState<RolUsuario>('user');
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Estados de datos
  const [stats, setStats] = useState<EstadisticasSistema | null>(null);
  const [statsCompletas, setStatsCompletas] = useState<EstadisticasCompletas | null>(null);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [anuncios, setAnuncios] = useState<Anuncio[]>([]);
  const [anunciosPendientes, setAnunciosPendientes] = useState<Anuncio[]>([]);
  const [reportes, setReportes] = useState<ReporteAnuncio[]>([]);
  const [logs, setLogs] = useState<LogAdmin[]>([]);
  
  // Estados para mensajes de contacto
  const [mensajesContacto, setMensajesContacto] = useState<MensajeContacto[]>([]);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<MensajeContacto | null>(null);
  const [filterMensajes, setFilterMensajes] = useState<string>('todos');
  const [respuestaMensaje, setRespuestaMensaje] = useState('');
  const [enviandoRespuesta, setEnviandoRespuesta] = useState(false);
  
  // Estados para nuevas pestañas
  const [promociones, setPromociones] = useState<PromocionComprada[]>([]);
  const [promocionesActivas, setPromocionesActivas] = useState<PromocionComprada[]>([]);
  const [anunciosExtra, setAnunciosExtra] = useState<AnuncioExtraComprado[]>([]);
  const [facturas, setFacturas] = useState<FacturaDetallada[]>([]);
  const [resumenIngresos, setResumenIngresos] = useState<ResumenIngresos[]>([]);
  const [ingresosDiarios, setIngresosDiarios] = useState<IngresosDiarios[]>([]);
  
  // Filtros para pestañas
  const [filterPromocion, setFilterPromocion] = useState<string>('todos');
  const [filterExtras, setFilterExtras] = useState<string>('todos');
  const [filterFacturas, setFilterFacturas] = useState<string>('todos');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  
  // Estados para Bonificaciones (interface viene de bonificaciones.service)
  const [bonificaciones, setBonificaciones] = useState<(Bonificacion & { usuariosBeneficiados?: number })[]>([]);
  const [filterBonificacion, setFilterBonificacion] = useState<string>('todos');
  const [filterEstadoBonificacion, setFilterEstadoBonificacion] = useState<string>('todos');

  // Estados para créditos/puntos (usados por el nuevo PromocionesAdminPanel)
  const [configCreditos, setConfigCreditos] = useState({
    creditosPorDia: 5,
    valorPuntosEnEuros: 0.10,
    puntosMinimosParaCanjear: 20,
    maxAnunciosPorCanje: 10,
    precioAnuncioEnEuros: 2.00,
    juegoActivo: true
  });
  const [toggleandoJuego, setToggleandoJuego] = useState(false);
  
  // Modal de detalles de usuario
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [userDetails, setUserDetails] = useState<DetallesUsuarioCompleto | null>(null);
  const [loadingUserDetails, setLoadingUserDetails] = useState(false);
  const [userDetailsTab, setUserDetailsTab] = useState<'resumen' | 'anuncios' | 'promociones' | 'historial'>('resumen');
  
  // Acciones en modal de usuario
  const [diasExtender, setDiasExtender] = useState<number>(30);
  const [anunciosAgregar, setAnunciosAgregar] = useState<number>(5);
  
  // Estados para Analytics/Estadísticas en tiempo real
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null);
  const [analyticsResumen, setAnalyticsResumen] = useState<StatsResumen | null>(null);
  const [analyticsHistorial, setAnalyticsHistorial] = useState<{ fecha: string; visitas: number; registros: number }[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [analyticsPeriodo, setAnalyticsPeriodo] = useState<7 | 30 | 90>(30);
  
  // Estados para configuración de pagos
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [savingPaymentConfig, setSavingPaymentConfig] = useState(false);
  const [showAddPromoCode, setShowAddPromoCode] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState({
    code: '',
    bonus: 10,
    type: 'fixed' as 'fixed' | 'percentage',
    active: true,
    expiresAt: '',
    usageLimit: 0,
  });
  
  // Estados de UI
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [modalType, setModalType] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [anunciosViewMode, setAnunciosViewMode] = useState<'grid' | 'list'>('list');
  const [anuncioDetalle, setAnuncioDetalle] = useState<Anuncio | null>(null);
  const [anuncioDetalleUsuario, setAnuncioDetalleUsuario] = useState<Usuario | null>(null);
  
  // Setup admin (solo primera vez)
  const [showSetup, setShowSetup] = useState(false);
  const [setupKey, setSetupKey] = useState('');

  // Verificar autorización
  useEffect(() => {
    async function checkAuth() {
      if (authLoading) return;
      
      if (!user) {
        router.push('/login');
        return;
      }
      
      const admin = await isAdmin(user.uid);
      const role = await getUserRole(user.uid);
      
      setUserRole(role);
      setAuthorized(admin);
      setCheckingAuth(false);
      
      if (!admin) {
        // Mostrar opción de setup si no hay admin
        setShowSetup(true);
      }
    }
    
    checkAuth();
  }, [user, authLoading, router]);

  // Referencia para caché de datos cargados
  const dataLoadedRef = useRef<Set<string>>(new Set());
  const lastSearchRef = useRef<string>('');

  // Cargar datos según tab activa - CON CACHÉ para carga instantánea
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!authorized) return;
    
    const cacheKey = `${activeTab}-${searchTerm}`;
    
    // Si ya cargamos estos datos y no es refresh forzado, no recargar
    if (!forceRefresh && dataLoadedRef.current.has(cacheKey)) {
      return;
    }
    
    // Solo mostrar loading si no hay datos previos
    const hasExistingData = activeTab === 'dashboard' ? stats !== null : 
                           activeTab === 'usuarios' ? usuarios.length > 0 :
                           activeTab === 'anuncios' ? anuncios.length > 0 :
                           activeTab === 'bonificaciones' ? bonificaciones.length > 0 :
                           false;
    
    if (!hasExistingData) {
      setLoadingData(true);
    }
    
    try {
      switch (activeTab) {
        case 'dashboard':
          // Cargar todo en paralelo para máxima velocidad
          const [statsData, statsCompletasData, pendientes, reportesPend] = await Promise.all([
            getEstadisticasSistema(),
            getEstadisticasCompletas(),
            getAnunciosPendientes(),
            getReportesPendientes(),
          ]);
          setStats(statsData);
          setStatsCompletas(statsCompletasData);
          setAnunciosPendientes(pendientes);
          setReportes(reportesPend);
          break;
          
        case 'usuarios':
          // Solo buscar si cambió el término de búsqueda
          if (searchTerm !== lastSearchRef.current || forceRefresh || usuarios.length === 0) {
            lastSearchRef.current = searchTerm;
            const usuariosData = searchTerm 
              ? await searchUsuarios(searchTerm)
              : await getAllUsuarios(100); // Reducido de 200 a 100 para velocidad
            setUsuarios(usuariosData);
          }
          break;
          
        case 'anuncios':
          if (forceRefresh || anuncios.length === 0) {
            const anunciosData = await getAllAnuncios(100);
            setAnuncios(anunciosData);
          }
          break;
          
        case 'promociones':
          if (forceRefresh || promociones.length === 0) {
            const [todasPromociones, promoActivas] = await Promise.all([
              getTodasPromociones(100),
              getPromocionesActivas(),
            ]);
            setPromociones(todasPromociones);
            setPromocionesActivas(promoActivas);
          }
          break;
          
        case 'extras':
          if (forceRefresh || anunciosExtra.length === 0) {
            const extrasData = await getAnunciosExtraComprados(100);
            setAnunciosExtra(extrasData);
          }
          break;
          
        case 'ingresos':
          if (forceRefresh || facturas.length === 0) {
            const [facturasData, resumenData, ingresosData] = await Promise.all([
              getFacturasDetalladas(100),
              getResumenIngresosPorMes(6), // Reducido de 12 a 6 meses
              getIngresosPorPeriodo(30),
            ]);
            setFacturas(facturasData);
            setResumenIngresos(resumenData);
            setIngresosDiarios(ingresosData);
          }
          break;
          
        case 'bonificaciones':
          if (forceRefresh || bonificaciones.length === 0) {
            const [bonificacionesData, configCreditosData, usuariosParaBonif] = await Promise.all([
              getAllBonificaciones(),
              getConfiguracionCreditos(),
              getAllUsuarios(200) // Necesitamos todos para dar puntos masivamente
            ]);
            setBonificaciones(bonificacionesData);
            setConfigCreditos(configCreditosData);
            setUsuarios(usuariosParaBonif);
          }
          break;
          
        case 'reportes':
          if (forceRefresh || reportes.length === 0) {
            const reportesData = await getReportesPendientes();
            setReportes(reportesData);
          }
          break;
          
        case 'logs':
          if (forceRefresh || logs.length === 0) {
            const logsData = await getAdminLogs(100);
            setLogs(logsData);
          }
          break;
          
        case 'estadisticas':
          setLoadingAnalytics(true);
          try {
            const [realTimeStats, resumenStats, historialStats] = await Promise.all([
              getEstadisticasRealTime(),
              getResumenStats(),
              getHistorialVisitas(analyticsPeriodo),
            ]);
            setAnalyticsStats(realTimeStats);
            setAnalyticsResumen(resumenStats);
            setAnalyticsHistorial(historialStats);
          } finally {
            setLoadingAnalytics(false);
          }
          break;
          
        case 'publicidad':
          // El panel de publicidad simple carga sus propios datos
          break;
          
        case 'configuracion':
          if (forceRefresh || !paymentConfig) {
            const configData = await getPaymentConfig();
            setPaymentConfig(configData);
          }
          break;
          
        case 'mensajes':
          // Los mensajes se cargan en tiempo real con onSnapshot
          break;
      }
      
      // Marcar como cargado en caché
      dataLoadedRef.current.add(cacheKey);
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoadingData(false);
    }
  }, [activeTab, authorized, searchTerm, stats, usuarios.length, anuncios.length, bonificaciones.length, promociones.length, anunciosExtra.length, facturas.length, reportes.length, logs.length]);

  useEffect(() => {
    if (authorized) {
      loadData();
    }
  }, [authorized, activeTab, loadData]);

  // Cargar mensajes de contacto en tiempo real
  useEffect(() => {
    if (!authorized) return;
    
    const unsubscribe = getMensajesContacto((mensajes) => {
      setMensajesContacto(mensajes);
    });
    
    return () => unsubscribe();
  }, [authorized]);

  // Handlers de acciones - con force refresh
  const handleSuspenderUsuario = async (userId: string) => {
    if (!user || !actionReason) return;
    await suspenderUsuario(userId, actionReason, user.uid, user.email || '');
    setModalType(null);
    setActionReason('');
    loadData(true);
  };

  const handleReactivarUsuario = async (userId: string) => {
    if (!user) return;
    await reactivarUsuario(userId, user.uid, user.email || '');
    loadData(true);
  };

  const handleVerificarUsuario = async (userId: string) => {
    if (!user) return;
    await verificarUsuario(userId, user.uid, user.email || '');
    loadData(true);
  };

  const handleEliminarUsuario = async (userId: string) => {
    if (!user || !confirm('¿Estás seguro de eliminar este usuario y todos sus anuncios?')) return;
    await eliminarUsuario(userId, user.uid, user.email || '');
    loadData(true);
  };

  const handleCambiarRol = async (userId: string, nuevoRol: RolUsuario) => {
    if (!user) return;
    await updateUsuarioRol(userId, nuevoRol);
    await logAdminAction(user.uid, user.email || '', `Cambiar rol a ${nuevoRol}`, 'usuario', userId);
    loadData(true);
  };

  const handleAprobarAnuncio = async (anuncioId: string) => {
    if (!user) return;
    await aprobarAnuncio(anuncioId, user.uid, user.email || '');
    loadData(true);
  };

  const handleRechazarAnuncio = async (anuncioId: string) => {
    if (!user || !actionReason) return;
    await rechazarAnuncio(anuncioId, actionReason, user.uid, user.email || '');
    setModalType(null);
    setActionReason('');
    loadData(true);
  };

  const handleEliminarAnuncio = async (anuncioId: string) => {
    if (!user || !confirm('¿Estás seguro de eliminar este anuncio?')) return;
    await eliminarAnuncioAdmin(anuncioId, user.uid, user.email || '');
    loadData(true);
  };

  const handleDestacarAnuncio = async (anuncioId: string, destacado: boolean) => {
    if (!user) return;
    await destacarAnuncio(anuncioId, destacado, user.uid, user.email || '');
    loadData(true);
  };

  const handleResolverReporte = async (reporteId: string, estado: 'resuelto' | 'descartado') => {
    if (!user) return;
    await resolverReporte(reporteId, estado, actionReason || 'Sin notas', user.uid, user.email || '');
    setModalType(null);
    setActionReason('');
    loadData(true);
  };

  const handleSetupAdmin = async () => {
    if (!user || !setupKey) return;
    const success = await createInitialSuperAdmin(user.uid, setupKey);
    if (success) {
      setShowSetup(false);
      setAuthorized(true);
      setUserRole('superadmin');
    } else {
      toastError('Acceso denegado', 'Clave incorrecta');
    }
  };

  // Handler para ver detalles de usuario
  const handleVerDetallesUsuario = async (userId: string) => {
    setLoadingUserDetails(true);
    setShowUserDetails(true);
    setUserDetailsTab('resumen');
    
    try {
      const detalles = await getDetallesUsuarioCompleto(userId);
      setUserDetails(detalles);
    } catch (error) {
      console.error('Error cargando detalles:', error);
    } finally {
      setLoadingUserDetails(false);
    }
  };

  // Handler para extender plan
  const handleExtenderPlan = async (planId: string) => {
    if (!user || !userDetails) return;
    try {
      await extenderPlanUsuario(planId, diasExtender, user.uid, user.email || '');
      // Recargar detalles
      const detalles = await getDetallesUsuarioCompleto(userDetails.usuario.id);
      setUserDetails(detalles);
      setDiasExtender(30);
    } catch (error) {
      console.error('Error extendiendo plan:', error);
      toastError('Error', 'No se pudo extender el plan');
    }
  };

  // Handler para agregar anuncios
  const handleAgregarAnuncios = async (planId: string) => {
    if (!user || !userDetails) return;
    try {
      await agregarAnunciosExtraUsuario(planId, anunciosAgregar, user.uid, user.email || '');
      // Recargar detalles
      const detalles = await getDetallesUsuarioCompleto(userDetails.usuario.id);
      setUserDetails(detalles);
      setAnunciosAgregar(5);
    } catch (error) {
      console.error('Error agregando anuncios:', error);
      toastError('Error', 'No se pudieron agregar los anuncios');
    }
  };

  // Pantalla de carga
  if (authLoading || checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Pantalla de setup inicial
  if (showSetup && !authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
            <p className="text-gray-500 mt-2">Configuración inicial del administrador</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clave de configuración
              </label>
              <input
                type="password"
                value={setupKey}
                onChange={(e) => setSetupKey(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ingresa la clave secreta"
              />
            </div>
            
            <button
              onClick={handleSetupAdmin}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Activar como Superadmin
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full text-gray-500 py-2 hover:text-gray-700"
            >
              Volver al inicio
            </button>
          </div>
          
          <p className="text-xs text-gray-400 mt-6 text-center">
            Usuario: {user?.email}
          </p>
        </div>
      </div>
    );
  }

  // Pantalla sin autorización
  if (!authorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Ban className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-500 mb-6">No tienes permisos para acceder al panel de administración.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  // Panel principal
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-40 h-screen transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} bg-white border-r border-gray-200 w-64`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-gray-900">Admin Panel</h1>
                <span className="text-xs text-blue-600 font-medium capitalize">{userRole}</span>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2">Principal</p>
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'usuarios', label: 'Usuarios', icon: Users },
              { id: 'anuncios', label: 'Anuncios', icon: FileText },
              { id: 'mensajes', label: 'Mensajes', icon: Inbox, badge: mensajesContacto.filter(m => !m.leido).length || undefined },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            
            <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">Ventas</p>
            {[
              { id: 'promociones', label: 'Promociones', icon: Sparkles, badge: promocionesActivas.length > 0 ? promocionesActivas.length : undefined },
              { id: 'extras', label: 'Anuncios Extra', icon: Package },
              { id: 'ingresos', label: 'Ingresos', icon: DollarSign },
              { id: 'bonificaciones', label: 'Créditos y Descuentos', icon: Gift },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
            
            <p className="text-xs text-gray-400 uppercase tracking-wider px-4 mb-2 mt-6">Sistema</p>
            {[
              { id: 'publicidad', label: 'Publicidad', icon: Monitor },
              { id: 'estadisticas', label: 'Estadísticas', icon: Globe },
              { id: 'reportes', label: 'Reportes', icon: AlertTriangle, badge: reportes.length },
              { id: 'logs', label: 'Actividad', icon: Activity },
              { id: 'configuracion', label: 'Configuración', icon: Settings },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as TabType)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
          
          {/* User section */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {usuario?.nombre?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{usuario?.nombre}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/')}
                className="flex-1 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-100 py-2 rounded-lg transition-colors text-sm"
              >
                <Home size={16} />
                Inicio
              </button>
              <button
                onClick={() => signOut()}
                className="flex-1 flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 py-2 rounded-lg transition-colors text-sm"
              >
                <LogOut size={16} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`transition-all ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <h2 className="text-xl font-bold text-gray-900 capitalize">{activeTab}</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => loadData(true)}
                disabled={loadingData}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw size={16} className={loadingData ? 'animate-spin' : ''} />
                Actualizar
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Grid Principal */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Usuarios', value: stats?.totalUsuarios || 0, icon: Users, color: 'blue', delta: `+${stats?.usuariosNuevosHoy || 0} hoy` },
                  { label: 'Total Anuncios', value: stats?.totalAnuncios || 0, icon: FileText, color: 'green', delta: `+${stats?.anunciosNuevosHoy || 0} hoy` },
                  { label: 'Pendientes', value: stats?.anunciosPendientes || 0, icon: Clock, color: 'yellow' },
                  { label: 'Reportes', value: reportes.length, icon: AlertTriangle, color: 'red' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value.toLocaleString()}</p>
                        {stat.delta && (
                          <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                            <TrendingUp size={12} />
                            {stat.delta}
                          </p>
                        )}
                      </div>
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                        stat.color === 'green' ? 'bg-green-100 text-green-600' :
                        stat.color === 'yellow' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>
                        <stat.icon size={24} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats de Ingresos y Promociones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Ingresos del Mes</p>
                      <p className="text-3xl font-bold mt-1">{(statsCompletas?.ingresosMes || 0).toLocaleString()}€</p>
                      <p className="text-xs text-green-100 mt-2 flex items-center gap-1">
                        <TrendingUp size={12} />
                        +{(statsCompletas?.ingresosSemana || 0).toLocaleString()}€ esta semana
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Promociones Activas</p>
                      <p className="text-3xl font-bold mt-1">{statsCompletas?.promocionesActivasHoy || 0}</p>
                      <p className="text-xs text-purple-100 mt-2 flex items-center gap-1">
                        <Sparkles size={12} />
                        +{statsCompletas?.promocionesCompradasHoy || 0} compradas hoy
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Tipo VIP</p>
                      <p className="text-3xl font-bold text-amber-600 mt-1">{statsCompletas?.promocionesVIP || 0}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex -space-x-1">
                          <Crown size={14} className="text-amber-500" />
                        </div>
                        <span className="text-xs text-gray-500">activas</span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Crown size={24} className="text-amber-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-500">Conversión</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">{(statsCompletas?.tasaConversion || 0).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Ticket: {(statsCompletas?.ticketPromedio || 0).toFixed(2)}€
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <PieChart size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Anuncios Pendientes */}
                <div className="bg-white rounded-2xl shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Anuncios Pendientes</h3>
                      <button
                        onClick={() => setActiveTab('anuncios')}
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                      >
                        Ver todos <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {anunciosPendientes.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay anuncios pendientes</p>
                    ) : (
                      anunciosPendientes.slice(0, 5).map((anuncio) => (
                        <div key={anuncio.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden relative">
                            {anuncio.imagenes?.[0] && (
                              <Image src={anuncio.imagenes[0]} alt="" fill className="object-cover" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{anuncio.titulo}</p>
                            <p className="text-sm text-gray-500">{anuncio.precio?.toLocaleString()} €</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAprobarAnuncio(anuncio.id)}
                              className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedItem(anuncio);
                                setModalType('rechazar');
                              }}
                              className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Reportes Recientes */}
                <div className="bg-white rounded-2xl shadow-sm">
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-gray-900">Reportes Pendientes</h3>
                      <button
                        onClick={() => setActiveTab('reportes')}
                        className="text-blue-600 text-sm hover:underline flex items-center gap-1"
                      >
                        Ver todos <ChevronRight size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                    {reportes.length === 0 ? (
                      <p className="text-gray-500 text-center py-4">No hay reportes pendientes</p>
                    ) : (
                      reportes.slice(0, 5).map((reporte) => (
                        <div key={reporte.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                            <AlertTriangle size={18} className="text-red-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 capitalize">{reporte.motivo.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500">{reporte.descripcion || 'Sin descripción'}</p>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedItem(reporte);
                              setModalType('reporte');
                            }}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Usuarios */}
          {activeTab === 'usuarios' && (
            <div className="space-y-6">
              {/* Panel de Estadísticas de Usuarios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Usuarios */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Total</span>
                    </div>
                    <p className="text-3xl font-bold">{usuarios.length.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm mt-1">Usuarios registrados</p>
                  </div>
                </div>

                {/* Registros Hoy */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Hoy</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {usuarios.filter(u => {
                        const hoy = new Date();
                        const fecha = u.fechaRegistro instanceof Date ? u.fechaRegistro : new Date(u.fechaRegistro || 0);
                        return fecha.toDateString() === hoy.toDateString();
                      }).length}
                    </p>
                    <p className="text-emerald-100 text-sm mt-1">Registros hoy</p>
                  </div>
                </div>

                {/* Verificados */}
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Verificados</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {usuarios.filter(u => u.verificado).length}
                    </p>
                    <p className="text-violet-100 text-sm mt-1">Usuarios verificados</p>
                  </div>
                </div>

                {/* Suspendidos */}
                <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Ban className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Suspendidos</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {usuarios.filter(u => u.suspendido).length}
                    </p>
                    <p className="text-red-100 text-sm mt-1">Cuentas suspendidas</p>
                  </div>
                </div>
              </div>

              {/* Stats secundarios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Shield className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {usuarios.filter(u => u.rol === 'admin' || u.rol === 'superadmin').length}
                      </p>
                      <p className="text-xs text-gray-500">Admins</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {usuarios.filter(u => u.rol === 'moderator').length}
                      </p>
                      <p className="text-xs text-gray-500">Moderadores</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {usuarios.filter(u => u.tipoUsuario === 'empresa').length}
                      </p>
                      <p className="text-xs text-gray-500">Empresas</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {usuarios.filter(u => u.tipoUsuario === 'particular' || !u.tipoUsuario).length}
                      </p>
                      <p className="text-xs text-gray-500">Particulares</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por email, nombre o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadData(true)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => loadData(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  Buscar
                </button>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Email</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Rol</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Registro</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {usuarios.map((u) => (
                        <tr key={u.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                <span className="font-medium text-gray-600">
                                  {u.nombre?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{u.nombre}</p>
                                <p className="text-xs text-gray-500">{u.tipoUsuario || 'particular'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                          <td className="px-6 py-4">
                            <select
                              value={u.rol || 'user'}
                              onChange={(e) => handleCambiarRol(u.id, e.target.value as RolUsuario)}
                              disabled={userRole !== 'superadmin' && (u.rol === 'superadmin' || u.rol === 'admin')}
                              className="text-sm border border-gray-200 rounded-lg px-2 py-1"
                            >
                              <option value="user">Usuario</option>
                              <option value="moderator">Moderador</option>
                              {userRole === 'superadmin' && <option value="admin">Admin</option>}
                              {userRole === 'superadmin' && <option value="superadmin">Superadmin</option>}
                            </select>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {u.suspendido ? (
                                <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">Suspendido</span>
                              ) : u.verificado ? (
                                <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full flex items-center gap-1">
                                  <CheckCircle size={12} /> Verificado
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">Activo</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {u.fechaRegistro?.toLocaleDateString?.() || 'N/A'}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerDetallesUsuario(u.id)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Ver detalles completos"
                              >
                                <Eye size={18} />
                              </button>
                              {!u.verificado && !u.suspendido && (
                                <button
                                  onClick={() => handleVerificarUsuario(u.id)}
                                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                                  title="Verificar"
                                >
                                  <UserCheck size={18} />
                                </button>
                              )}
                              {u.suspendido ? (
                                <button
                                  onClick={() => handleReactivarUsuario(u.id)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Reactivar"
                                >
                                  <RefreshCw size={18} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => {
                                    setSelectedItem(u);
                                    setModalType('suspender');
                                  }}
                                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg"
                                  title="Suspender"
                                >
                                  <Ban size={18} />
                                </button>
                              )}
                              <button
                                onClick={() => handleEliminarUsuario(u.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {usuarios.length === 0 && !loadingData && (
                  <div className="text-center py-12 text-gray-500">
                    No se encontraron usuarios
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Anuncios */}
          {activeTab === 'anuncios' && (
            <div className="space-y-6">
              {/* Panel de Estadísticas de Anuncios */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Anuncios */}
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Total</span>
                    </div>
                    <p className="text-3xl font-bold">{anuncios.length.toLocaleString()}</p>
                    <p className="text-blue-100 text-sm mt-1">Anuncios totales</p>
                  </div>
                </div>

                {/* Anuncios Hoy */}
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Hoy</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {anuncios.filter(a => {
                        const hoy = new Date();
                        const fecha = a.fechaPublicacion instanceof Date ? a.fechaPublicacion : new Date(a.fechaPublicacion);
                        return fecha.toDateString() === hoy.toDateString();
                      }).length}
                    </p>
                    <p className="text-emerald-100 text-sm mt-1">Publicados hoy</p>
                  </div>
                </div>

                {/* En Revisión */}
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Pendiente</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {anuncios.filter(a => a.estado === EstadoAnuncio.EN_REVISION).length}
                    </p>
                    <p className="text-amber-100 text-sm mt-1">En revisión</p>
                  </div>
                </div>

                {/* Activos */}
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <span className="text-xs bg-white/20 px-2 py-1 rounded-lg">Activos</span>
                    </div>
                    <p className="text-3xl font-bold">
                      {anuncios.filter(a => a.estado === EstadoAnuncio.ACTIVO).length}
                    </p>
                    <p className="text-violet-100 text-sm mt-1">Anuncios activos</p>
                  </div>
                </div>
              </div>

              {/* Stats secundarios */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {anuncios.filter(a => a.estado === EstadoAnuncio.RECHAZADO).length}
                      </p>
                      <p className="text-xs text-gray-500">Rechazados</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Pause className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {anuncios.filter(a => a.estado === EstadoAnuncio.PAUSADO).length}
                      </p>
                      <p className="text-xs text-gray-500">Pausados</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                      <Star className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {anuncios.filter(a => a.destacado).length}
                      </p>
                      <p className="text-xs text-gray-500">Destacados</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Eye className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {anuncios.reduce((sum, a) => sum + (a.vistas || 0), 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">Vistas totales</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por título o ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Pausado">Pausado</option>
                  <option value="Rechazado">Rechazado</option>
                </select>
                {/* Toggle vista */}
                <div className="flex bg-gray-100 rounded-xl p-1">
                  <button
                    onClick={() => setAnunciosViewMode('grid')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      anunciosViewMode === 'grid' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <BarChart3 size={18} />
                  </button>
                  <button
                    onClick={() => setAnunciosViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      anunciosViewMode === 'list' 
                        ? 'bg-white text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <FileText size={18} />
                  </button>
                </div>
              </div>

              {/* Vista Grid */}
              {anunciosViewMode === 'grid' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {anuncios
                  .filter((a) => {
                    if (filterEstado !== 'todos' && a.estado !== filterEstado) return false;
                    if (searchTerm) {
                      const searchLower = searchTerm.toLowerCase();
                      const matchTitulo = a.titulo.toLowerCase().includes(searchLower);
                      const matchId = a.id.toLowerCase().includes(searchLower);
                      if (!matchTitulo && !matchId) return false;
                    }
                    return true;
                  })
                  .map((anuncio) => (
                    <div key={anuncio.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="relative h-40">
                        {anuncio.imagenes?.[0] ? (
                          <Image src={anuncio.imagenes[0]} alt="" fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FileText className="text-gray-400" size={32} />
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-lg ${
                            anuncio.estado === EstadoAnuncio.ACTIVO ? 'bg-green-500 text-white' :
                            anuncio.estado === EstadoAnuncio.EN_REVISION ? 'bg-yellow-500 text-white' :
                            anuncio.estado === EstadoAnuncio.PAUSADO ? 'bg-gray-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {anuncio.estado}
                          </span>
                          {anuncio.destacado && (
                            <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-lg flex items-center gap-1">
                              <Star size={12} fill="currentColor" /> Destacado
                            </span>
                          )}
                        </div>
                        {anuncio.reportes && anuncio.reportes > 0 && (
                          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded-lg flex items-center gap-1">
                            <AlertTriangle size={12} /> {anuncio.reportes}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{anuncio.titulo}</h3>
                        <p className="text-lg font-bold text-blue-600 mt-1">{anuncio.precio?.toLocaleString()} €</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
                          <span className="flex items-center gap-1"><Eye size={14} /> {anuncio.vistas || 0}</span>
                          <span>{anuncio.provincia}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-mono mt-1">ID: {anuncio.id.slice(0, 12)}...</p>
                        <div className="flex gap-2 mt-4">
                          {anuncio.estado === EstadoAnuncio.EN_REVISION && (
                            <>
                              <button
                                onClick={() => handleAprobarAnuncio(anuncio.id)}
                                className="flex-1 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200"
                              >
                                Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(anuncio);
                                  setModalType('rechazar');
                                }}
                                className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg text-sm font-medium hover:bg-red-200"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {anuncio.estado === EstadoAnuncio.ACTIVO && (
                            <button
                              onClick={() => handleDestacarAnuncio(anuncio.id, !anuncio.destacado)}
                              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                                anuncio.destacado 
                                  ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                  : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              }`}
                            >
                              {anuncio.destacado ? 'Quitar destacado' : 'Destacar'}
                            </button>
                          )}
                          <button
                            onClick={() => window.open(`/ad/${anuncio.id}/edit`, '_blank')}
                            className="p-2 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => window.open(`/ad/${anuncio.id}`, '_blank')}
                            className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                          >
                            <ExternalLink size={18} />
                          </button>
                          <button
                            onClick={() => handleEliminarAnuncio(anuncio.id)}
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              )}

              {/* Vista Lista */}
              {anunciosViewMode === 'list' && (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Anuncio</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Precio</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Vistas</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Favs</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Estado</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase hidden lg:table-cell">Ubicación</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {anuncios
                        .filter((a) => {
                          if (filterEstado !== 'todos' && a.estado !== filterEstado) return false;
                          if (searchTerm) {
                            const searchLower = searchTerm.toLowerCase();
                            const matchTitulo = a.titulo.toLowerCase().includes(searchLower);
                            const matchId = a.id.toLowerCase().includes(searchLower);
                            if (!matchTitulo && !matchId) return false;
                          }
                          return true;
                        })
                        .map((anuncio) => (
                          <tr key={anuncio.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <div 
                                className="flex items-center gap-3 cursor-pointer"
                                onClick={async () => {
                                  setAnuncioDetalle(anuncio);
                                  // Cargar usuario del anuncio
                                  const usuarioAnuncio = usuarios.find(u => u.id === anuncio.vendedorId);
                                  setAnuncioDetalleUsuario(usuarioAnuncio || null);
                                }}
                              >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                  {anuncio.imagenes?.[0] ? (
                                    <Image src={anuncio.imagenes[0]} alt="" fill className="object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                      <FileText className="text-gray-400" size={16} />
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-medium text-gray-900 text-sm truncate max-w-[200px] hover:text-blue-600">{anuncio.titulo}</p>
                                  <p className="text-xs text-gray-500">{anuncio.categoria}</p>
                                  <p className="text-[10px] text-gray-400 font-mono">ID: {anuncio.id.slice(0, 10)}...</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 hidden md:table-cell">
                              <span className="font-bold text-blue-600">{anuncio.precio?.toLocaleString()} €</span>
                            </td>
                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                              <span className="text-sm text-gray-600 flex items-center justify-center gap-1">
                                <Eye size={14} /> {anuncio.vistas || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center hidden sm:table-cell">
                              <span className="text-sm text-red-500 flex items-center justify-center gap-1">
                                ❤️ {anuncio.favoritos || 0}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center gap-1">
                                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                  anuncio.estado === EstadoAnuncio.ACTIVO ? 'bg-green-100 text-green-700' :
                                  anuncio.estado === EstadoAnuncio.EN_REVISION ? 'bg-yellow-100 text-yellow-700' :
                                  anuncio.estado === EstadoAnuncio.PAUSADO ? 'bg-gray-100 text-gray-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {anuncio.estado}
                                </span>
                                {anuncio.destacado && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full">
                                    <Star size={10} fill="currentColor" /> Destacado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center hidden lg:table-cell">
                              <span className="text-sm text-gray-600">{anuncio.provincia}</span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-end gap-1">
                                {anuncio.estado === EstadoAnuncio.EN_REVISION && (
                                  <>
                                    <button
                                      onClick={() => handleAprobarAnuncio(anuncio.id)}
                                      className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                                      title="Aprobar"
                                    >
                                      <CheckCircle size={16} />
                                    </button>
                                    <button
                                      onClick={() => {
                                        setSelectedItem(anuncio);
                                        setModalType('rechazar');
                                      }}
                                      className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                      title="Rechazar"
                                    >
                                      <XCircle size={16} />
                                    </button>
                                  </>
                                )}
                                {anuncio.estado === EstadoAnuncio.ACTIVO && (
                                  <button
                                    onClick={() => handleDestacarAnuncio(anuncio.id, !anuncio.destacado)}
                                    className={`p-1.5 rounded-lg ${
                                      anuncio.destacado 
                                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                        : 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                                    }`}
                                    title={anuncio.destacado ? 'Quitar destacado' : 'Destacar'}
                                  >
                                    <Star size={16} fill={anuncio.destacado ? 'currentColor' : 'none'} />
                                  </button>
                                )}
                                <button
                                  onClick={() => window.open(`/ad/${anuncio.id}/edit`, '_blank')}
                                  className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
                                  title="Editar anuncio"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => window.open(`/ad/${anuncio.id}`, '_blank')}
                                  className="p-1.5 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                                  title="Ver anuncio"
                                >
                                  <ExternalLink size={16} />
                                </button>
                                <button
                                  onClick={() => handleEliminarAnuncio(anuncio.id)}
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                                  title="Eliminar"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}

              {anuncios.length === 0 && !loadingData && (
                <div className="text-center py-12 text-gray-500">
                  No se encontraron anuncios
                </div>
              )}

              {/* Modal de Detalles del Anuncio */}
              {anuncioDetalle && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                    {/* Header del Modal */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">Detalles del Anuncio</h2>
                          <p className="text-blue-100 text-sm mt-1">ID: {anuncioDetalle.id}</p>
                        </div>
                        <button
                          onClick={() => {
                            setAnuncioDetalle(null);
                            setAnuncioDetalleUsuario(null);
                          }}
                          className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>

                    <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                      <div className="p-6 space-y-6">
                        {/* Info Principal */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Imagen */}
                          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                            {anuncioDetalle.imagenes?.[0] ? (
                              <Image 
                                src={anuncioDetalle.imagenes[0]} 
                                alt="" 
                                fill 
                                className="object-cover" 
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileText className="text-gray-400" size={64} />
                              </div>
                            )}
                            <div className="absolute top-3 left-3 flex gap-2">
                              <span className={`px-3 py-1.5 text-xs font-semibold rounded-lg ${
                                anuncioDetalle.estado === EstadoAnuncio.ACTIVO ? 'bg-green-500 text-white' :
                                anuncioDetalle.estado === EstadoAnuncio.EN_REVISION ? 'bg-yellow-500 text-white' :
                                anuncioDetalle.estado === EstadoAnuncio.PAUSADO ? 'bg-gray-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {anuncioDetalle.estado}
                              </span>
                              {anuncioDetalle.destacado && (
                                <span className="px-3 py-1.5 bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1">
                                  <Star size={12} fill="currentColor" /> Destacado
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Detalles */}
                          <div className="space-y-4">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900">{anuncioDetalle.titulo}</h3>
                              <p className="text-3xl font-bold text-blue-600 mt-2">
                                {anuncioDetalle.precio?.toLocaleString('es-ES')} €
                              </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500 uppercase font-medium">Categoría</p>
                                <p className="font-semibold text-gray-900 mt-1">{anuncioDetalle.categoria}</p>
                              </div>
                              <div className="bg-gray-50 rounded-xl p-3">
                                <p className="text-xs text-gray-500 uppercase font-medium">Ubicación</p>
                                <p className="font-semibold text-gray-900 mt-1">{anuncioDetalle.provincia || 'No especificada'}</p>
                              </div>
                              <div className="bg-blue-50 rounded-xl p-3">
                                <p className="text-xs text-blue-600 uppercase font-medium">Vistas</p>
                                <p className="font-bold text-blue-600 mt-1 flex items-center gap-1">
                                  <Eye size={16} /> {anuncioDetalle.vistas || 0}
                                </p>
                              </div>
                              <div className="bg-red-50 rounded-xl p-3">
                                <p className="text-xs text-red-600 uppercase font-medium">Favoritos</p>
                                <p className="font-bold text-red-600 mt-1">
                                  ❤️ {anuncioDetalle.favoritos || 0}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Descripción */}
                        <div className="bg-gray-50 rounded-2xl p-4">
                          <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                          <p className="text-gray-600 text-sm whitespace-pre-wrap">
                            {anuncioDetalle.descripcion || 'Sin descripción'}
                          </p>
                        </div>

                        {/* Info del Vendedor */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-indigo-600" />
                            Publicado por
                          </h4>
                          <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                              {anuncioDetalleUsuario?.nombre?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900 text-lg">
                                {anuncioDetalleUsuario?.nombre || 'Usuario desconocido'}
                              </p>
                              <p className="text-gray-500 text-sm">{anuncioDetalleUsuario?.email || 'Email no disponible'}</p>
                              {anuncioDetalleUsuario?.verificado && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full mt-1">
                                  <CheckCircle size={12} /> Verificado
                                </span>
                              )}
                            </div>
                            <button
                              onClick={() => window.open(`/profile?userId=${anuncioDetalleUsuario?.id}`, '_blank')}
                              className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-xl text-sm font-medium hover:bg-indigo-200 transition-colors"
                            >
                              Ver perfil
                            </button>
                          </div>
                        </div>

                        {/* Fechas y Metadatos */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Clock size={20} className="text-blue-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Publicado</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {anuncioDetalle.fechaPublicacion ? (
                                    new Date(anuncioDetalle.fechaPublicacion instanceof Date 
                                      ? anuncioDetalle.fechaPublicacion 
                                      : anuncioDetalle.fechaPublicacion
                                    ).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })
                                  ) : 'No disponible'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <MapPin size={20} className="text-green-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Localidad</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {anuncioDetalle.provincia || 'No especificada'}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                <AlertTriangle size={20} className="text-amber-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Reportes</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {anuncioDetalle.reportes || 0} reportes
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-white border border-gray-200 rounded-xl p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                <FileText size={20} className="text-purple-600" />
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 uppercase">Imágenes</p>
                                <p className="font-semibold text-gray-900 text-sm">
                                  {anuncioDetalle.imagenes?.length || 0} fotos
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Galería de imágenes */}
                        {anuncioDetalle.imagenes && anuncioDetalle.imagenes.length > 1 && (
                          <div>
                            <h4 className="font-semibold text-gray-900 mb-3">Galería ({anuncioDetalle.imagenes.length} imágenes)</h4>
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                              {anuncioDetalle.imagenes.map((img, idx) => (
                                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                                  <Image src={img} alt="" fill className="object-cover hover:scale-110 transition-transform cursor-pointer" />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Acciones */}
                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                          {anuncioDetalle.estado === EstadoAnuncio.EN_REVISION && (
                            <>
                              <button
                                onClick={() => {
                                  handleAprobarAnuncio(anuncioDetalle.id);
                                  setAnuncioDetalle(null);
                                }}
                                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <CheckCircle size={18} /> Aprobar
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedItem(anuncioDetalle);
                                  setModalType('rechazar');
                                  setAnuncioDetalle(null);
                                }}
                                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <XCircle size={18} /> Rechazar
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => window.open(`/ad/${anuncioDetalle.id}`, '_blank')}
                            className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center gap-2"
                          >
                            <ExternalLink size={18} /> Ver público
                          </button>
                          <button
                            onClick={() => window.open(`/ad/${anuncioDetalle.id}/edit`, '_blank')}
                            className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors flex items-center gap-2"
                          >
                            <Edit size={18} /> Editar
                          </button>
                          <button
                            onClick={() => {
                              handleEliminarAnuncio(anuncioDetalle.id);
                              setAnuncioDetalle(null);
                            }}
                            className="px-6 py-3 bg-red-100 text-red-600 rounded-xl font-semibold hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <Trash2 size={18} /> Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mensajes de Contacto */}
          {activeTab === 'mensajes' && (
            <div className="space-y-6">
              {/* Stats de Mensajes */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Inbox className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{mensajesContacto.length}</p>
                    <p className="text-blue-100 text-sm mt-1">Total mensajes</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Mail className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{mensajesContacto.filter(m => !m.leido).length}</p>
                    <p className="text-red-100 text-sm mt-1">No leídos</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{mensajesContacto.filter(m => m.estado === 'pendiente').length}</p>
                    <p className="text-amber-100 text-sm mt-1">Pendientes</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl p-5 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                    </div>
                    <p className="text-3xl font-bold">{mensajesContacto.filter(m => m.estado === 'resuelto').length}</p>
                    <p className="text-green-100 text-sm mt-1">Resueltos</p>
                  </div>
                </div>
              </div>
              
              {/* Filtros */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-wrap gap-4">
                <select
                  value={filterMensajes}
                  onChange={(e) => setFilterMensajes(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los mensajes</option>
                  <option value="no_leidos">No leídos</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="en_proceso">En proceso</option>
                  <option value="resuelto">Resueltos</option>
                </select>
              </div>
              
              {/* Lista de Mensajes y Detalle */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Lista de mensajes */}
                <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-900">Bandeja de entrada</h3>
                  </div>
                  <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                    {mensajesContacto
                      .filter(m => {
                        if (filterMensajes === 'todos') return true;
                        if (filterMensajes === 'no_leidos') return !m.leido;
                        return m.estado === filterMensajes;
                      })
                      .map((mensaje) => (
                        <button
                          key={mensaje.id}
                          onClick={async () => {
                            setMensajeSeleccionado(mensaje);
                            if (!mensaje.leido) {
                              await marcarMensajeLeido(mensaje.id);
                            }
                          }}
                          className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                            mensajeSeleccionado?.id === mensaje.id ? 'bg-blue-50' : ''
                          } ${!mensaje.leido ? 'bg-blue-50/50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              !mensaje.leido ? 'bg-blue-100' : 'bg-gray-100'
                            }`}>
                              <span className={`text-sm font-semibold ${
                                !mensaje.leido ? 'text-blue-600' : 'text-gray-600'
                              }`}>
                                {mensaje.nombre.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <p className={`text-sm truncate ${!mensaje.leido ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                  {mensaje.nombre}
                                </p>
                                <span className="text-xs text-gray-500 whitespace-nowrap">
                                  {mensaje.fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  mensaje.asunto === 'general' ? 'bg-blue-50 text-blue-600' :
                                  mensaje.asunto === 'technical' ? 'bg-purple-50 text-purple-600' :
                                  mensaje.asunto === 'account' ? 'bg-indigo-50 text-indigo-600' :
                                  mensaje.asunto === 'payment' ? 'bg-green-50 text-green-600' :
                                  mensaje.asunto === 'report' ? 'bg-red-50 text-red-600' :
                                  mensaje.asunto === 'suggestion' ? 'bg-amber-50 text-amber-600' :
                                  'bg-gray-50 text-gray-600'
                                }`}>
                                  {mensaje.asunto === 'general' ? '❓ General' :
                                   mensaje.asunto === 'technical' ? '🔧 Tehnic' :
                                   mensaje.asunto === 'account' ? '👤 Cont' :
                                   mensaje.asunto === 'payment' ? '💳 Plăți' :
                                   mensaje.asunto === 'report' ? '⚠️ Raport' :
                                   mensaje.asunto === 'suggestion' ? '💡 Sugestie' :
                                   '📝 Altele'}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 truncate mt-1">{mensaje.mensaje.substring(0, 50)}...</p>
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  mensaje.estado === 'pendiente' ? 'bg-amber-100 text-amber-700' :
                                  mensaje.estado === 'en_proceso' ? 'bg-blue-100 text-blue-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {mensaje.estado === 'pendiente' ? 'Pendiente' :
                                   mensaje.estado === 'en_proceso' ? 'En proceso' : 'Resuelto'}
                                </span>
                                {mensaje.respondido && (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <Reply size={12} /> Respondido
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    {mensajesContacto.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        <Inbox className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                        <p>No hay mensajes</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Detalle del mensaje */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {mensajeSeleccionado ? (
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="p-6 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{mensajeSeleccionado.asunto}</h3>
                              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                                mensajeSeleccionado.asunto === 'general' ? 'bg-blue-100 text-blue-700' :
                                mensajeSeleccionado.asunto === 'technical' ? 'bg-purple-100 text-purple-700' :
                                mensajeSeleccionado.asunto === 'account' ? 'bg-indigo-100 text-indigo-700' :
                                mensajeSeleccionado.asunto === 'payment' ? 'bg-green-100 text-green-700' :
                                mensajeSeleccionado.asunto === 'report' ? 'bg-red-100 text-red-700' :
                                mensajeSeleccionado.asunto === 'suggestion' ? 'bg-amber-100 text-amber-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {mensajeSeleccionado.asunto === 'general' ? '❓ Întrebare generală' :
                                 mensajeSeleccionado.asunto === 'technical' ? '🔧 Problemă tehnică' :
                                 mensajeSeleccionado.asunto === 'account' ? '👤 Contul meu' :
                                 mensajeSeleccionado.asunto === 'payment' ? '💳 Plăți și facturi' :
                                 mensajeSeleccionado.asunto === 'report' ? '⚠️ Raportare înșelătorie' :
                                 mensajeSeleccionado.asunto === 'suggestion' ? '💡 Sugestie' :
                                 '📝 Altele'}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <User size={14} />
                                {mensajeSeleccionado.nombre}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail size={14} />
                                {mensajeSeleccionado.email}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock size={14} />
                                {mensajeSeleccionado.fecha.toLocaleString('es-ES')}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={mensajeSeleccionado.estado}
                              onChange={async (e) => {
                                const nuevoEstado = e.target.value as 'pendiente' | 'en_proceso' | 'resuelto';
                                await actualizarEstadoMensaje(mensajeSeleccionado.id, nuevoEstado);
                                setMensajeSeleccionado({...mensajeSeleccionado, estado: nuevoEstado});
                                toastSuccess('Estado actualizado');
                              }}
                              className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="en_proceso">En proceso</option>
                              <option value="resuelto">Resuelto</option>
                            </select>
                            <button
                              onClick={async () => {
                                if (confirm('¿Eliminar este mensaje?')) {
                                  await eliminarMensajeContacto(mensajeSeleccionado.id);
                                  setMensajeSeleccionado(null);
                                  toastSuccess('Mensaje eliminado');
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Contenido del mensaje */}
                      <div className="flex-1 p-6 overflow-y-auto">
                        <div className="bg-gray-50 rounded-xl p-4 mb-6">
                          <p className="text-gray-700 whitespace-pre-wrap">{mensajeSeleccionado.mensaje}</p>
                        </div>
                        
                        {/* Respuesta anterior */}
                        {mensajeSeleccionado.respondido && mensajeSeleccionado.respuesta && (
                          <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-100">
                            <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-2">
                              <Reply size={16} />
                              Respuesta enviada
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{mensajeSeleccionado.respuesta}</p>
                            {mensajeSeleccionado.fechaRespuesta && (
                              <p className="text-xs text-gray-500 mt-2">
                                {mensajeSeleccionado.fechaRespuesta.toLocaleString('es-ES')}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Formulario de respuesta */}
                        {!mensajeSeleccionado.respondido && (
                          <div className="space-y-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Responder al usuario
                            </label>
                            <textarea
                              value={respuestaMensaje}
                              onChange={(e) => setRespuestaMensaje(e.target.value)}
                              rows={4}
                              placeholder="Escribe tu respuesta..."
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <div className="flex justify-end">
                              <button
                                onClick={async () => {
                                  if (!respuestaMensaje.trim() || !user) return;
                                  setEnviandoRespuesta(true);
                                  try {
                                    await responderMensaje(mensajeSeleccionado.id, respuestaMensaje, user.uid);
                                    setMensajeSeleccionado({
                                      ...mensajeSeleccionado, 
                                      respondido: true, 
                                      respuesta: respuestaMensaje,
                                      fechaRespuesta: new Date(),
                                      estado: 'resuelto'
                                    });
                                    setRespuestaMensaje('');
                                    toastSuccess('Respuesta guardada');
                                  } catch (error) {
                                    toastError('Error al guardar respuesta');
                                  } finally {
                                    setEnviandoRespuesta(false);
                                  }
                                }}
                                disabled={!respuestaMensaje.trim() || enviandoRespuesta}
                                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {enviandoRespuesta ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Enviando...
                                  </>
                                ) : (
                                  <>
                                    <Reply size={18} />
                                    Enviar respuesta
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                      <Mail className="w-16 h-16 mb-4" />
                      <p className="text-lg">Selecciona un mensaje para ver los detalles</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Promociones */}
          {activeTab === 'promociones' && (
            <div className="space-y-6">
              {/* Stats de Promociones */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Promociones Activas</p>
                      <p className="text-3xl font-bold mt-1">{promocionesActivas.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Históricas</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{promociones.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Receipt size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">VIP</p>
                      <p className="text-3xl font-bold text-amber-600 mt-1">
                        {promociones.filter(p => p.tipo === 'VIP').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                      <Crown size={24} className="text-amber-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Premium / Destacado</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {promociones.filter(p => p.tipo !== 'VIP').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Star size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por email o título de anuncio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterPromocion}
                  onChange={(e) => setFilterPromocion(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="todos">Todos los tipos</option>
                  <option value="VIP">VIP</option>
                  <option value="Premium">Premium</option>
                  <option value="Destacado">Destacado</option>
                </select>
                <select
                  value={filterPromocion === 'activa' || filterPromocion === 'expirada' ? filterPromocion : 'estado'}
                  onChange={(e) => setFilterPromocion(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="estado">Todos los estados</option>
                  <option value="activa">Activas</option>
                  <option value="expirada">Expiradas</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('table')}
                    className={`p-3 rounded-xl ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <Table size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-3 rounded-xl ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                  >
                    <LayoutGrid size={20} />
                  </button>
                </div>
              </div>

              {/* Tabla de Promociones */}
              {viewMode === 'table' ? (
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Promoción</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Anuncio</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Expira</th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                          <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {promociones
                          .filter((p) => {
                            if (filterPromocion === 'activa' && p.estado !== 'activa') return false;
                            if (filterPromocion === 'expirada' && p.estado !== 'expirada') return false;
                            if (filterPromocion === 'VIP' && p.tipo !== 'VIP') return false;
                            if (filterPromocion === 'Premium' && p.tipo !== 'Premium') return false;
                            if (filterPromocion === 'Destacado' && p.tipo !== 'Destacado') return false;
                            if (searchTerm && !p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) && !p.anuncioTitulo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                            return true;
                          })
                          .map((promo) => (
                            <tr key={promo.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                    promo.tipo === 'VIP' ? 'bg-amber-100' :
                                    promo.tipo === 'Premium' ? 'bg-purple-100' :
                                    'bg-blue-100'
                                  }`}>
                                    {promo.tipo === 'VIP' ? <Crown className="text-amber-600" size={20} /> :
                                     promo.tipo === 'Premium' ? <Zap className="text-purple-600" size={20} /> :
                                     <Star className="text-blue-600" size={20} />}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-gray-900">{promo.tipo}</p>
                                    <p className="text-xs text-gray-500">{promo.duracion} días</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-900">{promo.userEmail}</p>
                                <p className="text-xs text-gray-500">ID: {promo.userId.slice(0, 8)}...</p>
                              </td>
                              <td className="px-6 py-4">
                                <p className="text-sm text-gray-900 max-w-[200px] truncate">{promo.anuncioTitulo}</p>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-semibold text-green-600">{promo.precio.toLocaleString()} €</span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {promo.fechaCompra.toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {promo.fechaExpiracion.toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4">
                                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                  promo.estado === 'activa' ? 'bg-green-100 text-green-600' :
                                  promo.estado === 'expirada' ? 'bg-gray-100 text-gray-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {promo.estado.charAt(0).toUpperCase() + promo.estado.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => window.open(`/ad/${promo.anuncioId}`, '_blank')}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                    title="Ver anuncio"
                                  >
                                    <ExternalLink size={18} />
                                  </button>
                                  {promo.estado === 'activa' && (
                                    <button
                                      onClick={async () => {
                                        if (confirm(`¿Cancelar la promoción ${promo.tipo} del anuncio "${promo.anuncioTitulo}"?`)) {
                                          const success = await cancelarPromocion(promo.anuncioId);
                                          if (success) {
                                            setPromociones(prev => prev.filter(p => p.id !== promo.id));
                                            setPromocionesActivas(prev => prev.filter(p => p.id !== promo.id));
                                            toastSuccess('Promoción cancelada', 'La promoción ha sido eliminada correctamente');
                                          } else {
                                            toastError('Error', 'No se pudo cancelar la promoción');
                                          }
                                        }
                                      }}
                                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                      title="Cancelar promoción"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  {promociones.length === 0 && !loadingData && (
                    <div className="text-center py-12 text-gray-500">
                      No hay promociones registradas
                    </div>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {promociones
                    .filter((p) => {
                      if (filterPromocion === 'activa' && p.estado !== 'activa') return false;
                      if (filterPromocion === 'expirada' && p.estado !== 'expirada') return false;
                      if (filterPromocion === 'VIP' && p.tipo !== 'VIP') return false;
                      if (filterPromocion === 'Premium' && p.tipo !== 'Premium') return false;
                      if (filterPromocion === 'Destacado' && p.tipo !== 'Destacado') return false;
                      if (searchTerm && !p.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) && !p.anuncioTitulo.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                      return true;
                    })
                    .map((promo) => (
                      <div key={promo.id} className={`bg-white rounded-2xl shadow-sm overflow-hidden border-l-4 ${
                        promo.tipo === 'VIP' ? 'border-amber-500' :
                        promo.tipo === 'Premium' ? 'border-purple-500' :
                        'border-blue-500'
                      }`}>
                        <div className="p-5">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                              promo.tipo === 'VIP' ? 'bg-amber-100 text-amber-700' :
                              promo.tipo === 'Premium' ? 'bg-purple-100 text-purple-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {promo.tipo === 'VIP' && <Crown size={14} className="inline mr-1" />}
                              {promo.tipo === 'Premium' && <Zap size={14} className="inline mr-1" />}
                              {promo.tipo === 'Destacado' && <Star size={14} className="inline mr-1" />}
                              {promo.tipo}
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              promo.estado === 'activa' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {promo.estado}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 truncate mb-2">{promo.anuncioTitulo}</h4>
                          <p className="text-sm text-gray-500 mb-3">{promo.userEmail}</p>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">
                              <Calendar size={14} className="inline mr-1" />
                              {promo.fechaCompra.toLocaleDateString()}
                            </span>
                            <span className="font-bold text-green-600">{promo.precio}€</span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Anuncios Extra */}
          {activeTab === 'extras' && (
            <div className="space-y-6">
              {/* Stats de Anuncios Extra */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-100 text-sm">Paquetes Activos</p>
                      <p className="text-3xl font-bold mt-1">
                        {anunciosExtra.filter(e => e.estado === 'activo').length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <Package size={24} />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Total Comprados</p>
                      <p className="text-3xl font-bold text-gray-900 mt-1">{anunciosExtra.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Gift size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Anuncios Vendidos</p>
                      <p className="text-3xl font-bold text-emerald-600 mt-1">
                        {anunciosExtra.reduce((acc, e) => acc + e.cantidad, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <FileText size={24} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Ingresos por Extras</p>
                      <p className="text-3xl font-bold text-green-600 mt-1">
                        {anunciosExtra.reduce((acc, e) => acc + e.precio, 0).toLocaleString()}€
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <DollarSign size={24} className="text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Buscar por email o nombre de usuario..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterExtras}
                  onChange={(e) => setFilterExtras(e.target.value)}
                  className="px-4 py-3 border border-gray-200 rounded-xl bg-white"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="activo">Activos</option>
                  <option value="agotado">Agotados</option>
                  <option value="expirado">Expirados</option>
                </select>
              </div>

              {/* Tabla de Anuncios Extra */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usuario</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Paquete</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cantidad</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Usados</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Restantes</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Precio</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {anunciosExtra
                        .filter((e) => {
                          if (filterExtras !== 'todos' && e.estado !== filterExtras) return false;
                          if (searchTerm && !e.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) && !e.userName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
                          return true;
                        })
                        .map((extra) => (
                          <tr key={extra.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                  <span className="font-medium text-emerald-600">
                                    {extra.userName.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{extra.userName}</p>
                                  <p className="text-xs text-gray-500">{extra.userEmail}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900 max-w-[200px] truncate">{extra.paquete}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-gray-900">{extra.cantidad}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-blue-600">{extra.anunciosUsados}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`font-semibold ${extra.anunciosRestantes > 0 ? 'text-green-600' : 'text-gray-400'}`}>
                                {extra.anunciosRestantes}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-semibold text-green-600">{extra.precio.toLocaleString()}€</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {extra.fechaCompra.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                extra.estado === 'activo' ? 'bg-green-100 text-green-600' :
                                extra.estado === 'agotado' ? 'bg-amber-100 text-amber-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {extra.estado.charAt(0).toUpperCase() + extra.estado.slice(1)}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {anunciosExtra.length === 0 && !loadingData && (
                  <div className="text-center py-12 text-gray-500">
                    No hay compras de anuncios extra registradas
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Ingresos */}
          {activeTab === 'ingresos' && (
            <div className="space-y-6">
              {/* Stats de Ingresos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Ingresos Totales</p>
                      <p className="text-3xl font-bold mt-1">
                        {facturas.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0).toLocaleString()}€
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <DollarSign size={24} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-green-100 text-sm">
                    <TrendingUp size={16} />
                    <span>{facturas.filter(f => f.estado === 'pagada').length} transacciones pagadas</span>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Por Promociones</p>
                      <p className="text-3xl font-bold text-purple-600 mt-1">
                        {facturas.filter(f => f.tipoCompra === 'promocion' && f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0).toLocaleString()}€
                      </p>
                      <div className="mt-2 text-xs text-gray-500 space-y-1">
                        <p>🏆 VIP: {facturas.filter(f => f.planTipo === 'VIP' && f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0).toLocaleString()}€</p>
                        <p>⭐ Premium: {facturas.filter(f => f.planTipo === 'Premium' && f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0).toLocaleString()}€</p>
                        <p>✨ Destacado: {facturas.filter(f => f.planTipo === 'Destacado' && f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0).toLocaleString()}€</p>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Sparkles size={24} className="text-purple-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Por Anuncios Extra</p>
                      <p className="text-3xl font-bold text-emerald-600 mt-1">
                        {facturas.filter(f => f.tipoCompra === 'anuncios_extra' && f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0).toLocaleString()}€
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                      <Package size={24} className="text-emerald-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-500 text-sm">Ticket Promedio</p>
                      <p className="text-3xl font-bold text-blue-600 mt-1">
                        {facturas.filter(f => f.estado === 'pagada').length > 0 
                          ? (facturas.filter(f => f.estado === 'pagada').reduce((acc, f) => acc + (f.total || 0), 0) / facturas.filter(f => f.estado === 'pagada').length).toFixed(2)
                          : 0}€
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <CreditCard size={24} className="text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráfico de Ingresos por Mes */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-6">Ingresos Mensuales</h3>
                <div className="h-64 flex items-end gap-2">
                  {resumenIngresos.map((mes, i) => {
                    const maxIngresos = Math.max(...resumenIngresos.map(m => m.ingresos), 1);
                    const height = (mes.ingresos / maxIngresos) * 100;
                    return (
                      <div key={mes.periodo} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full relative" style={{ height: '200px' }}>
                          <div 
                            className="absolute bottom-0 w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg transition-all hover:from-blue-600 hover:to-blue-500"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${mes.ingresos.toLocaleString()}€`}
                          />
                        </div>
                        <span className="text-xs text-gray-500 transform -rotate-45 origin-center whitespace-nowrap">
                          {mes.periodo}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabla de Facturas */}
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Todas las Facturas</h3>
                  <div className="flex gap-3">
                    <select
                      value={filterFacturas}
                      onChange={(e) => setFilterFacturas(e.target.value)}
                      className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      <option value="todos">Todos los tipos</option>
                      <option value="promocion">Promociones</option>
                      <option value="anuncios_extra">Anuncios Extra</option>
                      <option value="otro">Otros</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Nº Factura</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Cliente</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Concepto</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Tipo</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Fecha</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600">Estado</th>
                        <th className="text-right px-6 py-4 text-sm font-semibold text-gray-600">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {facturas
                        .filter((f) => filterFacturas === 'todos' || f.tipoCompra === filterFacturas)
                        .map((factura) => (
                          <tr key={factura.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm text-gray-900">{factura.numero || factura.id.slice(0, 8)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="font-medium text-gray-900">{factura.userName || factura.clienteNombre}</p>
                                <p className="text-xs text-gray-500">{factura.clienteEmail}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-900 max-w-[200px] truncate">{factura.concepto}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                factura.tipoCompra === 'promocion' ? 'bg-purple-100 text-purple-600' :
                                factura.tipoCompra === 'anuncios_extra' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                {factura.tipoCompra === 'promocion' ? 'Promoción' :
                                 factura.tipoCompra === 'anuncios_extra' ? 'Anuncios Extra' :
                                 'Otro'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {factura.fecha?.toLocaleDateString?.() || 'N/A'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                factura.estado === 'pagada' ? 'bg-green-100 text-green-600' :
                                factura.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {factura.estado?.charAt(0).toUpperCase() + factura.estado?.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="font-bold text-green-600">{factura.total?.toLocaleString()}€</span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                {facturas.length === 0 && !loadingData && (
                  <div className="text-center py-12 text-gray-500">
                    No hay facturas registradas
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bonificaciones / Promociones Admin */}
          {activeTab === 'bonificaciones' && (
            <PromocionesAdminPanel
              usuarios={usuarios}
              user={user}
              toastSuccess={toastSuccess}
              toastError={toastError}
              toastWarning={toastWarning}
            />
          )}

          {/* Reportes */}
          {activeTab === 'reportes' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Reportes Pendientes de Revisión</h3>
                </div>
                <div className="divide-y divide-gray-100">
                  {reportes.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No hay reportes pendientes 🎉
                    </div>
                  ) : (
                    reportes.map((reporte) => (
                      <div key={reporte.id} className="p-6 hover:bg-gray-50">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <AlertTriangle className="text-red-600" size={24} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 capitalize">
                                  {reporte.motivo.replace('_', ' ')}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                  {reporte.descripcion || 'Sin descripción adicional'}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  Anuncio ID: {reporte.anuncioId} | Reportado: {reporte.fecha?.toLocaleDateString?.() || 'N/A'}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => window.open(`/ad/${reporte.anuncioId}`, '_blank')}
                                  className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-200"
                                >
                                  Ver anuncio
                                </button>
                                <button
                                  onClick={() => handleResolverReporte(reporte.id, 'resuelto')}
                                  className="px-4 py-2 bg-green-100 text-green-600 rounded-lg text-sm font-medium hover:bg-green-200"
                                >
                                  Resolver
                                </button>
                                <button
                                  onClick={() => handleResolverReporte(reporte.id, 'descartado')}
                                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200"
                                >
                                  Descartar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-gray-900">Registro de Actividad</h3>
                </div>
                <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
                  {logs.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      No hay actividad registrada
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-4 hover:bg-gray-50 flex items-start gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Activity className="text-blue-600" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">
                            <span className="font-medium">{log.adminEmail}</span>{' '}
                            <span className="text-gray-600">{log.accion}</span>
                          </p>
                          {log.detalles && (
                            <p className="text-xs text-gray-500 mt-1">{log.detalles}</p>
                          )}
                          <p className="text-xs text-gray-400 mt-1">
                            {log.entidad} {log.entidadId && `• ${log.entidadId.slice(0, 8)}...`} • {log.fecha?.toLocaleString?.() || 'N/A'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Configuración */}
          {activeTab === 'configuracion' && (
            <div className="space-y-6">
              {/* Información del Panel */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-6">Configuración del Sistema</h3>
                
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <h4 className="font-medium text-gray-900 mb-2">Información del Panel</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Tu rol:</span>
                        <span className="ml-2 font-medium capitalize">{userRole}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Email:</span>
                        <span className="ml-2 font-medium">{user?.email}</span>
                      </div>
                      {paymentConfig?.updatedAt && (
                        <div className="col-span-2">
                          <span className="text-gray-500">Última actualización:</span>
                          <span className="ml-2 font-medium">{new Date(paymentConfig.updatedAt).toLocaleString('ro-RO')}</span>
                          {paymentConfig.updatedBy && <span className="text-gray-400 ml-2">por {paymentConfig.updatedBy}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Configuración de Stripe */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#635bff]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#635bff">
                      <path d="M13.976 9.15c-2.172-.806-3.356-1.426-3.356-2.409 0-.831.683-1.305 1.901-1.305 2.227 0 4.515.858 6.09 1.631l.89-5.494C18.252.975 15.697 0 12.165 0 9.667 0 7.589.654 6.104 1.872 4.56 3.147 3.757 4.992 3.757 7.218c0 4.039 2.467 5.76 6.476 7.219 2.585.92 3.445 1.574 3.445 2.583 0 .98-.84 1.545-2.354 1.545-1.875 0-4.965-.921-6.99-2.109l-.9 5.555C5.175 22.99 8.385 24 11.714 24c2.641 0 4.843-.624 6.328-1.813 1.664-1.305 2.525-3.236 2.525-5.732 0-4.128-2.524-5.851-6.591-7.305z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">Stripe</h3>
                    <p className="text-sm text-gray-500">Pagos con tarjeta de crédito/débito</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig?.stripeEnabled || false}
                      onChange={async (e) => {
                        if (!paymentConfig) return;
                        setSavingPaymentConfig(true);
                        const success = await updatePaymentConfig({ stripeEnabled: e.target.checked }, user?.email || '');
                        if (success) {
                          setPaymentConfig({ ...paymentConfig, stripeEnabled: e.target.checked });
                          toastSuccess('Stripe ' + (e.target.checked ? 'activat' : 'dezactivat'));
                        }
                        setSavingPaymentConfig(false);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#635bff]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#635bff]"></div>
                  </label>
                  <a 
                    href="https://dashboard.stripe.com/apikeys" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#635bff] hover:underline flex items-center gap-1"
                  >
                    Dashboard <ExternalLink size={14} />
                  </a>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Secret Key (sk_live_... sau sk_test_...)
                    </label>
                    <input
                      type="password"
                      placeholder="sk_live_xxxxxxxxxxxxx"
                      value={paymentConfig?.stripeSecretKey || ''}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, stripeSecretKey: e.target.value } : prev)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#635bff] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Publishable Key (pk_live_... sau pk_test_...)
                    </label>
                    <input
                      type="text"
                      placeholder="pk_live_xxxxxxxxxxxxx"
                      value={paymentConfig?.stripePublishableKey || ''}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, stripePublishableKey: e.target.value } : prev)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#635bff] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Webhook Secret (whsec_...)
                    </label>
                    <input
                      type="password"
                      placeholder="whsec_xxxxxxxxxxxxx"
                      value={paymentConfig?.stripeWebhookSecret || ''}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, stripeWebhookSecret: e.target.value } : prev)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#635bff] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">URL webhook: {typeof window !== 'undefined' ? window.location.origin : ''}/api/webhook/stripe</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={paymentConfig?.stripeMode || 'test'}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, stripeMode: e.target.value as 'test' | 'live' } : prev)}
                      className="px-4 py-2 border border-gray-200 rounded-xl"
                    >
                      <option value="test">🧪 Mod Test</option>
                      <option value="live">🚀 Producție</option>
                    </select>
                    
                    <button
                      onClick={async () => {
                        if (!paymentConfig) return;
                        setSavingPaymentConfig(true);
                        const success = await updatePaymentConfig({
                          stripeSecretKey: paymentConfig.stripeSecretKey,
                          stripePublishableKey: paymentConfig.stripePublishableKey,
                          stripeWebhookSecret: paymentConfig.stripeWebhookSecret,
                          stripeMode: paymentConfig.stripeMode,
                        }, user?.email || '');
                        if (success) {
                          toastSuccess('Configurație Stripe salvată!');
                        } else {
                          toastError('Eroare la salvare');
                        }
                        setSavingPaymentConfig(false);
                      }}
                      disabled={savingPaymentConfig}
                      className="px-6 py-2 bg-[#635bff] text-white rounded-xl hover:bg-[#5851ea] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingPaymentConfig ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Salvează Stripe
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${paymentConfig?.stripeEnabled && paymentConfig?.stripeSecretKey ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-600">
                        {paymentConfig?.stripeEnabled && paymentConfig?.stripeSecretKey ? 'Stripe activ' : 'Stripe inactiv'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      paymentConfig?.stripeMode === 'live' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {paymentConfig?.stripeMode === 'live' ? 'Producție' : 'Test'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Configuración de PayPal */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-[#0070ba]/10 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#0070ba">
                      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900">PayPal</h3>
                    <p className="text-sm text-gray-500">Pagos con cuenta PayPal</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentConfig?.paypalEnabled || false}
                      onChange={async (e) => {
                        if (!paymentConfig) return;
                        setSavingPaymentConfig(true);
                        const success = await updatePaymentConfig({ paypalEnabled: e.target.checked }, user?.email || '');
                        if (success) {
                          setPaymentConfig({ ...paymentConfig, paypalEnabled: e.target.checked });
                          toastSuccess('PayPal ' + (e.target.checked ? 'activat' : 'dezactivat'));
                        }
                        setSavingPaymentConfig(false);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0070ba]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0070ba]"></div>
                  </label>
                  <a 
                    href="https://developer.paypal.com/dashboard/applications" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#0070ba] hover:underline flex items-center gap-1"
                  >
                    Dashboard <ExternalLink size={14} />
                  </a>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      placeholder="AxxxxxxxxxxxxxxxxxxxxxxxxN"
                      value={paymentConfig?.paypalClientId || ''}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, paypalClientId: e.target.value } : prev)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070ba] focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      placeholder="ExxxxxxxxxxxxxxxxxxxxxxxxN"
                      value={paymentConfig?.paypalClientSecret || ''}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, paypalClientSecret: e.target.value } : prev)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0070ba] focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center gap-4">
                    <select
                      value={paymentConfig?.paypalMode || 'sandbox'}
                      onChange={(e) => setPaymentConfig(prev => prev ? { ...prev, paypalMode: e.target.value as 'sandbox' | 'live' } : prev)}
                      className="px-4 py-2 border border-gray-200 rounded-xl"
                    >
                      <option value="sandbox">🧪 Sandbox</option>
                      <option value="live">🚀 Producție</option>
                    </select>
                    
                    <button
                      onClick={async () => {
                        if (!paymentConfig) return;
                        setSavingPaymentConfig(true);
                        const success = await updatePaymentConfig({
                          paypalClientId: paymentConfig.paypalClientId,
                          paypalClientSecret: paymentConfig.paypalClientSecret,
                          paypalMode: paymentConfig.paypalMode,
                        }, user?.email || '');
                        if (success) {
                          toastSuccess('Configurație PayPal salvată!');
                        } else {
                          toastError('Eroare la salvare');
                        }
                        setSavingPaymentConfig(false);
                      }}
                      disabled={savingPaymentConfig}
                      className="px-6 py-2 bg-[#0070ba] text-white rounded-xl hover:bg-[#005ea6] transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {savingPaymentConfig ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                      Salvează PayPal
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${paymentConfig?.paypalEnabled && paymentConfig?.paypalClientId ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="text-sm text-gray-600">
                        {paymentConfig?.paypalEnabled && paymentConfig?.paypalClientId ? 'PayPal activ' : 'PayPal inactiv'}
                      </span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      paymentConfig?.paypalMode === 'live' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {paymentConfig?.paypalMode === 'live' ? 'Producție' : 'Sandbox'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Códigos promocionales */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                      <Gift size={24} className="text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">Coduri Promoționale</h3>
                      <p className="text-sm text-gray-500">Gestionează coduri de reducere</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddPromoCode(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <Sparkles size={16} />
                    Adaugă Cod
                  </button>
                </div>
                
                <div className="space-y-3">
                  {(paymentConfig?.promoCodes || []).map((promo) => (
                    <div key={promo.code} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <p className="font-mono font-bold text-gray-900">{promo.code}</p>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            promo.type === 'fixed' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {promo.type === 'fixed' ? `+${promo.bonus}€` : `${promo.bonus}%`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          Folosit: {promo.usageCount} ori
                          {promo.usageLimit ? ` / ${promo.usageLimit} max` : ''}
                          {promo.expiresAt && ` • Expiră: ${new Date(promo.expiresAt).toLocaleDateString('ro-RO')}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={async () => {
                            const success = await togglePromoCode(promo.code, !promo.active, user?.email || '');
                            if (success) {
                              loadData(true);
                              toastSuccess(`Cod ${promo.active ? 'dezactivat' : 'activat'}`);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            promo.active 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {promo.active ? 'Activ' : 'Inactiv'}
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm(`Ștergi codul ${promo.code}?`)) {
                              const success = await deletePromoCode(promo.code, user?.email || '');
                              if (success) {
                                loadData(true);
                                toastSuccess('Cod șters');
                              }
                            }
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {(!paymentConfig?.promoCodes || paymentConfig.promoCodes.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <Gift size={40} className="mx-auto mb-2 opacity-30" />
                      <p>Nu există coduri promoționale</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal para añadir código promocional */}
              {showAddPromoCode && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowAddPromoCode(false)}>
                  <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Adaugă Cod Promoțional</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cod</label>
                        <input
                          type="text"
                          placeholder="CODPROMO"
                          value={newPromoCode.code}
                          onChange={(e) => setNewPromoCode({ ...newPromoCode, code: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tip</label>
                          <select
                            value={newPromoCode.type}
                            onChange={(e) => setNewPromoCode({ ...newPromoCode, type: e.target.value as 'fixed' | 'percentage' })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                          >
                            <option value="fixed">Sumă fixă (€)</option>
                            <option value="percentage">Procent (%)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Valoare</label>
                          <input
                            type="number"
                            min="1"
                            value={newPromoCode.bonus}
                            onChange={(e) => setNewPromoCode({ ...newPromoCode, bonus: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Limită utilizări (0 = nelimitat)</label>
                          <input
                            type="number"
                            min="0"
                            value={newPromoCode.usageLimit}
                            onChange={(e) => setNewPromoCode({ ...newPromoCode, usageLimit: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Data expirare (opțional)</label>
                          <input
                            type="date"
                            value={newPromoCode.expiresAt}
                            onChange={(e) => setNewPromoCode({ ...newPromoCode, expiresAt: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => setShowAddPromoCode(false)}
                        className="flex-1 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        Anulează
                      </button>
                      <button
                        onClick={async () => {
                          if (!newPromoCode.code) {
                            toastError('Introdu un cod');
                            return;
                          }
                          const success = await addPromoCode({
                            code: newPromoCode.code,
                            bonus: newPromoCode.bonus,
                            type: newPromoCode.type,
                            active: true,
                            usageLimit: newPromoCode.usageLimit || undefined,
                            expiresAt: newPromoCode.expiresAt || undefined,
                          }, user?.email || '');
                          if (success) {
                            toastSuccess('Cod adăugat!');
                            setShowAddPromoCode(false);
                            setNewPromoCode({ code: '', bonus: 10, type: 'fixed', active: true, expiresAt: '', usageLimit: 0 });
                            loadData(true);
                          } else {
                            toastError('Eroare la adăugare');
                          }
                        }}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors"
                      >
                        Adaugă Cod
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Panel de Publicidad - Simple AdSense */}
          {activeTab === 'publicidad' && (
            <PublicidadSimplePanel />
          )}

          {/* Estadísticas en Tiempo Real */}
          {activeTab === 'estadisticas' && (
            <div className="space-y-6">
              {/* Header con período y refresh */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Estadísticas en Tiempo Real</h3>
                  <p className="text-sm text-gray-500">Análisis detallado del tráfico y comportamiento de usuarios</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={analyticsPeriodo}
                    onChange={(e) => {
                      setAnalyticsPeriodo(Number(e.target.value) as 7 | 30 | 90);
                      loadData(true);
                    }}
                    className="px-4 py-2 border border-gray-200 rounded-xl bg-white"
                  >
                    <option value={7}>Últimos 7 días</option>
                    <option value={30}>Últimos 30 días</option>
                    <option value={90}>Últimos 90 días</option>
                  </select>
                  <button
                    onClick={() => loadData(true)}
                    disabled={loadingAnalytics}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    <RefreshCw size={16} className={loadingAnalytics ? 'animate-spin' : ''} />
                    Actualizar
                  </button>
                </div>
              </div>

              {loadingAnalytics && !analyticsStats ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
              ) : (
                <>
                  {/* Tarjetas principales */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Visitantes Activos */}
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-green-100 text-sm">Activos Ahora</p>
                          <p className="text-4xl font-bold mt-1">{analyticsStats?.visitantesActivos || 0}</p>
                          <p className="text-green-200 text-xs mt-2">Últimos 5 minutos</p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                          <Activity className="w-6 h-6" />
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/20 flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
                        <span className="text-sm text-green-100">En tiempo real</span>
                      </div>
                    </div>

                    {/* Visitas Hoy */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Visitas Hoy</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{(analyticsStats?.visitasHoy || 0).toLocaleString()}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Eye className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">
                          Semana: <span className="font-medium text-gray-900">{(analyticsStats?.visitasSemana || 0).toLocaleString()}</span>
                        </div>
                        <div className="text-gray-500">
                          Mes: <span className="font-medium text-gray-900">{(analyticsStats?.visitasMes || 0).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Registros */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Registros Hoy</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsStats?.registrosHoy || 0}</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <UserCheck className="w-6 h-6 text-purple-600" />
                        </div>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-500">
                          Semana: <span className="font-medium text-gray-900">{analyticsStats?.registrosSemana || 0}</span>
                        </div>
                        <div className="text-gray-500">
                          Mes: <span className="font-medium text-gray-900">{analyticsStats?.registrosMes || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actividad de Hoy */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-gray-500 text-sm">Actividad Hoy</p>
                          <p className="text-3xl font-bold text-gray-900 mt-1">{analyticsStats?.anunciosPublicadosHoy || 0}</p>
                          <p className="text-xs text-gray-400 mt-1">anuncios publicados</p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-500">
                        Mensajes: <span className="font-medium text-gray-900">{analyticsStats?.mensajesHoy || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Resumen General */}
                  {analyticsResumen && (
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white">
                      <h4 className="font-bold text-lg mb-4">Resumen General de la Plataforma</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Usuarios Totales</p>
                          <p className="text-2xl font-bold">{analyticsResumen.totalUsuarios.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Anuncios Totales</p>
                          <p className="text-2xl font-bold">{analyticsResumen.totalAnuncios.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Mensajes Totales</p>
                          <p className="text-2xl font-bold">{analyticsResumen.totalMensajes.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Visitas (30d)</p>
                          <p className="text-2xl font-bold">{analyticsResumen.totalVisitas.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Prom. Diario</p>
                          <p className="text-2xl font-bold">{analyticsResumen.promedioVisitasDiarias.toLocaleString()}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Conversión</p>
                          <p className="text-2xl font-bold">{analyticsResumen.tasaConversion}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-indigo-200 text-xs">Sesión Prom.</p>
                          <p className="text-2xl font-bold">{analyticsResumen.tiempoPromedioSesion}m</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Grid de estadísticas detalladas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico de horas pico */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock size={18} />
                        Horas Pico (Hoy)
                      </h4>
                      <div className="space-y-2">
                        {(analyticsStats?.horasPico || []).length > 0 ? (
                          <div className="flex items-end gap-1 h-40">
                            {Array.from({ length: 24 }, (_, i) => {
                              const horaData = analyticsStats?.horasPico.find(h => h.hora === i);
                              const visitas = horaData?.visitas || 0;
                              const maxVisitas = Math.max(...(analyticsStats?.horasPico.map(h => h.visitas) || [1]));
                              const altura = maxVisitas > 0 ? (visitas / maxVisitas) * 100 : 0;
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                  <div 
                                    className={`w-full rounded-t transition-all ${visitas > 0 ? 'bg-blue-500' : 'bg-gray-200'}`}
                                    style={{ height: `${Math.max(altura, 4)}%` }}
                                    title={`${i}:00 - ${visitas} visitas`}
                                  />
                                  {i % 4 === 0 && (
                                    <span className="text-xs text-gray-400 mt-1">{i}h</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-10">Sin datos de hoy</p>
                        )}
                      </div>
                    </div>

                    {/* Páginas más visitadas */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp size={18} />
                        Páginas Más Visitadas (Hoy)
                      </h4>
                      <div className="space-y-3">
                        {(analyticsStats?.paginasMasVisitadas || []).length > 0 ? (
                          analyticsStats?.paginasMasVisitadas.slice(0, 8).map((pagina, i) => {
                            const maxVisitas = analyticsStats?.paginasMasVisitadas[0]?.visitas || 1;
                            const porcentaje = (pagina.visitas / maxVisitas) * 100;
                            return (
                              <div key={i} className="relative">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-gray-700 truncate flex-1">
                                    {pagina.pagina === '_' ? '/' : pagina.pagina}
                                  </span>
                                  <span className="text-sm font-bold text-gray-900 ml-2">{pagina.visitas}</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
                                    style={{ width: `${porcentaje}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-center py-10">Sin datos de hoy</p>
                        )}
                      </div>
                    </div>

                    {/* Dispositivos */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Monitor size={18} />
                        Dispositivos (Hoy)
                      </h4>
                      <div className="space-y-4">
                        {(analyticsStats?.dispositivosHoy || []).length > 0 ? (
                          analyticsStats?.dispositivosHoy.map((dispositivo, i) => {
                            const total = analyticsStats?.dispositivosHoy.reduce((sum, d) => sum + d.cantidad, 0) || 1;
                            const porcentaje = Math.round((dispositivo.cantidad / total) * 100);
                            const Icon = dispositivo.tipo === 'mobile' ? Smartphone : 
                                         dispositivo.tipo === 'tablet' ? Tablet : Monitor;
                            const color = dispositivo.tipo === 'mobile' ? 'bg-green-500' : 
                                         dispositivo.tipo === 'tablet' ? 'bg-purple-500' : 'bg-blue-500';
                            return (
                              <div key={i} className="flex items-center gap-4">
                                <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
                                  <Icon className="w-5 h-5 text-white" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="font-medium text-gray-900 capitalize">{dispositivo.tipo}</span>
                                    <span className="text-sm text-gray-500">{porcentaje}%</span>
                                  </div>
                                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full ${color} rounded-full`} style={{ width: `${porcentaje}%` }} />
                                  </div>
                                </div>
                                <span className="font-bold text-gray-900">{dispositivo.cantidad}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-center py-10">Sin datos de hoy</p>
                        )}
                      </div>
                    </div>

                    {/* Navegadores */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Globe size={18} />
                        Navegadores (Hoy)
                      </h4>
                      <div className="space-y-3">
                        {(analyticsStats?.navegadoresHoy || []).length > 0 ? (
                          analyticsStats?.navegadoresHoy.slice(0, 5).map((navegador, i) => {
                            const total = analyticsStats?.navegadoresHoy.reduce((sum, n) => sum + n.cantidad, 0) || 1;
                            const porcentaje = Math.round((navegador.cantidad / total) * 100);
                            const colors = ['bg-yellow-500', 'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-purple-500'];
                            return (
                              <div key={i} className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]}`} />
                                <span className="flex-1 text-gray-700">{navegador.navegador}</span>
                                <span className="text-sm text-gray-500">{porcentaje}%</span>
                                <span className="font-bold text-gray-900 w-12 text-right">{navegador.cantidad}</span>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-400 text-center py-10">Sin datos de hoy</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Historial de visitas */}
                  {analyticsHistorial.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <BarChart3 size={18} />
                        Historial de Visitas ({analyticsPeriodo} días)
                      </h4>
                      <div className="h-48 flex items-end gap-1">
                        {analyticsHistorial.map((dia, i) => {
                          const maxVisitas = Math.max(...analyticsHistorial.map(d => d.visitas)) || 1;
                          const altura = (dia.visitas / maxVisitas) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center group relative">
                              <div className="absolute bottom-full mb-2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {dia.fecha}: {dia.visitas} visitas, {dia.registros} registros
                              </div>
                              <div 
                                className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:from-blue-700 hover:to-blue-500"
                                style={{ height: `${Math.max(altura, 2)}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>{analyticsHistorial[0]?.fecha}</span>
                        <span>{analyticsHistorial[analyticsHistorial.length - 1]?.fecha}</span>
                      </div>
                    </div>
                  )}

                  {/* Usuarios recién registrados */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Users size={18} />
                      Usuarios Registrados Hoy
                    </h4>
                    {(analyticsStats?.usuariosNuevosRecientes || []).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Usuario</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Email</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Método</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hora</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">IP</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsStats?.usuariosNuevosRecientes.map((usuario, i) => (
                              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <span className="font-medium text-gray-900">{usuario.nombre || 'Sin nombre'}</span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{usuario.email}</td>
                                <td className="py-3 px-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    usuario.metodoRegistro === 'google' ? 'bg-red-100 text-red-700' :
                                    usuario.metodoRegistro === 'facebook' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {usuario.metodoRegistro}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {new Date(usuario.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-400 font-mono">{usuario.ip || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-10">No hay registros hoy</p>
                    )}
                  </div>

                  {/* Visitas recientes */}
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Activity size={18} />
                      Visitas Recientes
                    </h4>
                    {(analyticsStats?.visitasRecientes || []).length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Página</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Dispositivo</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Navegador</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">SO</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">IP</th>
                              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Hora</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analyticsStats?.visitasRecientes.slice(0, 15).map((visita, i) => (
                              <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                                <td className="py-3 px-4">
                                  <span className="font-medium text-gray-900 truncate max-w-[200px] block">{visita.pagina}</span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    visita.dispositivo === 'mobile' ? 'bg-green-100 text-green-700' :
                                    visita.dispositivo === 'tablet' ? 'bg-purple-100 text-purple-700' :
                                    'bg-blue-100 text-blue-700'
                                  }`}>
                                    {visita.dispositivo}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-gray-600">{visita.navegador}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">{visita.sistemaOperativo}</td>
                                <td className="py-3 px-4 text-sm text-gray-400 font-mono">{visita.ip}</td>
                                <td className="py-3 px-4 text-sm text-gray-600">
                                  {new Date(visita.fecha).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-400 text-center py-10">No hay visitas recientes</p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modal para acciones */}
      {modalType && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {modalType === 'suspender' && 'Suspender Usuario'}
              {modalType === 'rechazar' && 'Rechazar Anuncio'}
              {modalType === 'reporte' && 'Resolver Reporte'}
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {modalType === 'reporte' ? 'Notas (opcional)' : 'Motivo'}
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder={modalType === 'reporte' ? 'Notas sobre la resolución...' : 'Escribe el motivo...'}
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setModalType(null);
                  setSelectedItem(null);
                  setActionReason('');
                }}
                className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (modalType === 'suspender') handleSuspenderUsuario(selectedItem.id);
                  if (modalType === 'rechazar') handleRechazarAnuncio(selectedItem.id);
                }}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Usuario */}
      {showUserDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del modal */}
            <div className="p-6 border-b border-gray-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {userDetails?.usuario?.nombre?.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {loadingUserDetails ? 'Cargando...' : userDetails?.usuario?.nombre || 'Usuario'}
                  </h2>
                  <p className="text-gray-500">{userDetails?.usuario?.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {userDetails?.usuario?.verificado && (
                      <span className="px-2 py-0.5 bg-green-100 text-green-600 text-xs rounded-full flex items-center gap-1">
                        <CheckCircle size={10} /> Verificado
                      </span>
                    )}
                    {userDetails?.usuario?.suspendido && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">Suspendido</span>
                    )}
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                      {userDetails?.diasComoUsuario || 0} días como usuario
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserDetails(false);
                  setUserDetails(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 px-6">
              <nav className="flex gap-6">
                {[
                  { id: 'resumen', label: 'Resumen', icon: BarChart3 },
                  { id: 'anuncios', label: 'Anuncios', icon: FileText },
                  { id: 'promociones', label: 'Promociones', icon: Sparkles },
                  { id: 'historial', label: 'Historial', icon: Receipt },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setUserDetailsTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 border-b-2 transition-colors ${
                      userDetailsTab === tab.id
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              {loadingUserDetails ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : userDetails ? (
                <>
                  {/* Tab Resumen */}
                  {userDetailsTab === 'resumen' && (
                    <div className="space-y-6">
                      {/* Stats rápidos */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4">
                          <p className="text-blue-600 text-sm">Total Anuncios</p>
                          <p className="text-2xl font-bold text-blue-700">{userDetails.totalAnuncios}</p>
                          <p className="text-xs text-blue-500">{userDetails.anunciosActivos} activos</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-4">
                          <p className="text-green-600 text-sm">Anuncios Restantes</p>
                          <p className="text-2xl font-bold text-green-700">{userDetails.anunciosRestantes}</p>
                          <p className="text-xs text-green-500">del plan actual</p>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4">
                          <p className="text-purple-600 text-sm">Promociones Activas</p>
                          <p className="text-2xl font-bold text-purple-700">{userDetails.promocionesActivas.length}</p>
                          <p className="text-xs text-purple-500">{userDetails.totalPromocionesCompradas} totales</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-4">
                          <p className="text-amber-600 text-sm">Total Invertido</p>
                          <p className="text-2xl font-bold text-amber-700">{userDetails.totalGastado.toLocaleString()}€</p>
                          <p className="text-xs text-amber-500">{userDetails.facturas.length} facturas</p>
                        </div>
                      </div>

                      {/* Plan Actual */}
                      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Package size={18} />
                            Plan Actual
                          </h3>
                        </div>
                        {userDetails.planActivo ? (
                          <div className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="text-lg font-bold text-gray-900">{userDetails.planActivo.tipo}</p>
                                <p className="text-sm text-gray-500">
                                  Comprado el {userDetails.planActivo.fechaCompra.toLocaleDateString()}
                                </p>
                              </div>
                              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                                userDetails.planActivo.estado === 'activo' ? 'bg-green-100 text-green-600' :
                                userDetails.planActivo.estado === 'agotado' ? 'bg-amber-100 text-amber-600' :
                                'bg-red-100 text-red-600'
                              }`}>
                                {userDetails.planActivo.estado}
                              </span>
                            </div>
                            
                            {/* Barra de progreso de anuncios */}
                            <div className="mb-4">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Anuncios utilizados</span>
                                <span className="font-medium">
                                  {userDetails.planActivo.anunciosUsados} / {userDetails.planActivo.totalAnuncios}
                                </span>
                              </div>
                              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-500 rounded-full transition-all"
                                  style={{ width: `${userDetails.planActivo.porcentajeUso}%` }}
                                />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {userDetails.planActivo.anunciosDisponibles} anuncios disponibles
                              </p>
                            </div>

                            {/* Info de tiempo */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                              <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                  <p className="text-2xl font-bold text-gray-900">{userDetails.planActivo.diasRestantes}</p>
                                  <p className="text-xs text-gray-500">días restantes</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {userDetails.planActivo.fechaExpiracion.toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-gray-500">fecha expiración</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{userDetails.planActivo.precio}€</p>
                                  <p className="text-xs text-gray-500">precio pagado</p>
                                </div>
                              </div>
                            </div>

                            {/* Acciones del admin */}
                            <div className="border-t border-gray-100 pt-4 space-y-4">
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  value={diasExtender}
                                  onChange={(e) => setDiasExtender(Number(e.target.value))}
                                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                  min={1}
                                />
                                <button
                                  onClick={() => handleExtenderPlan(userDetails.planActivo!.id)}
                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                                >
                                  <Calendar size={16} />
                                  Extender días
                                </button>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  value={anunciosAgregar}
                                  onChange={(e) => setAnunciosAgregar(Number(e.target.value))}
                                  className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                  min={1}
                                />
                                <button
                                  onClick={() => handleAgregarAnuncios(userDetails.planActivo!.id)}
                                  className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2"
                                >
                                  <Gift size={16} />
                                  Agregar anuncios
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <Package size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Este usuario no tiene un plan activo</p>
                          </div>
                        )}
                      </div>

                      {/* Promociones Activas */}
                      {userDetails.promocionesActivas.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                          <div className="p-4 bg-purple-50 border-b border-gray-200">
                            <h3 className="font-semibold text-purple-900 flex items-center gap-2">
                              <Sparkles size={18} />
                              Anuncios con Promoción Activa ({userDetails.promocionesActivas.length})
                            </h3>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {userDetails.promocionesActivas.map((promo) => (
                              <div key={promo.id} className="p-4 flex items-center gap-4">
                                <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden relative flex-shrink-0">
                                  {promo.imagen && (
                                    <Image src={promo.imagen} alt="" fill className="object-cover" />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">{promo.titulo}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                      promo.tipoPromocion.toLowerCase().includes('vip') ? 'bg-amber-100 text-amber-600' :
                                      promo.tipoPromocion.toLowerCase().includes('premium') ? 'bg-purple-100 text-purple-600' :
                                      'bg-blue-100 text-blue-600'
                                    }`}>
                                      {promo.tipoPromocion}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {promo.diasRestantes} días restantes
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-gray-900">{promo.precio.toLocaleString()}€</p>
                                  <p className="text-xs text-gray-500">Expira: {promo.fechaExpiracion.toLocaleDateString()}</p>
                                </div>
                                <button
                                  onClick={() => window.open(`/ad/${promo.id}`, '_blank')}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                >
                                  <ExternalLink size={18} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Planes Históricos */}
                      {userDetails.planesHistoricos.length > 1 && (
                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                          <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Clock size={18} />
                              Historial de Planes ({userDetails.planesHistoricos.length})
                            </h3>
                          </div>
                          <div className="divide-y divide-gray-100">
                            {userDetails.planesHistoricos.map((plan) => (
                              <div key={plan.id} className="p-4 flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{plan.tipo}</p>
                                  <p className="text-sm text-gray-500">
                                    {plan.fechaCompra.toLocaleDateString()} - {plan.fechaExpiracion.toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    plan.estado === 'activo' ? 'bg-green-100 text-green-600' :
                                    plan.estado === 'agotado' ? 'bg-amber-100 text-amber-600' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {plan.estado}
                                  </span>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {plan.anunciosUsados}/{plan.totalAnuncios} usados • {plan.precio}€
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Anuncios */}
                  {userDetailsTab === 'anuncios' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-600">
                          {userDetails.anunciosPublicados.length} anuncios publicados
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {userDetails.anunciosPublicados.map((anuncio) => (
                          <div key={anuncio.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
                            <div className="w-24 h-24 bg-gray-200 relative flex-shrink-0">
                              {anuncio.imagenes?.[0] && (
                                <Image src={anuncio.imagenes[0]} alt="" fill className="object-cover" />
                              )}
                            </div>
                            <div className="p-3 flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{anuncio.titulo}</p>
                              <p className="text-blue-600 font-bold">{anuncio.precio?.toLocaleString()}€</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  anuncio.estado === 'Activo' ? 'bg-green-100 text-green-600' :
                                  anuncio.estado === 'Pausado' ? 'bg-gray-100 text-gray-600' :
                                  anuncio.estado === 'En revisión' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-red-100 text-red-600'
                                }`}>
                                  {anuncio.estado}
                                </span>
                                {anuncio.destacado && (
                                  <Star size={12} className="text-amber-500" fill="currentColor" />
                                )}
                                {anuncio.planPromocion && (
                                  <Sparkles size={12} className="text-purple-500" />
                                )}
                              </div>
                            </div>
                            <button
                              onClick={() => window.open(`/ad/${anuncio.id}`, '_blank')}
                              className="p-2 text-gray-400 hover:text-blue-600 self-center mr-2"
                            >
                              <ExternalLink size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                      {userDetails.anunciosPublicados.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                          <FileText size={32} className="mx-auto mb-2 opacity-50" />
                          <p>Este usuario no ha publicado anuncios</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Tab Promociones */}
                  {userDetailsTab === 'promociones' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-600">
                          {userDetails.promocionesHistoricas.length} promociones compradas
                        </p>
                      </div>
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tipo</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Anuncio</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Precio</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Fecha</th>
                              <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Estado</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {userDetails.promocionesHistoricas.map((promo) => (
                              <tr key={promo.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                    promo.tipo === 'VIP' ? 'bg-amber-100 text-amber-600' :
                                    promo.tipo === 'Premium' ? 'bg-purple-100 text-purple-600' :
                                    'bg-blue-100 text-blue-600'
                                  }`}>
                                    {promo.tipo}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate">
                                  {promo.anuncioTitulo}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-green-600">
                                  {promo.precio}€
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-500">
                                  {promo.fechaCompra.toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    promo.estado === 'activa' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {promo.estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {userDetails.promocionesHistoricas.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Sparkles size={32} className="mx-auto mb-2 opacity-50" />
                            <p>Este usuario no ha comprado promociones</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tab Historial */}
                  {userDetailsTab === 'historial' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-gray-600">
                          {userDetails.historialCompras.length} compras • Total: {userDetails.totalGastado.toLocaleString()}€
                        </p>
                      </div>
                      <div className="space-y-3">
                        {userDetails.historialCompras.map((compra) => (
                          <div key={compra.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                              compra.tipo === 'plan' ? 'bg-blue-100' :
                              compra.tipo === 'promocion' ? 'bg-purple-100' :
                              'bg-emerald-100'
                            }`}>
                              {compra.tipo === 'plan' ? <Package className="text-blue-600" size={20} /> :
                               compra.tipo === 'promocion' ? <Sparkles className="text-purple-600" size={20} /> :
                               <Gift className="text-emerald-600" size={20} />}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{compra.concepto}</p>
                              <p className="text-sm text-gray-500">{compra.fecha.toLocaleDateString()}</p>
                            </div>
                            <span className="font-bold text-green-600">{compra.precio.toLocaleString()}€</span>
                          </div>
                        ))}
                        {userDetails.historialCompras.length === 0 && (
                          <div className="text-center py-12 text-gray-500">
                            <Receipt size={32} className="mx-auto mb-2 opacity-50" />
                            <p>No hay historial de compras</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  No se pudieron cargar los detalles del usuario
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loadingData && (
        <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Cargando...</span>
        </div>
      )}

      {/* Toast Container */}
      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  );
}
