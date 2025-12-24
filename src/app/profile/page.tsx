"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Star,
  List,
  ShoppingCart,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Edit3,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  TrendingUp,
  Rocket,
  Zap,
  CheckCircle,
  XCircle,
  BarChart3,
  Clock,
  Eye,
  Heart,
  Crown,
  Sparkles,
  Plus,
  LayoutGrid,
  LayoutList,
  Trash2,
  Grid3x3,
  Search,
  Filter,
  Package,
  Wallet,
  CreditCard,
  Gift,
  BadgeCheck,
  Shield,
  Lock,
  ArrowUpRight,
  ChevronRight,
  Gem,
  Target,
  Flame,
  MessageCircle,
  Send,
  Camera,
  X,
  Euro,
  Tag,
  FileText,
  Upload,
  Home,
  Car,
  Briefcase,
  Wrench,
  Smartphone,
  Shirt,
  PawPrint,
  TreeDeciduous,
  Dumbbell,
  Baby,
  Plane,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Menu,
  ChevronLeft,
  Building2,
  Globe,
  FileCheck,
  CircleDollarSign,
  Receipt,
  Download,
  ExternalLink,
  FileDown,
  CalendarDays,
  Info,
  Headphones,
} from "lucide-react";
import { getAnunciosByUsuario, getAnuncioById, createAnuncio, updateAnuncio } from "@/lib/anuncios.service";
import { Categoria, CondicionProducto, EstadoAnuncio, Factura } from "@/types";
import Image from "next/image";
import { toggleFavorito as toggleFavoritoLocal, toggleFavoritoRemoteWithNotification, syncLocalToRemote } from '@/lib/favoritos.service';
import AnuncioCard from '@/components/AnuncioCard';
import StripePaymentModal from '@/components/StripePaymentModal';
import VerificationModal from '@/components/VerificationModal';
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { getPlanesUsuario, crearPlan, actualizarPlan, eliminarPlan, calcularDiasRestantes, type Plan } from "@/lib/planes.service";
import { getConversacionesByUsuario, getMensajesByConversacion, enviarMensaje, marcarMensajesComoLeidos } from "@/lib/mensajes.service";
import { getUsuario } from "@/lib/auth.service";
import { crearFactura, getFacturasUsuario, descargarFacturaPDF, previsualizarFactura } from "@/lib/facturas.service";
import { getMensajesUsuario, eliminarMensajeContacto, type MensajeContacto } from "@/lib/contacto.service";
import {  
  getBonificacionesUsuario, 
  marcarBonificacionLeida, 
  usarBonificacion,
  getCreditosUsuario,
  puedeReclamarCreditos,
  reclamarCreditosDiarios,
  getConfiguracionCreditos,
  calcularPuntosPorAnuncios,
  calcularAnunciosConPuntos,
  comprarAnunciosConPuntos,
  type Bonificacion,
  type CreditoUsuario,
  type ConfiguracionCreditos
} from "@/lib/bonificaciones.service";
import { Conversacion, Mensaje } from "@/types";
import ProfileSkeleton from '@/components/ProfileSkeleton';
import { useToast, ToastContainer } from '@/components/Toast';

// Sidebar navigation link component
function SidebarLink({ icon, label, active = false, href = "#", onClick, badge }: { icon: React.ReactNode; label: string; active?: boolean; href?: string; onClick?: () => void; badge?: number }) {
  const isExternalNavigation = href && href !== "#";
  
  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      // Si es navegación interna (href="#"), prevenimos el default
      if (!isExternalNavigation) {
        e.preventDefault();
      }
      onClick();
    }
  };
  
  // Si es navegación externa, usamos Link de Next.js
  if (isExternalNavigation) {
    return (
      <Link
        href={href}
        onClick={handleClick}
        className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
          ${active 
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200" 
            : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
        `}
      >
        <span className={`${active ? "text-white" : "text-gray-400 group-hover:text-blue-600"}`}>
          {icon}
        </span>
        <span className="flex-1">{label}</span>
        {badge && badge > 0 && (
          <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs font-bold rounded-full px-1.5 ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </Link>
    );
  }
  
  return (
    <a
      href={href}
      onClick={handleClick}
      className={`group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
        ${active 
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200" 
          : "text-gray-600 hover:bg-gray-50 hover:text-blue-600"}
      `}
    >
      <span className={`${active ? "text-white" : "text-gray-400 group-hover:text-blue-600"}`}>
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {badge && badge > 0 && (
        <span className={`min-w-[20px] h-5 flex items-center justify-center text-xs font-bold rounded-full px-1.5 ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}`}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </a>
  );
}

// Profile field display component with edit capability
function ProfileField({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors">
      <div className="flex items-center gap-2 text-gray-500 text-xs font-medium mb-2">
        {icon && <span className="text-gray-400">{icon}</span>}
        {label}
      </div>
      <div className="font-semibold text-gray-900 text-base">{value}</div>
    </div>
  );
}

// Stats card component
function StatsCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}

export default function ProfilePage() {
  console.log('🔥 ProfilePage LOADED');
  const { user, usuario, signOut, loading: authLoading } = useAuth();
  console.log('🔥 User state:', user?.uid, 'authLoading:', authLoading);
  const { t } = useLanguage();
  const { toast, hideToast, success: toastSuccess, error: toastError, warning: toastWarning, info: toastInfo, points: toastPoints, gift: toastGift } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'perfil' | 'promociones' | 'mis-anuncios' | 'favoritos' | 'mensajes' | 'soporte' | 'facturas' | 'bonificaciones'>('perfil');
  const [initialLoading, setInitialLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Función helper para cambiar de tab y hacer scroll to top
  const handleTabChange = (tab: 'perfil' | 'promociones' | 'mis-anuncios' | 'favoritos' | 'mensajes' | 'soporte' | 'facturas' | 'bonificaciones') => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Leer tab de la URL o localStorage al cargar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabFromUrl = params.get('tab');
      const tabFromStorage = localStorage.getItem('profileActiveTab');
      
      if (tabFromUrl === 'mis-anuncios' || tabFromUrl === 'favoritos' || tabFromUrl === 'promociones' || tabFromUrl === 'perfil' || tabFromUrl === 'mensajes' || tabFromUrl === 'facturas' || tabFromUrl === 'bonificaciones') {
        setActiveTab(tabFromUrl);
        localStorage.setItem('profileActiveTab', tabFromUrl);
      } else if (tabFromStorage === 'mis-anuncios' || tabFromStorage === 'favoritos' || tabFromStorage === 'promociones' || tabFromStorage === 'perfil' || tabFromStorage === 'mensajes' || tabFromStorage === 'facturas') {
        setActiveTab(tabFromStorage);
      }
    }
  }, []);
  
  // Guardar tab en localStorage y URL cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileActiveTab', activeTab);
      // Actualizar URL sin recargar
      const url = new URL(window.location.href);
      url.searchParams.set('tab', activeTab);
      window.history.replaceState({}, '', url.toString());
    }
  }, [activeTab]);
  const [showRecargarModal, setShowRecargarModal] = useState(false);
  const [selectedRechargeAmount, setSelectedRechargeAmount] = useState<{amount: number, bonus: number} | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardData, setCardData] = useState({ number: '', expiry: '', cvc: '', name: '' });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'direct' | 'credits'>('direct');
  
  // Nuevo sistema de promoción por anuncio individual
  const [showPromoverAnuncioModal, setShowPromoverAnuncioModal] = useState(false);
  const [anuncioParaPromover, setAnuncioParaPromover] = useState<any | null>(null);
  const [tipoPromocionSeleccionada, setTipoPromocionSeleccionada] = useState<'Destacado' | 'Premium' | 'VIP' | null>(null);
  const [duracionPromocion, setDuracionPromocion] = useState<7 | 14 | 30>(7);
  const [promocionDetalleModal, setPromocionDetalleModal] = useState<any | null>(null); // Modal detalle promoción
  const [showPromoPaymentModal, setShowPromoPaymentModal] = useState(false); // Modal pago con tarjeta para promociones
  const [showVerificationModal, setShowVerificationModal] = useState(false); // Modal verificación email/teléfono
  
  // Sistema de créditos - ahora vinculado al usuario
  const [creditos, setCreditos] = useState(0);
  
  // Cargar créditos del usuario actual desde localStorage (con key específica del usuario)
  useEffect(() => {
    if (user?.uid && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`userCreditos_${user.uid}`);
      setCreditos(saved ? parseFloat(saved) : 0);
    } else {
      setCreditos(0);
    }
  }, [user?.uid]);
  
  // Guardar créditos con key específica del usuario
  useEffect(() => {
    if (user?.uid && typeof window !== 'undefined' && creditos > 0) {
      localStorage.setItem(`userCreditos_${user.uid}`, creditos.toString());
    }
  }, [creditos, user?.uid]);
  const [misAnuncios, setMisAnuncios] = useState<any[]>([]);
  const [anuncioSeleccionado, setAnuncioSeleccionado] = useState<string>("");
  const [anunciosParaPromover, setAnunciosParaPromover] = useState<any[]>([]);
  const [planesActivos, setPlanesActivos] = useState<any[]>([]); // Planes comprados con anuncios disponibles
  const [planesCargados, setPlanesCargados] = useState(false); // Para evitar desactivar antes de cargar
  const [promocionesActivas, setPromocionesActivas] = useState<any[]>([]);
  
  // Estados para cantidad de anuncios seleccionados en cada plan
  const [cantidadPremium, setCantidadPremium] = useState(5);
  const [cantidadVIP, setCantidadVIP] = useState(5);
  
  // Estado para modo de vista en Mis Anuncios y Favoritos
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('profileViewMode');
      return (saved === 'grid' || saved === 'list') ? saved : 'grid';
    }
    return 'grid';
  });
  
  // Guardar viewMode cuando cambia
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('profileViewMode', viewMode);
    }
  }, [viewMode]);
  
  // Estados para la pestaña de Favoritos
  const [anunciosFavoritos, setAnunciosFavoritos] = useState<any[]>([]);
  const [loadingFavoritos, setLoadingFavoritos] = useState(false);
  const [searchFavoritos, setSearchFavoritos] = useState('');
  
  // Estados para la pestaña de Mensajes
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [loadingMensajes, setLoadingMensajes] = useState(false);
  const [searchMensajes, setSearchMensajes] = useState('');
  const [usuariosConversaciones, setUsuariosConversaciones] = useState<{[key: string]: any}>({});
  const [anunciosConversaciones, setAnunciosConversaciones] = useState<{[key: string]: any}>({});
  const [conversacionActiva, setConversacionActiva] = useState<string | null>(null);
  const [mensajesChat, setMensajesChat] = useState<Mensaje[]>([]);
  const [loadingChat, setLoadingChat] = useState(false);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const mensajesEndRef = React.useRef<HTMLDivElement>(null);

  // Estados para la pestaña de Soporte (mensajes de contacto)
  const [mensajesSoporte, setMensajesSoporte] = useState<MensajeContacto[]>([]);
  const [loadingSoporte, setLoadingSoporte] = useState(false);
  const [mensajeSoporteSeleccionado, setMensajeSoporteSeleccionado] = useState<MensajeContacto | null>(null);

  // Estados para la pestaña de Facturas
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [loadingFacturas, setLoadingFacturas] = useState(false);

  // Estados para la pestaña de Bonificaciones
  interface BonificacionUsuario {
    id: string;
    tipo: 'dias' | 'anuncios' | 'promocion_gratis' | 'descuento' | 'regalo';
    cantidad: number;
    motivo: string;
    fechaCreacion: Date;
    fechaExpiracion?: Date;
    estado: 'activa' | 'usada' | 'expirada' | 'cancelada';
    planTipo?: string;
    porcentajeDescuento?: number;
    codigoPromo?: string;
    leida: boolean;
  }
  const [bonificacionesUsuario, setBonificacionesUsuario] = useState<BonificacionUsuario[]>([]);
  const [loadingBonificaciones, setLoadingBonificaciones] = useState(false);
  const [bonificacionesNoLeidas, setBonificacionesNoLeidas] = useState(0);

  // Estados para Créditos Diarios / Puntos
  const [creditosUsuario, setCreditosUsuario] = useState<CreditoUsuario | null>(null);
  const [puedeReclamar, setPuedeReclamar] = useState(true);
  const [horasParaReclamar, setHorasParaReclamar] = useState(0);
  const [loadingCreditos, setLoadingCreditos] = useState(false);
  const [reclamandoCreditos, setReclamandoCreditos] = useState(false);
  const [configCreditos, setConfigCreditos] = useState<ConfiguracionCreditos>({
    creditosPorDia: 5,
    valorPuntosEnEuros: 0.10,
    puntosMinimosParaCanjear: 20,
    maxAnunciosPorCanje: 10,
    precioAnuncioEnEuros: 2.00,
    juegoActivo: true
  });
  const [mostrarAnimacionCreditos, setMostrarAnimacionCreditos] = useState(false);
  const [cantidadAnunciosACanjear, setCantidadAnunciosACanjear] = useState(1);
  const [canjeandoAnuncios, setCanjeandoAnuncios] = useState(false);

  // Estados para el formulario de publicar anuncio
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [publishStep, setPublishStep] = useState(1);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [publishTitulo, setPublishTitulo] = useState('');
  const [publishDescripcion, setPublishDescripcion] = useState('');
  const [publishPrecio, setPublishPrecio] = useState('');
  const [publishCategoria, setPublishCategoria] = useState<Categoria | ''>('');
  const [publishCondicion, setPublishCondicion] = useState<CondicionProducto>(CondicionProducto.USADO);
  const [publishUbicacion, setPublishUbicacion] = useState('');
  const [publishProvincia, setPublishProvincia] = useState('');
  const [publishNegociable, setPublishNegociable] = useState(false);
  const [publishVentaPresencial, setPublishVentaPresencial] = useState(true);
  const [publishTelefono, setPublishTelefono] = useState('');
  const [publishImagenes, setPublishImagenes] = useState<File[]>([]);
  const [publishImagenesPreview, setPublishImagenesPreview] = useState<string[]>([]);
  const [publishDragActive, setPublishDragActive] = useState(false);
  const publishFileInputRef = React.useRef<HTMLInputElement>(null);

  // Campos específicos por categoría
  // Auto moto
  const [autoKilometros, setAutoKilometros] = useState('');
  const [autoAnio, setAutoAnio] = useState('');
  const [autoTransmision, setAutoTransmision] = useState<'manual' | 'automatico' | ''>('');
  const [autoCombustible, setAutoCombustible] = useState<'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | ''>('');
  const [autoMarca, setAutoMarca] = useState('');
  const [autoModelo, setAutoModelo] = useState('');
  const [autoPotencia, setAutoPotencia] = useState('');
  const [autoColor, setAutoColor] = useState('');
  
  // Inmobiliaria
  const [inmoTipo, setInmoTipo] = useState<'piso' | 'casa' | 'atico' | 'duplex' | 'estudio' | 'local' | 'oficina' | 'terreno' | 'garaje' | ''>('');
  const [inmoHabitaciones, setInmoHabitaciones] = useState('');
  const [inmoBanios, setInmoBanios] = useState('');
  const [inmoMetros, setInmoMetros] = useState('');
  const [inmoAmueblado, setInmoAmueblado] = useState(false);
  const [inmoAscensor, setInmoAscensor] = useState(false);
  const [inmoParking, setInmoParking] = useState(false);
  const [inmoTerraza, setInmoTerraza] = useState(false);
  const [inmoPiscina, setInmoPiscina] = useState(false);
  const [inmoOperacion, setInmoOperacion] = useState<'venta' | 'alquiler' | ''>('');
  
  // Electrónica
  const [electroMarca, setElectroMarca] = useState('');
  const [electroModelo, setElectroModelo] = useState('');
  const [electroGarantia, setElectroGarantia] = useState(false);
  const [electroAnio, setElectroAnio] = useState('');
  
  // Empleo
  const [empleoTipo, setEmpleoTipo] = useState<'tiempo-completo' | 'media-jornada' | 'freelance' | 'practicas' | ''>('');
  const [empleoSalario, setEmpleoSalario] = useState('');
  const [empleoExperiencia, setEmpleoExperiencia] = useState<'sin-experiencia' | '1-2' | '3-5' | '5+' | ''>('');
  const [empleoRemoto, setEmpleoRemoto] = useState(false);
  
  // Animales
  const [animalTipo, setAnimalTipo] = useState<'perro' | 'gato' | 'pajaro' | 'pez' | 'roedor' | 'reptil' | 'otro' | ''>('');
  const [animalRaza, setAnimalRaza] = useState('');
  const [animalEdad, setAnimalEdad] = useState('');
  const [animalVacunado, setAnimalVacunado] = useState(false);
  const [animalDesparasitado, setAnimalDesparasitado] = useState(false);
  
  // Servicios
  const [servicioTipo, setServicioTipo] = useState<'hogar' | 'profesional' | 'eventos' | 'transporte' | 'reparaciones' | 'clases' | 'otro' | ''>('');
  const [servicioDisponibilidad, setServicioDisponibilidad] = useState<'inmediata' | 'programar' | 'fines-semana' | ''>('');
  const [servicioExperiencia, setServicioExperiencia] = useState('');
  const [servicioDesplazamiento, setServicioDesplazamiento] = useState(false);
  
  // Moda y accesorios
  const [modaTalla, setModaTalla] = useState('');
  const [modaMarca, setModaMarca] = useState('');
  const [modaColor, setModaColor] = useState('');
  const [modaGenero, setModaGenero] = useState<'hombre' | 'mujer' | 'unisex' | 'nino' | 'nina' | ''>('');
  const [modaTipo, setModaTipo] = useState<'ropa' | 'calzado' | 'accesorios' | 'joyeria' | 'bolsos' | ''>('');
  
  // Casa y jardín
  const [casaTipo, setCasaTipo] = useState<'muebles' | 'decoracion' | 'electrodomesticos' | 'jardin' | 'herramientas' | 'iluminacion' | ''>('');
  const [casaMaterial, setCasaMaterial] = useState('');
  const [casaDimensiones, setCasaDimensiones] = useState('');
  const [casaMontaje, setCasaMontaje] = useState(false);
  
  // Tiempo libre y deporte
  const [deporteTipo, setDeporteTipo] = useState<'fitness' | 'ciclismo' | 'acuaticos' | 'pelota' | 'montaña' | 'otros' | ''>('');
  const [deporteMarca, setDeporteMarca] = useState('');
  const [deporteTalla, setDeporteTalla] = useState('');
  
  // Mamá y niño
  const [mamaTipo, setMamaTipo] = useState<'ropa-bebe' | 'juguetes' | 'cochecitos' | 'cunas' | 'alimentacion' | 'seguridad' | ''>('');
  const [mamaEdadRecomendada, setMamaEdadRecomendada] = useState('');
  const [mamaMarca, setMamaMarca] = useState('');
  
  // Cazare turism (Alojamiento turismo)
  const [alojamientoTipo, setAlojamientoTipo] = useState<'hotel' | 'apartamento' | 'casa-rural' | 'camping' | 'hostal' | ''>('');
  const [alojamientoCapacidad, setAlojamientoCapacidad] = useState('');
  const [alojamientoPrecioNoche, setAlojamientoPrecioNoche] = useState('');
  const [alojamientoServicios, setAlojamientoServicios] = useState<string[]>([]);
  
  // Matrimoniale (Contactos)
  const [matrimonialEdad, setMatrimonialEdad] = useState('');
  const [matrimonialBusco, setMatrimonialBusco] = useState<'amistad' | 'relacion' | 'serio' | ''>('');

  const provinciasEspana = [
    'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani',
    'Brașov', 'Brăila', 'București', 'Buzău', 'Caraș-Severin', 'Călărași', 'Cluj',
    'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu', 'Gorj',
    'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți',
    'Mureș', 'Neamț', 'Olt', 'Prahova', 'Satu Mare', 'Sălaj', 'Sibiu', 'Suceava',
    'Teleorman', 'Timiș', 'Tulcea', 'Vaslui', 'Vâlcea', 'Vrancea'
  ];

  const categoryIcons: Record<string, React.ReactNode> = {
    'Imobiliare': <Home size={20} />,
    'Auto moto': <Car size={20} />,
    'Locuri de muncă': <Briefcase size={20} />,
    'Matrimoniale': <Heart size={20} />,
    'Servicii': <Wrench size={20} />,
    'Electronice': <Smartphone size={20} />,
    'Modă și accesorii': <Shirt size={20} />,
    'Animale': <PawPrint size={20} />,
    'Casă și grădină': <TreeDeciduous size={20} />,
    'Timp liber și sport': <Dumbbell size={20} />,
    'Mama și copilul': <Baby size={20} />,
    'Cazare turism': <Plane size={20} />,
    'Otros': <MoreHorizontal size={20} />,
  };

  // Cargar configuración de créditos al inicio
  useEffect(() => {
    async function loadConfigCreditos() {
      const config = await getConfiguracionCreditos();
      setConfigCreditos(config);
    }
    loadConfigCreditos();
  }, []);

  // Resetear estados cuando cambia el usuario (logout/login diferente)
  useEffect(() => {
    // Limpiar todos los estados del usuario anterior
    setCreditosUsuario(null);
    setCreditos(0); // Resetear créditos a 0 cuando cambia el usuario
    setPuedeReclamar(true);
    setHorasParaReclamar(0);
    setBonificacionesUsuario([]);
    setBonificacionesNoLeidas(0);
    setPlanesActivos([]);
    setPlanesCargados(false);
    setMisAnuncios([]);
    setAnunciosFavoritos([]);
    setFacturas([]);
    setConversaciones([]);
    
    // Cargar créditos del nuevo usuario desde Firestore
    if (user?.uid) {
      getCreditosUsuario(user.uid).then((creditosData) => {
        setCreditosUsuario(creditosData);
        if (creditosData?.saldo !== undefined) {
          setCreditos(creditosData.saldo);
        }
      }).catch(err => console.error('Error cargando créditos:', err));
    }
  }, [user?.uid]);

  // Cargar planes desde Firebase cuando hay usuario
  useEffect(() => {
    console.log('📦 useEffect planes - user:', user?.uid);
    if (user?.uid) {
      console.log('📦 Cargando planes para usuario:', user.uid);
      getPlanesUsuario(user.uid).then((planes) => {
        console.log('📦 Todos los planes del usuario:', planes);
        
        // Filtrar solo planes activos (no expirados y con anuncios disponibles)
        const hoy = new Date();
        const planesActivos = planes.filter(plan => {
          const fechaExp = new Date(plan.fechaExpiracion);
          const estaVigente = fechaExp >= hoy;
          const tieneAnuncios = plan.anunciosDisponibles > 0;
          console.log(`📦 Plan ${plan.tipo}: vigente=${estaVigente}, anuncios=${plan.anunciosDisponibles}, fecha exp=${plan.fechaExpiracion}`);
          return estaVigente && tieneAnuncios;
        });
        
        console.log('📦 Planes activos filtrados:', planesActivos);
        setPlanesActivos(planesActivos);
        setPlanesCargados(true);
      }).catch(error => {
        console.error('❌ Error cargando planes:', error);
      });
    } else {
      console.log('📦 No hay usuario logueado');
    }
  }, [user?.uid]);

  // Cargar conversaciones en tiempo real
  useEffect(() => {
    if (!user?.uid) return;
    
    setLoadingMensajes(true);
    const unsubscribe = getConversacionesByUsuario(user.uid, async (convs) => {
      setConversaciones(convs);
      setLoadingMensajes(false);
      
      // Cargar datos de usuarios y anuncios para cada conversación
      const usuariosIds = new Set<string>();
      const anunciosIds = new Set<string>();
      
      convs.forEach(conv => {
        conv.participantes.forEach(p => {
          if (p !== user.uid) usuariosIds.add(p);
        });
        if (conv.anuncioId) anunciosIds.add(conv.anuncioId);
      });
      
      // Cargar usuarios
      const usuariosData: {[key: string]: any} = {};
      for (const uid of usuariosIds) {
        try {
          const userData = await getUsuario(uid);
          if (userData) usuariosData[uid] = userData;
        } catch (e) {
          console.error('Error cargando usuario:', uid, e);
        }
      }
      setUsuariosConversaciones(usuariosData);
      
      // Cargar anuncios
      const anunciosData: {[key: string]: any} = {};
      for (const aid of anunciosIds) {
        try {
          const anuncio = await getAnuncioById(aid);
          if (anuncio) anunciosData[aid] = anuncio;
        } catch (e) {
          console.error('Error cargando anuncio:', aid, e);
        }
      }
      setAnunciosConversaciones(anunciosData);
    });
    
    return () => unsubscribe();
  }, [user?.uid]);

  // Cargar mensajes cuando se selecciona una conversación
  useEffect(() => {
    if (!conversacionActiva) {
      setMensajesChat([]);
      return;
    }
    
    setLoadingChat(true);
    const unsubscribe = getMensajesByConversacion(conversacionActiva, (msgs) => {
      setMensajesChat(msgs);
      setLoadingChat(false);
    });
    
    // Marcar mensajes como leídos
    if (user?.uid) {
      marcarMensajesComoLeidos(conversacionActiva, user.uid);
    }
    
    return () => unsubscribe();
  }, [conversacionActiva, user?.uid]);

  // Referencia al contenedor de mensajes para scroll interno
  const mensajesContainerRef = React.useRef<HTMLDivElement>(null);

  // Scroll al final cuando llegan nuevos mensajes (solo dentro del contenedor)
  useEffect(() => {
    if (mensajesContainerRef.current) {
      mensajesContainerRef.current.scrollTop = mensajesContainerRef.current.scrollHeight;
    }
  }, [mensajesChat]);

  // Función para enviar mensaje
  const handleEnviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !conversacionActiva || !user?.uid) return;
    
    setEnviandoMensaje(true);
    try {
      await enviarMensaje(conversacionActiva, user.uid, nuevoMensaje.trim());
      setNuevoMensaje('');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      toastError('Error', 'No se pudo enviar el mensaje. Inténtalo de nuevo.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  // Función para activar promoción de un anuncio
  const handleActivarPromocion = async (usarCreditos: boolean = false) => {
    if (!anuncioParaPromover || !tipoPromocionSeleccionada || !user?.uid) {
      toastError('Error', 'Faltan datos para activar la promoción');
      return;
    }

    const precioBase = tipoPromocionSeleccionada === 'VIP' ? 10 : tipoPromocionSeleccionada === 'Premium' ? 5 : 2;
    const multiplicador = duracionPromocion === 7 ? 1 : duracionPromocion === 14 ? 1.8 : 3.5;
    const precioFinal = Math.round(precioBase * multiplicador);

    // Verificar créditos si es necesario
    if (usarCreditos && creditos < precioFinal) {
      toastError('Créditos insuficientes', 'No tienes suficientes créditos para esta promoción');
      return;
    }

    try {
      // Calcular fecha de fin
      const fechaInicio = new Date();
      const fechaFin = new Date();
      fechaFin.setDate(fechaFin.getDate() + duracionPromocion);

      console.log('📦 Activando promoción para anuncio:', anuncioParaPromover.id);
      console.log('📦 Tipo:', tipoPromocionSeleccionada, 'Duración:', duracionPromocion, 'días');

      // Actualizar el anuncio en Firebase
      await updateAnuncio(anuncioParaPromover.id, {
        destacado: true,
        planPromocion: tipoPromocionSeleccionada,
        fechaPromocion: fechaInicio.toISOString(),
        diasPromocion: duracionPromocion
      } as any);
      
      console.log('✅ Anuncio actualizado en Firebase');

      // Crear factura de la compra
      const factura = await crearFactura({
        userId: user.uid,
        clienteNombre: usuario?.nombre || user.displayName || 'Usuario',
        clienteEmail: user.email || '',
        clienteTelefono: usuario?.telefono?.toString() || undefined,
        clienteDireccion: usuario?.ubicacion || undefined,
        concepto: `Promoción ${tipoPromocionSeleccionada} - ${duracionPromocion} días`,
        descripcion: `Promoción ${tipoPromocionSeleccionada} para el anuncio "${anuncioParaPromover.titulo}" durante ${duracionPromocion} días`,
        cantidad: 1,
        precioUnitario: precioFinal,
        metodoPago: usarCreditos ? 'creditos' : 'tarjeta',
        planTipo: tipoPromocionSeleccionada
      });
      
      console.log('✅ Factura creada:', factura.id, 'Total:', factura.total, '€');

      // Crear la promoción local
      const nuevaPromocion = {
        id: `promo-${anuncioParaPromover.id}-${Date.now()}`,
        anuncio: anuncioParaPromover,
        tipo: tipoPromocionSeleccionada,
        vistas: anuncioParaPromover.vistas || 0,
        precio: precioFinal,
        diasRestantes: duracionPromocion,
        diasDuracion: duracionPromocion,
        totalAnuncios: 1,
        fechaInicio: fechaInicio.toISOString(),
        fechaFin: fechaFin.toISOString()
      };

      // Agregar al estado de promociones activas
      setPromocionesActivas(prev => [...prev, nuevaPromocion]);

      // Actualizar el anuncio en misAnuncios
      setMisAnuncios(prev => prev.map(a => 
        a.id === anuncioParaPromover.id 
          ? { ...a, destacado: true, planPromocion: tipoPromocionSeleccionada, fechaPromocion: fechaInicio.toISOString() }
          : a
      ));

      // Descontar créditos si aplica
      if (usarCreditos) {
        setCreditos(prev => prev - precioFinal);
      }

      // Mostrar éxito
      toastSuccess('¡Promoción activada!', `Tu anuncio "${anuncioParaPromover.titulo}" ahora es ${tipoPromocionSeleccionada} por ${duracionPromocion} días`);

      // Cerrar modal y limpiar estados
      setShowPromoverAnuncioModal(false);
      setAnuncioParaPromover(null);
      setTipoPromocionSeleccionada(null);
      setDuracionPromocion(7);

    } catch (error) {
      console.error('Error al activar promoción:', error);
      toastError('Error', 'No se pudo activar la promoción. Inténtalo de nuevo.');
    }
  };

  // Funciones para el formulario de publicar
  const handlePublishDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setPublishDragActive(true);
    } else if (e.type === 'dragleave') {
      setPublishDragActive(false);
    }
  };

  const handlePublishDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPublishDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handlePublishFiles(files);
  };

  const handlePublishFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (publishImagenes.length + imageFiles.length > 10) {
      setPublishError('Máximo 10 imágenes permitidas');
      return;
    }
    setPublishImagenes(prev => [...prev, ...imageFiles]);
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPublishImagenesPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePublishImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handlePublishFiles(files);
  };

  const removePublishImage = (index: number) => {
    setPublishImagenes(publishImagenes.filter((_, i) => i !== index));
    setPublishImagenesPreview(publishImagenesPreview.filter((_, i) => i !== index));
  };

  const movePublishImage = (from: number, to: number) => {
    const newImages = [...publishImagenes];
    const newPreviews = [...publishImagenesPreview];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    [newPreviews[from], newPreviews[to]] = [newPreviews[to], newPreviews[from]];
    setPublishImagenes(newImages);
    setPublishImagenesPreview(newPreviews);
  };

  const canPublishProceed = () => {
    switch (publishStep) {
      case 1: return publishCategoria !== '';
      case 2: return publishTitulo.length >= 5 && publishDescripcion.length >= 20;
      case 3: return publishImagenesPreview.length >= 1;
      case 4: return publishPrecio && publishProvincia && publishUbicacion;
      default: return true;
    }
  };

  const resetPublishForm = () => {
    setPublishStep(1);
    setPublishError('');
    setPublishTitulo('');
    setPublishDescripcion('');
    setPublishPrecio('');
    setPublishCategoria('');
    setPublishCondicion(CondicionProducto.USADO);
    setPublishUbicacion('');
    setPublishProvincia('');
    setPublishNegociable(false);
    setPublishVentaPresencial(true);
    setPublishTelefono('');
    setPublishImagenes([]);
    setPublishImagenesPreview([]);
    // Reset campos específicos de categoría
    // Auto moto
    setAutoKilometros('');
    setAutoAnio('');
    setAutoTransmision('');
    setAutoCombustible('');
    setAutoMarca('');
    setAutoModelo('');
    setAutoPotencia('');
    setAutoColor('');
    // Inmobiliaria
    setInmoTipo('');
    setInmoHabitaciones('');
    setInmoBanios('');
    setInmoMetros('');
    setInmoAmueblado(false);
    setInmoAscensor(false);
    setInmoParking(false);
    setInmoTerraza(false);
    setInmoPiscina(false);
    setInmoOperacion('venta');
    // Electrónica
    setElectroMarca('');
    setElectroModelo('');
    setElectroGarantia(false);
    setElectroAnio('');
    // Empleo
    setEmpleoTipo('');
    setEmpleoSalario('');
    setEmpleoExperiencia('');
    setEmpleoRemoto(false);
    // Animales
    setAnimalTipo('');
    setAnimalRaza('');
    setAnimalEdad('');
    setAnimalVacunado(false);
    setAnimalDesparasitado(false);
    // Servicios
    setServicioTipo('');
    setServicioDisponibilidad('');
    setServicioExperiencia('');
    setServicioDesplazamiento(false);
    // Moda y accesorios
    setModaTalla('');
    setModaMarca('');
    setModaColor('');
    setModaGenero('');
    setModaTipo('');
    // Casa y jardín
    setCasaTipo('');
    setCasaMaterial('');
    setCasaDimensiones('');
    setCasaMontaje(false);
    // Tiempo libre y deporte
    setDeporteTipo('');
    setDeporteMarca('');
    setDeporteTalla('');
    // Mamá y niño
    setMamaTipo('');
    setMamaEdadRecomendada('');
    setMamaMarca('');
    // Alojamiento turismo
    setAlojamientoTipo('');
    setAlojamientoCapacidad('');
    setAlojamientoPrecioNoche('');
    setAlojamientoServicios([]);
    // Matrimoniale
    setMatrimonialEdad('');
    setMatrimonialBusco('');
  };

  const handlePublishSubmit = async () => {
    if (!user) {
      setPublishError('Debes iniciar sesión para publicar');
      return;
    }
    if (publishImagenes.length === 0) {
      setPublishError('Debes subir al menos una imagen');
      return;
    }
    setPublishLoading(true);
    setPublishError('');

    try {
      // Campos específicos por categoría
      let camposEspecificos: Record<string, unknown> = {};
      
      if (publishCategoria === Categoria.AUTO_MOTO) {
        camposEspecificos = {
          autoMarca,
          autoModelo,
          autoAnio: autoAnio ? parseInt(autoAnio) : null,
          autoKilometros: autoKilometros ? parseInt(autoKilometros) : null,
          autoTransmision: autoTransmision || null,
          autoCombustible: autoCombustible || null,
          autoPotencia: autoPotencia ? parseInt(autoPotencia) : null,
          autoColor: autoColor || null,
        };
      } else if (publishCategoria === Categoria.IMOBILIARE) {
        camposEspecificos = {
          inmoTipo: inmoTipo || null,
          inmoOperacion,
          inmoHabitaciones: inmoHabitaciones ? parseInt(inmoHabitaciones) : null,
          inmoBanios: inmoBanios ? parseInt(inmoBanios) : null,
          inmoMetros: inmoMetros ? parseInt(inmoMetros) : null,
          inmoAmueblado,
          inmoAscensor,
          inmoParking,
          inmoTerraza,
          inmoPiscina,
        };
      } else if (publishCategoria === Categoria.ELECTRONICE) {
        camposEspecificos = {
          electroMarca: electroMarca || null,
          electroModelo: electroModelo || null,
          electroAnio: electroAnio ? parseInt(electroAnio) : null,
          electroGarantia,
        };
      } else if (publishCategoria === Categoria.LOCURI_DE_MUNCA) {
        camposEspecificos = {
          empleoTipo: empleoTipo || null,
          empleoExperiencia: empleoExperiencia || null,
          empleoSalario: empleoSalario || null,
          empleoRemoto,
        };
      } else if (publishCategoria === Categoria.ANIMALE) {
        camposEspecificos = {
          animalTipo: animalTipo || null,
          animalRaza: animalRaza || null,
          animalEdad: animalEdad || null,
          animalVacunado,
          animalDesparasitado,
        };
      } else if (publishCategoria === Categoria.SERVICII) {
        camposEspecificos = {
          servicioTipo: servicioTipo || null,
          servicioDisponibilidad: servicioDisponibilidad || null,
          servicioExperiencia: servicioExperiencia || null,
          servicioDesplazamiento,
        };
      } else if (publishCategoria === Categoria.MODA_ACCESORII) {
        camposEspecificos = {
          modaTipo: modaTipo || null,
          modaTalla: modaTalla || null,
          modaMarca: modaMarca || null,
          modaColor: modaColor || null,
          modaGenero: modaGenero || null,
        };
      } else if (publishCategoria === Categoria.CASA_GRADINA) {
        camposEspecificos = {
          casaTipo: casaTipo || null,
          casaMaterial: casaMaterial || null,
          casaDimensiones: casaDimensiones || null,
          casaMontaje,
        };
      } else if (publishCategoria === Categoria.TIMP_LIBER_SPORT) {
        camposEspecificos = {
          deporteTipo: deporteTipo || null,
          deporteMarca: deporteMarca || null,
          deporteTalla: deporteTalla || null,
        };
      } else if (publishCategoria === Categoria.MAMA_COPIL) {
        camposEspecificos = {
          mamaTipo: mamaTipo || null,
          mamaEdadRecomendada: mamaEdadRecomendada || null,
          mamaMarca: mamaMarca || null,
        };
      } else if (publishCategoria === Categoria.CAZARE_TURISM) {
        camposEspecificos = {
          alojamientoTipo: alojamientoTipo || null,
          alojamientoCapacidad: alojamientoCapacidad ? parseInt(alojamientoCapacidad) : null,
          alojamientoPrecioNoche: alojamientoPrecioNoche ? parseFloat(alojamientoPrecioNoche) : null,
          alojamientoServicios,
        };
      } else if (publishCategoria === Categoria.MATRIMONIALE) {
        camposEspecificos = {
          matrimonialEdad: matrimonialEdad ? parseInt(matrimonialEdad) : null,
          matrimonialBusco: matrimonialBusco || null,
        };
      }

      const anuncioData = {
        titulo: publishTitulo,
        descripcion: publishDescripcion,
        precio: parseFloat(publishPrecio),
        categoria: publishCategoria as Categoria,
        condicion: publishCondicion,
        ubicacion: publishUbicacion,
        provincia: publishProvincia,
        negociable: publishNegociable,
        estado: EstadoAnuncio.ACTIVO,
        usuarioId: user.uid,
        vendedorId: user.uid,
        etiquetas: [],
        imagenes: [],
        destacado: false,
        destacadoPrioridad: 0,
        promovado: false,
        ventaPresencial: publishVentaPresencial,
        telefono: publishTelefono,
        ...camposEspecificos,
      };

      await createAnuncio(anuncioData, publishImagenes);
      
      // Recargar mis anuncios
      const anuncios = await getAnunciosByUsuario(user.uid);
      setMisAnuncios(anuncios);
      
      // Cerrar formulario y resetear
      setShowPublishForm(false);
      resetPublishForm();
    } catch (err) {
      console.error('Error al crear anuncio:', err);
      setPublishError('Error al publicar el anuncio. Inténtalo de nuevo.');
    } finally {
      setPublishLoading(false);
    }
  };

  // Comentado: Ya no desactivamos promociones basadas en planes
  // Las promociones ahora son independientes por anuncio

  // Cargar anuncios del usuario
  useEffect(() => {
    if (user?.uid) {
      console.log('📢 Cargando anuncios para usuario:', user.uid);
      getAnunciosByUsuario(user.uid).then((anuncios) => {
        console.log('📢 Anuncios cargados:', anuncios.length, anuncios);
        setMisAnuncios(anuncios);
        // Marcar como cargado después de un pequeño delay para mostrar el skeleton
        setTimeout(() => setInitialLoading(false), 500);
      });
    } else if (!authLoading) {
      // Si no hay usuario y auth ya cargó, quitar loading
      setInitialLoading(false);
    }
  }, [user, authLoading]);

  // Actualizar promocionesActivas cuando cambian misAnuncios - NUEVO sistema sin planes
  useEffect(() => {
    // Filtrar solo anuncios que están destacados (tienen promoción activa)
    const anunciosDestacados = misAnuncios.filter(a => a.destacado === true);
    console.log('🚀 Anuncios destacados:', anunciosDestacados.length, anunciosDestacados);
    
    if (anunciosDestacados.length > 0) {
      const promociones = anunciosDestacados.map((anuncio) => {
        // Calcular días restantes si hay fecha de promoción
        let diasRestantes = anuncio.diasPromocion || 7;
        let fechaInicio = anuncio.fechaPromocion || anuncio.fechaPublicacion || new Date().toISOString();
        let fechaExpiracion = '';
        
        if (anuncio.fechaPromocion) {
          const fechaInicioDate = new Date(anuncio.fechaPromocion);
          const diasTotales = anuncio.diasPromocion || 7;
          const fechaFinDate = new Date(fechaInicioDate);
          fechaFinDate.setDate(fechaFinDate.getDate() + diasTotales);
          fechaExpiracion = fechaFinDate.toISOString();
          const ahora = new Date();
          diasRestantes = Math.max(0, Math.ceil((fechaFinDate.getTime() - ahora.getTime()) / (1000 * 60 * 60 * 24)));
        } else {
          // Si no hay fecha, calcular desde ahora
          const fechaFinDate = new Date();
          fechaFinDate.setDate(fechaFinDate.getDate() + (anuncio.diasPromocion || 7));
          fechaExpiracion = fechaFinDate.toISOString();
        }
        
        return {
          id: `promo-${anuncio.id}`,
          anuncio: anuncio,
          tipo: anuncio.planPromocion || 'Destacado',
          vistas: anuncio.vistas || 0,
          precio: anuncio.planPromocion === 'VIP' ? 10 : anuncio.planPromocion === 'Premium' ? 5 : 2,
          diasRestantes: diasRestantes,
          diasDuracion: anuncio.diasPromocion || 7,
          totalAnuncios: 1,
          fechaInicio: fechaInicio,
          fechaExpiracion: fechaExpiracion
        };
      });
      setPromocionesActivas(promociones);
      
      // Guardar en localStorage para que FeaturedSlider pueda leerlas
      const promocionesParaStorage = promociones.map(p => ({
        id: p.id,
        anuncioId: p.anuncio.id,
        tipo: p.tipo,
        diasRestantes: p.diasRestantes,
        fechaInicio: p.fechaInicio
      }));
      localStorage.setItem('promocionesActivas', JSON.stringify(promocionesParaStorage));
      console.log('💾 Promociones guardadas en localStorage:', promocionesParaStorage);
    } else {
      // NO hay anuncios destacados = vaciar la lista
      setPromocionesActivas([]);
      localStorage.removeItem('promocionesActivas');
    }
  }, [misAnuncios]);

  // Actualizar cuando cambia activeTab a promociones
  useEffect(() => {
    if (activeTab === 'promociones' && user?.uid) {
      const idsParaPromover = localStorage.getItem('anunciosParaPromover');
      if (idsParaPromover) {
        try {
          const ids = JSON.parse(idsParaPromover);
          const anunciosSeleccionados = misAnuncios.filter(a => ids.includes(a.id));
          setAnunciosParaPromover(anunciosSeleccionados);
        } catch (e) {
          console.error('Error:', e);
        }
      }
    }
  }, [activeTab, misAnuncios, user]);

  // Cargar favoritos cuando cambia a la pestaña de favoritos
  useEffect(() => {
    async function loadFavoritos() {
      if (activeTab !== 'favoritos' || !user) return;
      setLoadingFavoritos(true);
      try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('favoritos') : null;
        const ids: string[] = raw ? JSON.parse(raw) : [];
        const items: any[] = [];
        for (const id of ids) {
          const a = await getAnuncioById(id);
          if (a) items.push(a);
        }
        setAnunciosFavoritos(items);
      } catch (err) {
        console.error('Error cargando favoritos:', err);
      } finally {
        setLoadingFavoritos(false);
      }
    }
    loadFavoritos();
  }, [activeTab, user]);

  // Cargar facturas cuando cambia a la pestaña de facturas
  useEffect(() => {
    async function loadFacturas() {
      if (activeTab !== 'facturas' || !user?.uid) return;
      setLoadingFacturas(true);
      try {
        const facturasData = await getFacturasUsuario(user.uid);
        setFacturas(facturasData);
      } catch (err) {
        console.error('Error cargando facturas:', err);
      } finally {
        setLoadingFacturas(false);
      }
    }
    loadFacturas();
  }, [activeTab, user]);

  // Cargar mensajes de soporte cuando cambia a la pestaña de soporte
  useEffect(() => {
    console.log('🔄 useEffect soporte - activeTab:', activeTab, 'email:', user?.email, 'uid:', user?.uid);
    if (activeTab !== 'soporte' || !user?.uid) {
      console.log('⏭️ Saltando carga de soporte');
      return;
    }
    
    console.log('📨 Cargando mensajes de soporte para uid:', user.uid);
    setLoadingSoporte(true);
    // Buscar por userId (más confiable que email)
    const unsubscribe = getMensajesUsuario(user.email || '', (mensajes) => {
      console.log('✅ Mensajes de soporte recibidos:', mensajes.length);
      setMensajesSoporte(mensajes);
      setLoadingSoporte(false);
    }, user.uid);
    
    return () => unsubscribe();
  }, [activeTab, user?.uid, user?.email]);

  // Cargar bonificaciones y créditos cuando cambia a la pestaña de bonificaciones
  useEffect(() => {
    async function loadBonificacionesYCreditos() {
      if (activeTab !== 'bonificaciones' || !user?.uid) return;
      
      // Verificar si el juego está activo
      if (!configCreditos.juegoActivo) {
        console.log('🔒 Sistema de bonificaciones desactivado');
        return;
      }
      
      setLoadingBonificaciones(true);
      setLoadingCreditos(true);
      
      try {
        console.log('🔄 Cargando bonificaciones para usuario:', user.uid);
        
        // Cargar configuración de créditos
        const config = await getConfiguracionCreditos();
        setConfigCreditos(config);
        
        // Cargar créditos del usuario
        const creditosData = await getCreditosUsuario(user.uid);
        setCreditosUsuario(creditosData);
        // Sincronizar con el estado creditos para la UI
        if (creditosData?.saldo !== undefined) {
          setCreditos(creditosData.saldo);
        } else {
          setCreditos(0);
        }
        console.log('💰 Créditos cargados:', creditosData);
        
        // Verificar si puede reclamar
        const verificacion = await puedeReclamarCreditos(user.uid);
        setPuedeReclamar(verificacion.puede);
        setHorasParaReclamar(verificacion.horasRestantes || 0);
        
        // Cargar bonificaciones desde Firebase
        const bonificacionesFirebase = await getBonificacionesUsuario(user.uid);
        console.log('🎁 Bonificaciones desde Firebase:', bonificacionesFirebase);
        
        // Mapear al formato del estado local
        const bonificacionesMapeadas: BonificacionUsuario[] = bonificacionesFirebase.map(b => ({
          id: b.id || '',
          tipo: b.tipo,
          cantidad: b.cantidad,
          motivo: b.motivo,
          fechaCreacion: b.fechaCreacion instanceof Date ? b.fechaCreacion : new Date(b.fechaCreacion as unknown as string),
          fechaExpiracion: b.fechaExpiracion ? (b.fechaExpiracion instanceof Date ? b.fechaExpiracion : new Date(b.fechaExpiracion as unknown as string)) : undefined,
          estado: b.estado,
          planTipo: b.planTipo,
          porcentajeDescuento: b.porcentajeDescuento,
          codigoPromo: b.codigoPromo,
          leida: b.leida ?? false,
        }));
        
        setBonificacionesUsuario(bonificacionesMapeadas);
        setBonificacionesNoLeidas(bonificacionesMapeadas.filter(b => !b.leida).length);
        console.log('✅ Bonificaciones cargadas desde Firebase:', bonificacionesMapeadas.length);
      } catch (err: unknown) {
        console.error('❌ Error cargando bonificaciones/créditos:', err);
        // Si es error de índice, mostrar mensaje específico
        if (err instanceof Error && err.message.includes('index')) {
          console.error('⚠️ Necesitas crear el índice en Firebase. Copia el enlace del error anterior.');
        }
      } finally {
        setLoadingBonificaciones(false);
        setLoadingCreditos(false);
      }
    }
    loadBonificacionesYCreditos();
  }, [activeTab, user, configCreditos.juegoActivo]);

  // Mostrar skeleton mientras carga
  if (initialLoading || authLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
        >
          <Menu size={24} className="text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {usuario?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="font-semibold text-gray-900 text-sm">{usuario?.nombre || 'Mi Perfil'}</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-50 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Hidden on mobile, slides in when menu open */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-50
        w-[280px] sm:w-72 bg-white border-r border-gray-200 
        flex flex-col justify-between py-6 px-4 shadow-lg lg:shadow-sm
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* User Info - Diseño Elegante */}
          <div className="flex flex-col items-center mb-8 pb-6 border-b border-gray-100">
            {(() => {
              const planPrincipal = planesActivos.find(p => p.tipo === 'VIP') 
                || planesActivos.find(p => p.tipo === 'Premium')
                || planesActivos.find(p => p.tipo === 'Destacado');
              
              const colorScheme = planPrincipal?.tipo === 'VIP' 
                ? { ring: 'ring-pink-300', glow: 'shadow-pink-200/60', gradient: 'from-pink-500 to-red-500', text: 'text-pink-600', bg: 'bg-pink-50' }
                : planPrincipal?.tipo === 'Premium'
                  ? { ring: 'ring-purple-300', glow: 'shadow-purple-200/60', gradient: 'from-purple-500 to-blue-500', text: 'text-purple-600', bg: 'bg-purple-50' }
                  : planPrincipal?.tipo === 'Destacado'
                    ? { ring: 'ring-yellow-300', glow: 'shadow-yellow-200/60', gradient: 'from-yellow-400 to-orange-500', text: 'text-yellow-600', bg: 'bg-yellow-50' }
                    : { ring: 'ring-gray-200', glow: 'shadow-gray-200/60', gradient: 'from-gray-400 to-gray-500', text: 'text-gray-600', bg: 'bg-gray-50' };
              
              return (
                <>
                  {/* Foto de perfil con anillo dinámico */}
                  <div className="relative mb-5 group">
                    {/* Anillo exterior animado según plan */}
                    <div className={`absolute -inset-1.5 rounded-full bg-gradient-to-r ${colorScheme.gradient} opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300`}></div>
                    <div className={`absolute -inset-1 rounded-full bg-gradient-to-r ${colorScheme.gradient} opacity-50`}></div>
                    
                    {/* Foto */}
                    <div className="relative">
                      <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="User Avatar"
                        className={`w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover relative z-10 ${colorScheme.glow}`}
                      />
                      {/* Indicador online con efecto glow */}
                      <div className="absolute -bottom-0.5 -right-0.5 z-20">
                        <div className="w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                        <div className="absolute inset-0 w-6 h-6 bg-green-400 rounded-full animate-ping opacity-50"></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Nombre con estilo elegante */}
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900 tracking-tight">{usuario?.nombre || user?.displayName || 'Usuario'}</h3>
                    <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full ${colorScheme.bg} border border-gray-200/50`}>
                      <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">ID</span>
                      <span className={`text-xs font-semibold ${colorScheme.text}`}>{user?.uid?.slice(0, 8)}</span>
                    </div>
                  </div>
                </>
              );
            })()}
            {planesActivos.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {(() => {
                  // Obtener el plan principal (prioridad: VIP > Premium > Destacado > Básico)
                  const planPrincipal = planesActivos.find(p => p.tipo === 'VIP') 
                    || planesActivos.find(p => p.tipo === 'Premium')
                    || planesActivos.find(p => p.tipo === 'Destacado');
                  
                  if (!planPrincipal) return null;
                  
                  const totalAnuncios = planesActivos.reduce((sum, p) => sum + (p.anunciosDisponibles || 0), 0);
                  
                  return (
                    <div 
                      className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                        planPrincipal.tipo === 'VIP' 
                          ? 'hover:shadow-pink-200/50 hover:shadow-lg'
                          : planPrincipal.tipo === 'Premium'
                            ? 'hover:shadow-purple-200/50 hover:shadow-lg'
                            : planPrincipal.tipo === 'Destacado'
                              ? 'hover:shadow-yellow-200/50 hover:shadow-lg'
                              : 'hover:shadow-blue-200/50 hover:shadow-lg'
                      }`}
                    >
                      {/* Fondo con gradiente y brillo */}
                      <div className={`absolute inset-0 rounded-2xl opacity-20 blur-sm ${
                        planPrincipal.tipo === 'VIP' 
                          ? 'bg-gradient-to-r from-pink-400 to-red-400'
                          : planPrincipal.tipo === 'Premium'
                            ? 'bg-gradient-to-r from-purple-400 to-blue-400'
                            : planPrincipal.tipo === 'Destacado'
                              ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                              : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                      }`}></div>
                      
                      {/* Badge principal */}
                      <div className={`relative px-5 py-2.5 rounded-2xl border-2 backdrop-blur-sm flex items-center gap-2.5 ${
                        planPrincipal.tipo === 'VIP' 
                          ? 'bg-gradient-to-r from-pink-50 to-red-50 border-pink-200/80'
                          : planPrincipal.tipo === 'Premium'
                            ? 'bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200/80'
                            : planPrincipal.tipo === 'Destacado'
                              ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300/80'
                              : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200/80'
                      }`}>
                        {/* Icono del plan */}
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          planPrincipal.tipo === 'VIP' 
                            ? 'bg-gradient-to-br from-pink-500 to-red-500 shadow-md shadow-pink-200'
                            : planPrincipal.tipo === 'Premium'
                              ? 'bg-gradient-to-br from-purple-500 to-blue-500 shadow-md shadow-purple-200'
                              : planPrincipal.tipo === 'Destacado'
                                ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-md shadow-yellow-200'
                                : 'bg-gradient-to-br from-blue-500 to-cyan-500 shadow-md shadow-blue-200'
                        }`}>
                          {planPrincipal.tipo === 'VIP' && <Crown className="text-white" size={16} />}
                          {planPrincipal.tipo === 'Premium' && <Star className="text-white" size={16} />}
                          {planPrincipal.tipo === 'Destacado' && <Award className="text-white" size={16} />}
                        </div>
                        
                        {/* Texto */}
                        <div className="flex flex-col">
                          <span className={`text-xs font-bold tracking-wide ${
                            planPrincipal.tipo === 'VIP' 
                              ? 'text-pink-700'
                              : planPrincipal.tipo === 'Premium'
                                ? 'text-purple-700'
                                : planPrincipal.tipo === 'Destacado'
                                  ? 'text-yellow-700'
                                  : 'text-blue-700'
                          }`}>
                            {planPrincipal.tipo}
                          </span>
                          <span className="text-[10px] text-gray-500 font-medium">
                            {totalAnuncios} {t('profile.available2')}
                          </span>
                        </div>
                        
                        {/* Número grande */}
                        <div className={`ml-1 text-2xl font-black ${
                          planPrincipal.tipo === 'VIP' 
                            ? 'text-pink-600'
                            : planPrincipal.tipo === 'Premium'
                              ? 'text-purple-600'
                              : planPrincipal.tipo === 'Destacado'
                                ? 'text-yellow-600'
                                : 'text-blue-600'
                        }`}>
                          {totalAnuncios}
                        </div>
                      </div>
                      
                      {/* Indicador de brillo animado */}
                      <div className={`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full animate-pulse ${
                        planPrincipal.tipo === 'VIP' 
                          ? 'bg-pink-400'
                          : planPrincipal.tipo === 'Premium'
                            ? 'bg-purple-400'
                            : planPrincipal.tipo === 'Destacado'
                              ? 'bg-yellow-400'
                              : 'bg-blue-400'
                      }`}></div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="mt-4 w-full">
                {/* Diseño elegante para Sin plan activo */}
                <div className="relative group cursor-pointer" onClick={() => handleTabChange('promociones')}>
                  {/* Fondo con patrón */}
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl opacity-80"></div>
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[length:8px_8px] rounded-2xl"></div>
                  
                  <div className="relative px-4 py-3 rounded-2xl border-2 border-dashed border-gray-200 hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                        <Rocket className="text-gray-500" size={18} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">{t('profile.noPlan')}</p>
                        <p className="text-[10px] text-gray-500">{t('profile.clickForPlans')}</p>
                      </div>
                      <div className="text-gray-400 group-hover:translate-x-1 transition-transform">
                        →
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden absolute top-4 right-4 p-2 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>

          {/* Navigation */}
          <nav className="space-y-1">
            <SidebarLink icon={<User size={18} />} label={t('profile.myProfile')} active={activeTab === 'perfil'} href="#" onClick={() => { handleTabChange('perfil'); setMobileMenuOpen(false); }} />
            <SidebarLink icon={<List size={18} />} label={t('sidebar.myAds')} active={activeTab === 'mis-anuncios'} href="#" onClick={() => { handleTabChange('mis-anuncios'); setMobileMenuOpen(false); }} />
            <SidebarLink icon={<Rocket size={18} />} label={t('profile.promotions')} active={activeTab === 'promociones'} href="#" onClick={() => { handleTabChange('promociones'); setMobileMenuOpen(false); }} />
            <SidebarLink icon={<Heart size={18} />} label={t('profile.favorites')} active={activeTab === 'favoritos'} href="#" onClick={() => { handleTabChange('favoritos'); setMobileMenuOpen(false); }} />
            <SidebarLink icon={<MessageCircle size={18} />} label={t('profile.messages')} active={activeTab === 'mensajes'} href="#" onClick={() => { handleTabChange('mensajes'); setMobileMenuOpen(false); }} badge={conversaciones.reduce((sum, conv) => sum + ((conv as any)[`noLeidos_${user?.uid}`] || 0), 0)} />
            <SidebarLink icon={<Headphones size={18} />} label="Suport" active={activeTab === 'soporte'} href="#" onClick={() => { handleTabChange('soporte'); setMobileMenuOpen(false); }} badge={mensajesSoporte.filter(m => m.respondido && !m.leido).length || undefined} />
            {configCreditos.juegoActivo && (
              <SidebarLink icon={<Gift size={18} />} label="Bonificaciones" active={activeTab === 'bonificaciones'} href="#" onClick={() => { handleTabChange('bonificaciones'); setMobileMenuOpen(false); }} badge={bonificacionesNoLeidas > 0 ? bonificacionesNoLeidas : undefined} />
            )}
            <SidebarLink icon={<Receipt size={18} />} label={t('sidebar.invoices')} active={activeTab === 'facturas'} href="#" onClick={() => { handleTabChange('facturas'); setMobileMenuOpen(false); }} badge={facturas.length > 0 ? facturas.length : undefined} />
            <SidebarLink icon={<Bell size={18} />} label={t('nav.notifications')} href="/notificaciones" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={<Settings size={18} />} label={t('nav.settings')} href="/profile/settings" onClick={() => setMobileMenuOpen(false)} />
            <SidebarLink icon={<HelpCircle size={18} />} label={t('nav.help')} onClick={() => setMobileMenuOpen(false)} />
          </nav>
        </div>

        {/* Logout Section - Bien organizado */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <button 
            onClick={async () => {
              if (confirm(t('general.confirm') + '?')) {
                try {
                  await signOut();
                  window.location.href = '/';
                } catch (error) {
                  console.error('Error al cerrar sesión:', error);
                  toastError('Error', t('error.generic'));
                }
              }
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all font-medium group"
          >
            <LogOut size={18} className="group-hover:scale-110 transition-transform" />
            <span>{t('nav.logout')}</span>
          </button>
          
          {/* Footer */}
          <div className="text-center mt-3 pb-2">
            <div className="text-xs text-gray-400">© 2025 Nuevo</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto pt-20 lg:pt-8 pb-24 lg:pb-8">
        <div className="max-w-5xl mx-auto">
          {/* Header con estilo dinámico según plan */}
          {(() => {
            const planPrincipal = planesActivos.find(p => p.tipo === 'VIP') 
              || planesActivos.find(p => p.tipo === 'Premium')
              || planesActivos.find(p => p.tipo === 'Destacado');
            
            const planColors = {
              gradient: planPrincipal?.tipo === 'VIP' 
                ? 'from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
                : planPrincipal?.tipo === 'Premium'
                  ? 'from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                  : planPrincipal?.tipo === 'Destacado'
                    ? 'from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
                    : 'from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600',
              shadow: planPrincipal?.tipo === 'VIP' 
                ? 'shadow-pink-200/50'
                : planPrincipal?.tipo === 'Premium'
                  ? 'shadow-purple-200/50'
                  : planPrincipal?.tipo === 'Destacado'
                    ? 'shadow-yellow-200/50'
                    : 'shadow-blue-200/50',
              accent: planPrincipal?.tipo === 'VIP' 
                ? 'text-pink-600'
                : planPrincipal?.tipo === 'Premium'
                  ? 'text-purple-600'
                  : planPrincipal?.tipo === 'Destacado'
                    ? 'text-yellow-600'
                    : 'text-blue-600',
              bgAccent: planPrincipal?.tipo === 'VIP' 
                ? 'bg-pink-50'
                : planPrincipal?.tipo === 'Premium'
                  ? 'bg-purple-50'
                  : planPrincipal?.tipo === 'Destacado'
                    ? 'bg-yellow-50'
                    : 'bg-blue-50',
            };
            
            return (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0 mb-6 sm:mb-8">
                <div>
                  {activeTab === 'perfil' ? (
                    <>
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg shadow-slate-300/50">
                          <User className="text-white" size={20} />
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                            {t('profile.myAccount')}
                          </h1>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"></div>
                            <span className="text-[10px] sm:text-xs font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-1">
                              <Wallet size={12} />
                              {creditos.toFixed(2)}€
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2 hidden sm:flex">
                        <Sparkles size={14} className="text-emerald-500" />
                        {t('profile.manageAccount')}
                      </p>
                    </>
                  ) : activeTab === 'mis-anuncios' ? (
                    <>
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-200/50">
                          <List className="text-white" size={20} />
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                            {t('profile.myAdsTitle')}
                          </h1>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600"></div>
                            <span className="text-[10px] sm:text-xs font-bold text-blue-600 uppercase tracking-wider">
                              {misAnuncios.length} {t('profile.published')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2 hidden sm:flex">
                        <Sparkles size={14} className="text-blue-500" />
                        {t('profile.manageAds')}
                      </p>
                    </>
                  ) : activeTab === 'favoritos' ? (
                    <>
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center shadow-lg shadow-red-200/50">
                          <Heart className="text-white" size={20} fill="currentColor" />
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                            {t('profile.myFavorites')}
                          </h1>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r from-red-500 to-pink-500"></div>
                            <span className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-wider">
                              {anunciosFavoritos.length} {t('profile.saved')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2 hidden sm:flex">
                        <Sparkles size={14} className="text-red-500" />
                        {t('profile.savedForLater')}
                      </p>
                    </>
                  ) : activeTab === 'mensajes' ? (
                    null
                  ) : (
                    <>
                      {/* Título elegante con gradiente */}
                      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${planColors.gradient} flex items-center justify-center shadow-lg ${planColors.shadow}`}>
                          {planPrincipal?.tipo === 'VIP' && <Crown className="text-white" size={20} />}
                          {planPrincipal?.tipo === 'Premium' && <Star className="text-white" size={20} />}
                          {planPrincipal?.tipo === 'Destacado' && <Award className="text-white" size={20} />}
                          {!planPrincipal && <Rocket className="text-white" size={20} />}
                        </div>
                        <div>
                          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900">
                            {t('profile.myPromotions')}
                          </h1>
                          <div className="flex items-center gap-2 mt-1">
                            <div className={`h-1 w-12 sm:w-16 rounded-full bg-gradient-to-r ${planColors.gradient}`}></div>
                            {planPrincipal && (
                              <span className={`text-[10px] sm:text-xs font-bold ${planColors.accent} uppercase tracking-wider`}>
                                Plan {planPrincipal.tipo}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-2 hidden sm:flex">
                        <Sparkles size={14} className={planColors.accent} />
                        {t('profile.managePromotions')}
                      </p>
                    </>
                  )}
                </div>
                {activeTab === 'perfil' ? (
                  <button 
                    onClick={() => setShowRecargarModal(true)}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-gradient-to-r from-emerald-500 to-cyan-600 text-white rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all shadow-lg shadow-emerald-200/50 hover:shadow-xl active:scale-95 sm:hover:scale-105"
                  >
                    <Plus size={16} />
                    {t('profile.rechargeCredits')}
                  </button>
                ) : activeTab === 'mis-anuncios' ? (
                  <button 
                    onClick={() => { resetPublishForm(); setShowPublishForm(true); }}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg shadow-blue-200/50 hover:shadow-xl active:scale-95 sm:hover:scale-105"
                  >
                    <Plus size={16} />
                    {t('profile.newAd')}
                  </button>
                ) : activeTab === 'favoritos' ? (
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="flex bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 sm:p-2 rounded-md transition-all ${
                          viewMode === 'grid' 
                            ? 'bg-white text-red-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Grid3x3 size={16} />
                      </button>
                      <button
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 sm:p-2 rounded-md transition-all ${
                          viewMode === 'list' 
                            ? 'bg-white text-red-600 shadow-sm' 
                            : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <LayoutList size={16} />
                      </button>
                    </div>
                  </div>
                ) : activeTab === 'mensajes' ? (
                  null
                ) : (
                  <button 
                    onClick={() => setShowPromoverAnuncioModal(true)}
                    className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${planColors.gradient} text-white rounded-lg sm:rounded-xl font-semibold text-xs sm:text-sm transition-all shadow-lg ${planColors.shadow} hover:shadow-xl active:scale-95 sm:hover:scale-105`}
                  >
                    <Rocket size={16} />
                    {t('profile.promoteAd')}
                  </button>
                )}
              </div>
            );
          })()}

          {activeTab === 'perfil' ? (
            <>
              {/* Banner de créditos y perfil - EMPRESA */}
              {usuario?.tipoUsuario === 'empresa' ? (
                <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden border border-amber-500/20">
                  {/* Patrón decorativo empresa */}
                  <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/20 to-orange-500/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-amber-600/10 to-yellow-500/5 rounded-full blur-3xl"></div>
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fbbf24\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                  </div>
                  
                  <div className="relative">
                    {/* Badge de empresa */}
                    <div className="flex items-center justify-center sm:justify-start mb-4">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-full border border-amber-500/30">
                        <Building2 size={14} className="text-amber-400" />
                        <span className="text-xs font-semibold text-amber-400">{t('profile.businessAccount')}</span>
                        {usuario?.empresaVerificada && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-amber-500/50"></span>
                            <BadgeCheck size={14} className="text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">Verificada</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                      {/* Info de la empresa */}
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 flex-1">
                        {/* Logo de empresa */}
                        <div className="relative">
                          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/30 flex-shrink-0">
                            <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center overflow-hidden">
                              {usuario?.logoUrl ? (
                                <Image src={usuario.logoUrl} alt="Logo" width={112} height={112} className="w-full h-full object-cover" />
                              ) : (
                                <Building2 size={40} className="text-amber-500" />
                              )}
                            </div>
                          </div>
                          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                            <Briefcase size={16} className="text-white" />
                          </div>
                        </div>

                        <div className="text-center sm:text-left flex-1">
                          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">{usuario?.nombreComercial || usuario?.nombre}</h2>
                          {usuario?.nombreComercial && usuario?.nombre && (
                            <p className="text-slate-400 text-sm mb-2">Representante: {usuario.nombre}</p>
                          )}
                          {usuario?.descripcionEmpresa && (
                            <p className="text-slate-500 text-sm mb-3 line-clamp-2 max-w-md">{usuario.descripcionEmpresa}</p>
                          )}
                          
                          {/* Info rápida empresa */}
                          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-sm">
                            {usuario?.web && (
                              <a href={usuario.web.startsWith('http') ? usuario.web : `https://${usuario.web}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition-colors">
                                <Globe size={14} />
                                <span className="truncate max-w-[150px]">{usuario.web.replace(/^https?:\/\//, '')}</span>
                              </a>
                            )}
                            {usuario?.horarioAtencion && (
                              <span className="flex items-center gap-1.5 text-slate-400">
                                <Clock size={14} />
                                <span>{usuario.horarioAtencion}</span>
                              </span>
                            )}
                          </div>

                          {/* Estadísticas */}
                          <div className="flex items-center justify-center sm:justify-start gap-4 mt-4 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <List size={16} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg">{misAnuncios.length}</p>
                                <p className="text-slate-500 text-xs">Anuncios</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Star size={16} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg">{usuario?.valoracion?.toFixed(1) || '5.0'}</p>
                                <p className="text-slate-500 text-xs">Rating</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                <Eye size={16} className="text-amber-400" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg">{misAnuncios.reduce((sum, a) => sum + (a.vistas || 0), 0)}</p>
                                <p className="text-slate-500 text-xs">{t('profile.views')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <CircleDollarSign size={16} className="text-emerald-400" />
                              </div>
                              <div>
                                <p className="text-white font-bold text-lg">{misAnuncios.filter(a => a.estado === 'Vendido').length}</p>
                                <p className="text-slate-500 text-xs">{t('profile.sales')}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tarjeta de créditos - Empresa */}
                      <div className="w-full lg:w-80">
                        <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-5 relative overflow-hidden shadow-xl shadow-amber-500/30">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
                          <div className="relative">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <Wallet size={20} className="text-white/80" />
                                <span className="text-white/80 text-sm font-medium">Saldo Empresa</span>
                              </div>
                              <Crown size={24} className="text-white/60" />
                            </div>
                            <div className="mb-4">
                              <span className="text-4xl font-black text-white">{creditos.toFixed(2)}€</span>
                            </div>
                            <button 
                              onClick={() => setShowRecargarModal(true)}
                              className="w-full py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 border border-white/20"
                            >
                              <Plus size={18} />
                              Recargar Créditos
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Banner de créditos y perfil - PARTICULAR - Diseño clásico */
                <div className="mb-6 sm:mb-8">
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 sm:p-8">
                      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Info del usuario */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 flex-1">
                          {/* Avatar limpio */}
                          <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center shadow-md">
                              <span className="text-3xl sm:text-4xl font-bold text-white">
                                {usuario?.nombre?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
                              </span>
                            </div>
                            {/* Indicador online */}
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-3 border-white shadow-sm"></div>
                          </div>

                          <div className="text-center sm:text-left flex-1">
                            {/* Nombre y verificación */}
                            <div className="flex flex-col sm:flex-row items-center gap-2 mb-1">
                              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{usuario?.nombre || 'Usuario'}</h2>
                              {usuario?.verificado && (
                                <span className="flex items-center gap-1 px-2 py-1 bg-blue-50 border border-blue-200 rounded-full">
                                  <BadgeCheck size={14} className="text-blue-500" />
                                  <span className="text-xs text-blue-600 font-medium">{t('profile.verified')}</span>
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-2 sm:gap-3 mb-4">
                              <p className="text-gray-500 text-sm flex items-center gap-1.5">
                                <Mail size={14} className="text-gray-400" />
                                {user?.email}
                              </p>
                              <span className="hidden sm:block text-gray-300">•</span>
                              <p className="text-gray-400 text-xs flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded font-mono">
                                <User size={11} className="text-gray-400" />
                                ID: {user?.uid?.slice(0, 8)}...
                              </p>
                            </div>

                            {/* Stats limpios */}
                            <div className="flex items-center justify-center sm:justify-start gap-2">
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                                  <List size={16} className="text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{misAnuncios.length}</p>
                                  <p className="text-gray-500 text-xs">{t('profile.ads')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                  <Star size={16} className="text-amber-600" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{usuario?.valoracion?.toFixed(1) || '5.0'}</p>
                                  <p className="text-gray-500 text-xs">{t('profile.rating')}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl border border-gray-100">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                  <Eye size={16} className="text-emerald-600" />
                                </div>
                                <div>
                                  <p className="text-lg font-bold text-gray-900">{misAnuncios.reduce((sum, a) => sum + (a.vistas || 0), 0)}</p>
                                  <p className="text-gray-500 text-xs">{t('profile.views')}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Tarjeta de créditos - diseño clásico */}
                        <div className="w-full lg:w-72 flex-shrink-0">
                          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 shadow-md">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                                  <Wallet size={18} className="text-white" />
                                </div>
                                <span className="text-white/90 text-sm font-medium">{t('profile.myBalance')}</span>
                              </div>
                              <Gem size={18} className="text-white/50" />
                            </div>
                            
                            <div className="mb-4">
                              <p className="text-white/50 text-xs uppercase tracking-wide mb-0.5">{t('profile.available')}</p>
                              <span className="text-4xl font-bold text-white">{creditos.toFixed(2)}<span className="text-2xl ml-0.5 text-white/70">€</span></span>
                            </div>
                            
                            <button 
                              onClick={() => setShowRecargarModal(true)}
                              className="w-full py-2.5 bg-white text-slate-800 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Plus size={16} />
                              {t('profile.rechargeCredits')}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Información de la cuenta - EMPRESA */}
              {usuario?.tipoUsuario === 'empresa' ? (
                <div className="space-y-6 mb-6">
                  {/* Datos de la Empresa - Grid de 2 columnas en desktop */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Información de la Empresa */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-amber-500/20 p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <Building2 size={18} className="text-amber-500" />
                          Información de la Empresa
                        </h3>
                        <button className="text-sm text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1">
                          <Edit3 size={14} />
                          Editar
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <Building2 size={14} className="text-slate-500" />
                            Nombre Comercial
                          </span>
                          <span className="font-medium text-white">{usuario?.nombreComercial || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <FileCheck size={14} className="text-slate-500" />
                            CIF/NIF
                          </span>
                          <span className="font-medium text-white font-mono">{usuario?.cif || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <MapPin size={14} className="text-slate-500" />
                            Dirección Fiscal
                          </span>
                          <span className="font-medium text-white text-right max-w-[200px] truncate">{usuario?.direccionFiscal || 'No especificada'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <Globe size={14} className="text-slate-500" />
                            Sitio Web
                          </span>
                          {usuario?.web ? (
                            <a href={usuario.web.startsWith('http') ? usuario.web : `https://${usuario.web}`} target="_blank" rel="noopener noreferrer" className="font-medium text-amber-400 hover:text-amber-300 transition-colors">
                              {usuario.web.replace(/^https?:\/\//, '')}
                            </a>
                          ) : (
                            <span className="text-slate-500">No especificado</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <Clock size={14} className="text-slate-500" />
                            Horario
                          </span>
                          <span className="font-medium text-white">{usuario?.horarioAtencion || 'No especificado'}</span>
                        </div>
                      </div>
                      
                      {/* Estado de verificación */}
                      <div className={`mt-4 p-3 rounded-xl flex items-center justify-between ${usuario?.empresaVerificada ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                        <div className="flex items-center gap-2">
                          {usuario?.empresaVerificada ? (
                            <>
                              <BadgeCheck className="text-emerald-400" size={18} />
                              <span className="text-sm text-emerald-400 font-medium">Empresa Verificada</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="text-amber-400" size={18} />
                              <span className="text-sm text-amber-400 font-medium">Pendiente de verificación</span>
                            </>
                          )}
                        </div>
                        {!usuario?.empresaVerificada && (
                          <button className="text-xs text-amber-500 hover:text-amber-400 font-medium">Verificar ahora</button>
                        )}
                      </div>
                    </div>

                    {/* Datos del Representante */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-700/50 p-4 sm:p-6">
                      <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <User size={18} className="text-blue-400" />
                          Datos del Representante
                        </h3>
                        <button className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1">
                          <Edit3 size={14} />
                          Editar
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <User size={14} className="text-slate-500" />
                            Nombre
                          </span>
                          <span className="font-medium text-white">{usuario?.nombre || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <Mail size={14} className="text-slate-500" />
                            Email
                          </span>
                          <span className="font-medium text-white">{user?.email}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-slate-700/50">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <Phone size={14} className="text-slate-500" />
                            Teléfono
                          </span>
                          <span className="font-medium text-white">{usuario?.telefono || 'No especificado'}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                          <span className="text-slate-400 text-sm flex items-center gap-2">
                            <MapPin size={14} className="text-slate-500" />
                            Ubicación
                          </span>
                          <span className="font-medium text-white">{usuario?.ubicacion || 'No especificada'}</span>
                        </div>
                      </div>
                      
                      {/* Email verificado */}
                      <div className="mt-4 p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="text-emerald-400" size={18} />
                          <span className="text-sm text-emerald-400 font-medium">Email verificado</span>
                        </div>
                        <span className="text-xs text-emerald-500">Activo</span>
                      </div>
                    </div>
                  </div>

                  {/* Descripción de la empresa - Full width */}
                  {usuario?.descripcionEmpresa && (
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-700/50 p-4 sm:p-6">
                      <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <FileText size={18} className="text-amber-500" />
                        Sobre la Empresa
                      </h3>
                      <p className="text-slate-300 leading-relaxed">{usuario.descripcionEmpresa}</p>
                    </div>
                  )}

                  {/* Planes y Seguridad para empresa */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Mis planes activos - Empresa */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-700/50 p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Target size={20} className="text-amber-500" />
                        Planes Empresa Activos
                      </h3>
                      {planesActivos.length > 0 ? (
                        <div className="space-y-3">
                          {planesActivos.map((plan) => (
                            <div key={plan.id} className={`flex items-center justify-between p-3 rounded-xl ${
                              plan.tipo === 'VIP' ? 'bg-pink-500/10 border border-pink-500/30' :
                              plan.tipo === 'Premium' ? 'bg-purple-500/10 border border-purple-500/30' :
                              plan.tipo === 'Destacado' ? 'bg-amber-500/10 border border-amber-500/30' :
                              'bg-blue-500/10 border border-blue-500/30'
                            }`}>
                              <div className="flex items-center gap-3">
                                {plan.tipo === 'VIP' && <Crown className="text-pink-400" size={20} />}
                                {plan.tipo === 'Premium' && <Star className="text-purple-400" size={20} />}
                                {plan.tipo === 'Destacado' && <Award className="text-amber-400" size={20} />}
                                <div>
                                  <p className="font-semibold text-white">{plan.tipo}</p>
                                  <p className="text-xs text-slate-400">{plan.anunciosDisponibles} {t('profile.ads')} {t('profile.available2')}</p>
                                </div>
                              </div>
                              <span className="text-xs text-slate-400">{plan.diasDuracion}d {t('profile.daysRemaining')}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <div className="w-16 h-16 bg-slate-700/50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Rocket className="text-slate-500" size={24} />
                          </div>
                          <p className="text-slate-400 text-sm">No tienes planes activos</p>
                          <p className="text-slate-500 text-xs">Compra un plan para promocionar tus anuncios</p>
                        </div>
                      )}
                    </div>

                    {/* Seguridad empresa */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl sm:rounded-2xl shadow-lg border border-slate-700/50 p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-blue-400" />
                        Seguridad
                      </h3>
                      <div className="space-y-3">
                        {/* Email verificat */}
                        <div className={`flex items-center justify-between p-3 rounded-xl ${
                          user?.emailVerified 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : 'bg-amber-500/10 border border-amber-500/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {user?.emailVerified ? (
                              <CheckCircle className="text-emerald-400" size={18} />
                            ) : (
                              <AlertCircle className="text-amber-400" size={18} />
                            )}
                            <span className="text-sm text-slate-300">Email verificat</span>
                          </div>
                          {user?.emailVerified ? (
                            <span className="text-xs text-emerald-400 font-medium">Activ</span>
                          ) : (
                            <button 
                              onClick={() => setShowVerificationModal(true)}
                              className="text-xs text-amber-500 font-medium hover:text-amber-400"
                            >
                              Verifică
                            </button>
                          )}
                        </div>
                        
                        {/* Telefon verificat */}
                        <div className={`flex items-center justify-between p-3 rounded-xl ${
                          usuario?.telefonVerificat 
                            ? 'bg-emerald-500/10 border border-emerald-500/30' 
                            : 'bg-slate-700/30 border border-slate-600/30'
                        }`}>
                          <div className="flex items-center gap-2">
                            {usuario?.telefonVerificat ? (
                              <CheckCircle className="text-emerald-400" size={18} />
                            ) : (
                              <Phone className="text-slate-500" size={18} />
                            )}
                            <span className="text-sm text-slate-300">Telefon verificat</span>
                          </div>
                          {usuario?.telefonVerificat ? (
                            <span className="text-xs text-emerald-400 font-medium">Activ</span>
                          ) : (
                            <button 
                              onClick={() => setShowVerificationModal(true)}
                              className="text-xs text-amber-500 font-medium hover:text-amber-400"
                            >
                              Verifică
                            </button>
                          )}
                        </div>
                        
                        {/* 2FA */}
                        <div className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl border border-slate-600/30">
                          <div className="flex items-center gap-2">
                            <Shield className="text-slate-500" size={18} />
                            <span className="text-sm text-slate-300">2FA</span>
                          </div>
                          <span className="text-xs text-slate-500 font-medium">În curând</span>
                        </div>
                        
                        {/* Empresa verificada */}
                        <div className={`flex items-center justify-between p-3 rounded-xl ${usuario?.empresaVerificada ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                          <div className="flex items-center gap-2">
                            <Building2 className={usuario?.empresaVerificada ? 'text-emerald-400' : 'text-amber-400'} size={18} />
                            <span className="text-sm text-slate-300">Firmă verificată</span>
                          </div>
                          {usuario?.empresaVerificada ? (
                            <span className="text-xs text-emerald-400 font-medium">Verificată</span>
                          ) : (
                            <button className="text-xs text-amber-500 font-medium hover:text-amber-400">Verifică</button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Información de la cuenta - PARTICULAR */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Datos personales */}
                  <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User size={18} className="text-blue-600" />
                        {t('profile.personalData')}
                      </h3>
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        <Edit3 size={14} />
                        {t('action.edit')}
                      </button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">{t('profile.name')}</span>
                        <span className="font-medium text-gray-900">{usuario?.nombre || t('profile.notSpecified')}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">Email</span>
                        <span className="font-medium text-gray-900">{user?.email}</span>
                      </div>
                      <div className="flex items-center justify-between py-3 border-b border-gray-100">
                        <span className="text-gray-500 text-sm">{t('profile.phone')}</span>
                        <span className="font-medium text-gray-900">{usuario?.telefono || t('profile.notSpecified')}</span>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <span className="text-gray-500 text-sm">{t('profile.location')}</span>
                        <span className="font-medium text-gray-900">{usuario?.ubicacion || t('profile.notSpecifiedF')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Estadísticas y Seguridad */}
                  <div className="space-y-6">
                    {/* Mis promociones activas - basado en anuncios destacados */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Target size={20} className="text-emerald-600" />
                        {t('profile.activePromotions')}
                      </h3>
                    {(() => {
                      // Filtrar anuncios con promoción activa
                      const anunciosPromocionados = misAnuncios.filter(a => a.destacado && a.planPromocion);
                      return anunciosPromocionados.length > 0 ? (
                      <div className="max-h-[280px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 pr-1">
                        <div className="space-y-3">
                          {anunciosPromocionados.slice(0, 4).map((anuncio) => {
                            // Calcular días restantes de la promoción
                            let diasRestantes = 0;
                            if (anuncio.fechaPromocion) {
                              const fechaInicio = new Date(anuncio.fechaPromocion);
                              const duracionDias = anuncio.promocion?.diasRestantes || 7; // Por defecto 7 días
                              const fechaFin = new Date(fechaInicio);
                              fechaFin.setDate(fechaFin.getDate() + duracionDias);
                              const hoy = new Date();
                              diasRestantes = Math.max(0, Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)));
                            }
                            const tipo = anuncio.planPromocion || 'Destacado';
                            return (
                            <div key={anuncio.id} className={`p-3 rounded-xl ${
                              tipo === 'VIP' ? 'bg-pink-50 border border-pink-200' :
                              tipo === 'Premium' ? 'bg-purple-50 border border-purple-200' :
                              tipo === 'Destacado' ? 'bg-yellow-50 border border-yellow-200' :
                              'bg-blue-50 border border-blue-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  {tipo === 'VIP' && <Crown className="text-pink-500" size={18} />}
                                  {tipo === 'Premium' && <Star className="text-purple-500" size={18} />}
                                  {tipo === 'Destacado' && <Award className="text-yellow-600" size={18} />}
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                                    tipo === 'VIP' ? 'bg-pink-200 text-pink-700' :
                                    tipo === 'Premium' ? 'bg-purple-200 text-purple-700' :
                                    'bg-yellow-200 text-yellow-700'
                                  }`}>{tipo}</span>
                                </div>
                                <span className={`text-xs font-medium ${diasRestantes <= 3 ? 'text-red-500' : 'text-gray-500'}`}>
                                  {diasRestantes > 0 ? `${diasRestantes}d ${t('profile.daysRemaining')}` : t('profile.active')}
                                </span>
                              </div>
                              <p className="text-sm font-medium text-gray-900 truncate">{anuncio.titulo}</p>
                              <p className="text-xs text-gray-500 truncate">{anuncio.categoria}</p>
                            </div>
                            );
                          })}
                        </div>
                        {anunciosPromocionados.length > 4 && (
                          <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                            <button 
                              onClick={() => handleTabChange('promociones')}
                              className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 mx-auto"
                            >
                              {t('profile.viewAll')} ({anunciosPromocionados.length})
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Rocket className="text-gray-400" size={24} />
                        </div>
                        <p className="text-gray-500 text-sm">{t('profile.noActivePromotions')}</p>
                        <p className="text-gray-400 text-xs">{t('profile.promoteForVisibility')}</p>
                      </div>
                    );
                    })()}
                  </div>

                    {/* Seguridad */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4">
                        <Shield size={20} className="text-blue-600" />
                        {t('profile.security')}
                      </h3>
                      <div className="space-y-3">
                        {/* Email verification */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${
                          user?.emailVerified 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-amber-50 border-amber-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {user?.emailVerified ? (
                              <CheckCircle className="text-green-600" size={18} />
                            ) : (
                              <AlertCircle className="text-amber-600" size={18} />
                            )}
                            <span className="text-sm text-gray-700">{t('profile.emailVerified')}</span>
                          </div>
                          {user?.emailVerified ? (
                            <span className="text-xs text-green-600 font-medium">{t('profile.active')}</span>
                          ) : (
                            <button 
                              onClick={() => setShowVerificationModal(true)}
                              className="text-xs text-amber-600 font-medium hover:text-amber-700"
                            >
                              Verifică acum
                            </button>
                          )}
                        </div>
                        
                        {/* Phone verification */}
                        <div className={`flex items-center justify-between p-3 rounded-xl border ${
                          usuario?.telefonVerificat 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-gray-50 border-gray-200'
                        }`}>
                          <div className="flex items-center gap-2">
                            {usuario?.telefonVerificat ? (
                              <CheckCircle className="text-green-600" size={18} />
                            ) : (
                              <Phone className="text-gray-400" size={18} />
                            )}
                            <span className="text-sm text-gray-700">Telefon verificat</span>
                          </div>
                          {usuario?.telefonVerificat ? (
                            <span className="text-xs text-green-600 font-medium">{t('profile.active')}</span>
                          ) : (
                            <button 
                              onClick={() => setShowVerificationModal(true)}
                              className="text-xs text-blue-600 font-medium hover:text-blue-700"
                            >
                              Verifică
                            </button>
                          )}
                        </div>
                        
                        {/* 2FA - Coming soon */}
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
                          <div className="flex items-center gap-2">
                            <Shield className="text-gray-400" size={18} />
                            <span className="text-sm text-gray-700">2FA</span>
                          </div>
                          <span className="text-xs text-gray-400 font-medium">În curând</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : activeTab === 'mis-anuncios' ? (
            /* Mis Anuncios Tab */
            <div className="space-y-6">
              {/* Formulario de Publicar Anuncio */}
              {showPublishForm ? (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  {/* Header del formulario */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => publishStep > 1 ? setPublishStep(publishStep - 1) : setShowPublishForm(false)}
                          className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                        >
                          <ArrowLeft className="text-white" size={20} />
                        </button>
                        <div>
                          <h2 className="text-xl font-bold text-white">Publicar anuncio</h2>
                          <p className="text-indigo-100 text-sm">Paso {publishStep} de 4</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowPublishForm(false)}
                        className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
                      >
                        <X className="text-white" size={20} />
                      </button>
                    </div>
                    {/* Progress bar */}
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3, 4].map((s) => (
                        <div 
                          key={s}
                          className={`h-1.5 rounded-full flex-1 transition-all ${
                            s <= publishStep ? 'bg-white' : 'bg-white/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Step 1: Categoría */}
                    {publishStep === 1 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Tag className="text-indigo-600" size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">¿Qué quieres vender?</h3>
                          <p className="text-gray-500 text-sm">Selecciona la categoría de tu producto</p>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {Object.values(Categoria).map((cat) => (
                            <button
                              key={cat}
                              onClick={() => setPublishCategoria(cat)}
                              className={`p-4 rounded-xl border-2 transition-all text-left group hover:shadow-md ${
                                publishCategoria === cat 
                                  ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                                  : 'border-gray-100 bg-white hover:border-gray-200'
                              }`}
                            >
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 transition-colors ${
                                publishCategoria === cat 
                                  ? 'bg-indigo-500 text-white' 
                                  : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                              }`}>
                                {categoryIcons[cat] || <Package size={20} />}
                              </div>
                              <p className={`font-medium text-sm ${publishCategoria === cat ? 'text-indigo-700' : 'text-gray-700'}`}>
                                {cat}
                              </p>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Step 2: Información */}
                    {publishStep === 2 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <FileText className="text-indigo-600" size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Describe tu producto</h3>
                          <p className="text-gray-500 text-sm">Un buen título y descripción aumentan tus ventas</p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Título del anuncio</label>
                            <input
                              type="text"
                              value={publishTitulo}
                              onChange={(e) => setPublishTitulo(e.target.value)}
                              maxLength={80}
                              placeholder="Ej: iPhone 14 Pro 256GB como nuevo"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                            />
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">Mínimo 5 caracteres</p>
                              <p className={`text-xs ${publishTitulo.length >= 5 ? 'text-green-600' : 'text-gray-400'}`}>{publishTitulo.length}/80</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Descripción</label>
                            <textarea
                              value={publishDescripcion}
                              onChange={(e) => setPublishDescripcion(e.target.value)}
                              rows={5}
                              maxLength={2000}
                              placeholder="Describe tu producto con detalle..."
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all resize-none"
                            />
                            <div className="flex justify-between mt-1">
                              <p className="text-xs text-gray-500">Mínimo 20 caracteres</p>
                              <p className={`text-xs ${publishDescripcion.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>{publishDescripcion.length}/2000</p>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado del producto</label>
                            <div className="grid grid-cols-4 gap-3">
                              {Object.values(CondicionProducto).map((cond) => (
                                <button
                                  key={cond}
                                  type="button"
                                  onClick={() => setPublishCondicion(cond)}
                                  className={`p-3 rounded-xl border-2 transition-all ${
                                    publishCondicion === cond 
                                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                                      : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                                  }`}
                                >
                                  <p className="font-medium text-sm">{cond}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Campos específicos por categoría */}
                          {publishCategoria === Categoria.AUTO_MOTO && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Car size={18} className="text-blue-600" />
                                Detalles del vehículo
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                                  <input
                                    type="text"
                                    value={autoMarca}
                                    onChange={(e) => setAutoMarca(e.target.value)}
                                    placeholder="Ej: BMW, Audi..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
                                  <input
                                    type="text"
                                    value={autoModelo}
                                    onChange={(e) => setAutoModelo(e.target.value)}
                                    placeholder="Ej: Serie 3, A4..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Año</label>
                                  <input
                                    type="number"
                                    value={autoAnio}
                                    onChange={(e) => setAutoAnio(e.target.value)}
                                    placeholder="2020"
                                    min="1900"
                                    max={new Date().getFullYear() + 1}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Kilómetros</label>
                                  <input
                                    type="number"
                                    value={autoKilometros}
                                    onChange={(e) => setAutoKilometros(e.target.value)}
                                    placeholder="50000"
                                    min="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Transmisión</label>
                                  <select
                                    value={autoTransmision}
                                    onChange={(e) => setAutoTransmision(e.target.value as 'manual' | 'automatico' | '')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="manual">Manual</option>
                                    <option value="automatico">Automático</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Combustible</label>
                                  <select
                                    value={autoCombustible}
                                    onChange={(e) => setAutoCombustible(e.target.value as 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | '')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="gasolina">Gasolina</option>
                                    <option value="diesel">Diésel</option>
                                    <option value="hibrido">Híbrido</option>
                                    <option value="electrico">Eléctrico</option>
                                    <option value="gas">GLP/Gas</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Potencia (CV)</label>
                                  <input
                                    type="number"
                                    value={autoPotencia}
                                    onChange={(e) => setAutoPotencia(e.target.value)}
                                    placeholder="150"
                                    min="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                                  <input
                                    type="text"
                                    value={autoColor}
                                    onChange={(e) => setAutoColor(e.target.value)}
                                    placeholder="Negro, Blanco..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {publishCategoria === Categoria.IMOBILIARE && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Home size={18} className="text-emerald-600" />
                                Detalles del inmueble
                              </h4>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de inmueble</label>
                                  <select
                                    value={inmoTipo}
                                    onChange={(e) => setInmoTipo(e.target.value as 'piso' | 'casa' | 'atico' | 'duplex' | 'estudio' | 'local' | 'oficina' | 'terreno' | 'garaje' | '')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="piso">Piso</option>
                                    <option value="casa">Casa / Chalet</option>
                                    <option value="atico">Ático</option>
                                    <option value="duplex">Dúplex</option>
                                    <option value="estudio">Estudio</option>
                                    <option value="local">Local comercial</option>
                                    <option value="oficina">Oficina</option>
                                    <option value="terreno">Terreno</option>
                                    <option value="garaje">Garaje</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Operación</label>
                                  <select
                                    value={inmoOperacion}
                                    onChange={(e) => setInmoOperacion(e.target.value as 'venta' | 'alquiler')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  >
                                    <option value="venta">Venta</option>
                                    <option value="alquiler">Alquiler</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Habitaciones</label>
                                  <input
                                    type="number"
                                    value={inmoHabitaciones}
                                    onChange={(e) => setInmoHabitaciones(e.target.value)}
                                    placeholder="3"
                                    min="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Baños</label>
                                  <input
                                    type="number"
                                    value={inmoBanios}
                                    onChange={(e) => setInmoBanios(e.target.value)}
                                    placeholder="2"
                                    min="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Metros cuadrados</label>
                                  <input
                                    type="number"
                                    value={inmoMetros}
                                    onChange={(e) => setInmoMetros(e.target.value)}
                                    placeholder="90"
                                    min="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors">
                                  <input type="checkbox" checked={inmoAmueblado} onChange={(e) => setInmoAmueblado(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                                  <span className="text-sm text-gray-700">Amueblado</span>
                                </label>
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors">
                                  <input type="checkbox" checked={inmoAscensor} onChange={(e) => setInmoAscensor(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                                  <span className="text-sm text-gray-700">Ascensor</span>
                                </label>
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors">
                                  <input type="checkbox" checked={inmoParking} onChange={(e) => setInmoParking(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                                  <span className="text-sm text-gray-700">Parking</span>
                                </label>
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors">
                                  <input type="checkbox" checked={inmoTerraza} onChange={(e) => setInmoTerraza(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                                  <span className="text-sm text-gray-700">Terraza</span>
                                </label>
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-emerald-300 transition-colors">
                                  <input type="checkbox" checked={inmoPiscina} onChange={(e) => setInmoPiscina(e.target.checked)} className="w-4 h-4 text-emerald-600 rounded" />
                                  <span className="text-sm text-gray-700">Piscina</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {publishCategoria === Categoria.ELECTRONICE && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Smartphone size={18} className="text-violet-600" />
                                Detalles del producto
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                                  <input
                                    type="text"
                                    value={electroMarca}
                                    onChange={(e) => setElectroMarca(e.target.value)}
                                    placeholder="Apple, Samsung..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Modelo</label>
                                  <input
                                    type="text"
                                    value={electroModelo}
                                    onChange={(e) => setElectroModelo(e.target.value)}
                                    placeholder="iPhone 14, Galaxy S23..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Año de compra</label>
                                  <input
                                    type="number"
                                    value={electroAnio}
                                    onChange={(e) => setElectroAnio(e.target.value)}
                                    placeholder="2023"
                                    min="2000"
                                    max={new Date().getFullYear()}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-violet-300 transition-colors w-full">
                                    <input type="checkbox" checked={electroGarantia} onChange={(e) => setElectroGarantia(e.target.checked)} className="w-4 h-4 text-violet-600 rounded" />
                                    <span className="text-sm text-gray-700">Con garantía</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {publishCategoria === Categoria.LOCURI_DE_MUNCA && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Briefcase size={18} className="text-amber-600" />
                                Detalles del empleo
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de contrato</label>
                                  <select
                                    value={empleoTipo}
                                    onChange={(e) => setEmpleoTipo(e.target.value as 'tiempo-completo' | 'media-jornada' | 'freelance' | 'practicas' | '')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="tiempo-completo">Tiempo completo</option>
                                    <option value="media-jornada">Media jornada</option>
                                    <option value="practicas">Prácticas</option>
                                    <option value="freelance">Freelance</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Experiencia requerida</label>
                                  <select
                                    value={empleoExperiencia}
                                    onChange={(e) => setEmpleoExperiencia(e.target.value as 'sin-experiencia' | '1-2' | '3-5' | '5+' | '')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="sin-experiencia">Sin experiencia</option>
                                    <option value="1-2">1-2 años</option>
                                    <option value="3-5">3-5 años</option>
                                    <option value="5+">+5 años</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Salario (€/mes)</label>
                                  <input
                                    type="text"
                                    value={empleoSalario}
                                    onChange={(e) => setEmpleoSalario(e.target.value)}
                                    placeholder="1500-2000 o A convenir"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-amber-300 transition-colors w-full">
                                    <input type="checkbox" checked={empleoRemoto} onChange={(e) => setEmpleoRemoto(e.target.checked)} className="w-4 h-4 text-amber-600 rounded" />
                                    <span className="text-sm text-gray-700">Trabajo remoto</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {publishCategoria === Categoria.ANIMALE && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <PawPrint size={18} className="text-pink-600" />
                                Detalles del animal
                              </h4>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de animal</label>
                                  <select
                                    value={animalTipo}
                                    onChange={(e) => setAnimalTipo(e.target.value as 'perro' | 'gato' | 'pajaro' | 'pez' | 'roedor' | 'reptil' | 'otro' | '')}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="perro">Perro</option>
                                    <option value="gato">Gato</option>
                                    <option value="pajaro">Pájaro</option>
                                    <option value="pez">Pez</option>
                                    <option value="roedor">Roedor</option>
                                    <option value="reptil">Reptil</option>
                                    <option value="otro">Otro</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Raza</label>
                                  <input
                                    type="text"
                                    value={animalRaza}
                                    onChange={(e) => setAnimalRaza(e.target.value)}
                                    placeholder="Golden Retriever..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Edad</label>
                                  <input
                                    type="text"
                                    value={animalEdad}
                                    onChange={(e) => setAnimalEdad(e.target.value)}
                                    placeholder="2 años, 6 meses..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-3">
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-pink-300 transition-colors">
                                  <input type="checkbox" checked={animalVacunado} onChange={(e) => setAnimalVacunado(e.target.checked)} className="w-4 h-4 text-pink-600 rounded" />
                                  <span className="text-sm text-gray-700">Vacunado</span>
                                </label>
                                <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-pink-300 transition-colors">
                                  <input type="checkbox" checked={animalDesparasitado} onChange={(e) => setAnimalDesparasitado(e.target.checked)} className="w-4 h-4 text-pink-600 rounded" />
                                  <span className="text-sm text-gray-700">Desparasitado</span>
                                </label>
                              </div>
                            </div>
                          )}

                          {/* Servicios */}
                          {publishCategoria === Categoria.SERVICII && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border border-cyan-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Wrench size={18} className="text-cyan-600" />
                                Detalles del servicio
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de servicio</label>
                                  <select
                                    value={servicioTipo}
                                    onChange={(e) => setServicioTipo(e.target.value as typeof servicioTipo)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="hogar">Servicio al hogar</option>
                                    <option value="profesional">Profesional</option>
                                    <option value="eventos">Eventos</option>
                                    <option value="transporte">Transporte</option>
                                    <option value="reparaciones">Reparaciones</option>
                                    <option value="clases">Clases particulares</option>
                                    <option value="otro">Otro</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Disponibilidad</label>
                                  <select
                                    value={servicioDisponibilidad}
                                    onChange={(e) => setServicioDisponibilidad(e.target.value as typeof servicioDisponibilidad)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="inmediata">Inmediata</option>
                                    <option value="programar">A programar</option>
                                    <option value="fines-semana">Fines de semana</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Años de experiencia</label>
                                  <input
                                    type="text"
                                    value={servicioExperiencia}
                                    onChange={(e) => setServicioExperiencia(e.target.value)}
                                    placeholder="5 años..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-cyan-300 transition-colors w-full">
                                    <input type="checkbox" checked={servicioDesplazamiento} onChange={(e) => setServicioDesplazamiento(e.target.checked)} className="w-4 h-4 text-cyan-600 rounded" />
                                    <span className="text-sm text-gray-700">Me desplazo</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Moda y accesorios */}
                          {publishCategoria === Categoria.MODA_ACCESORII && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-xl border border-fuchsia-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Shirt size={18} className="text-fuchsia-600" />
                                Detalles de moda
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                                  <select
                                    value={modaTipo}
                                    onChange={(e) => setModaTipo(e.target.value as typeof modaTipo)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="ropa">Ropa</option>
                                    <option value="calzado">Calzado</option>
                                    <option value="accesorios">Accesorios</option>
                                    <option value="joyeria">Joyería</option>
                                    <option value="bolsos">Bolsos</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Género</label>
                                  <select
                                    value={modaGenero}
                                    onChange={(e) => setModaGenero(e.target.value as typeof modaGenero)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="hombre">Hombre</option>
                                    <option value="mujer">Mujer</option>
                                    <option value="unisex">Unisex</option>
                                    <option value="nino">Niño</option>
                                    <option value="nina">Niña</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Talla</label>
                                  <input
                                    type="text"
                                    value={modaTalla}
                                    onChange={(e) => setModaTalla(e.target.value)}
                                    placeholder="M, 42, 38..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                                  <input
                                    type="text"
                                    value={modaMarca}
                                    onChange={(e) => setModaMarca(e.target.value)}
                                    placeholder="Zara, Nike..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                                  <input
                                    type="text"
                                    value={modaColor}
                                    onChange={(e) => setModaColor(e.target.value)}
                                    placeholder="Negro, Azul marino..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Casa y jardín */}
                          {publishCategoria === Categoria.CASA_GRADINA && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-lime-50 to-green-50 rounded-xl border border-lime-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <TreeDeciduous size={18} className="text-lime-600" />
                                Detalles del artículo
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
                                  <select
                                    value={casaTipo}
                                    onChange={(e) => setCasaTipo(e.target.value as typeof casaTipo)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="muebles">Muebles</option>
                                    <option value="decoracion">Decoración</option>
                                    <option value="electrodomesticos">Electrodomésticos</option>
                                    <option value="jardin">Jardín</option>
                                    <option value="herramientas">Herramientas</option>
                                    <option value="iluminacion">Iluminación</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Material</label>
                                  <input
                                    type="text"
                                    value={casaMaterial}
                                    onChange={(e) => setCasaMaterial(e.target.value)}
                                    placeholder="Madera, Metal..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Dimensiones</label>
                                  <input
                                    type="text"
                                    value={casaDimensiones}
                                    onChange={(e) => setCasaDimensiones(e.target.value)}
                                    placeholder="120x80x45 cm"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="flex items-end">
                                  <label className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-lime-300 transition-colors w-full">
                                    <input type="checkbox" checked={casaMontaje} onChange={(e) => setCasaMontaje(e.target.checked)} className="w-4 h-4 text-lime-600 rounded" />
                                    <span className="text-sm text-gray-700">Requiere montaje</span>
                                  </label>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Tiempo libre y deporte */}
                          {publishCategoria === Categoria.TIMP_LIBER_SPORT && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Dumbbell size={18} className="text-orange-600" />
                                Detalles del artículo deportivo
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de deporte</label>
                                  <select
                                    value={deporteTipo}
                                    onChange={(e) => setDeporteTipo(e.target.value as typeof deporteTipo)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="fitness">Fitness / Gym</option>
                                    <option value="ciclismo">Ciclismo</option>
                                    <option value="acuaticos">Deportes acuáticos</option>
                                    <option value="pelota">Deportes de pelota</option>
                                    <option value="montaña">Montaña / Senderismo</option>
                                    <option value="otros">Otros</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                                  <input
                                    type="text"
                                    value={deporteMarca}
                                    onChange={(e) => setDeporteMarca(e.target.value)}
                                    placeholder="Nike, Adidas..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Talla / Tamaño</label>
                                  <input
                                    type="text"
                                    value={deporteTalla}
                                    onChange={(e) => setDeporteTalla(e.target.value)}
                                    placeholder="M, L, 26 pulgadas..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Mamá y niño */}
                          {publishCategoria === Categoria.MAMA_COPIL && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl border border-sky-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Baby size={18} className="text-sky-600" />
                                Detalles del producto infantil
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de producto</label>
                                  <select
                                    value={mamaTipo}
                                    onChange={(e) => setMamaTipo(e.target.value as typeof mamaTipo)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="ropa-bebe">Ropa de bebé</option>
                                    <option value="juguetes">Juguetes</option>
                                    <option value="cochecitos">Cochecitos</option>
                                    <option value="cunas">Cunas / Mobiliario</option>
                                    <option value="alimentacion">Alimentación</option>
                                    <option value="seguridad">Seguridad</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Edad recomendada</label>
                                  <input
                                    type="text"
                                    value={mamaEdadRecomendada}
                                    onChange={(e) => setMamaEdadRecomendada(e.target.value)}
                                    placeholder="0-6 meses, 2-4 años..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Marca</label>
                                  <input
                                    type="text"
                                    value={mamaMarca}
                                    onChange={(e) => setMamaMarca(e.target.value)}
                                    placeholder="Chicco, Fisher Price..."
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Alojamiento turismo */}
                          {publishCategoria === Categoria.CAZARE_TURISM && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Plane size={18} className="text-teal-600" />
                                Detalles del alojamiento
                              </h4>
                              <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Tipo de alojamiento</label>
                                  <select
                                    value={alojamientoTipo}
                                    onChange={(e) => setAlojamientoTipo(e.target.value as typeof alojamientoTipo)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="hotel">Hotel</option>
                                    <option value="apartamento">Apartamento</option>
                                    <option value="casa-rural">Casa rural</option>
                                    <option value="camping">Camping</option>
                                    <option value="hostal">Hostal</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Capacidad (personas)</label>
                                  <input
                                    type="number"
                                    value={alojamientoCapacidad}
                                    onChange={(e) => setAlojamientoCapacidad(e.target.value)}
                                    placeholder="4"
                                    min="1"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  />
                                </div>
                                <div className="col-span-2">
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Precio por noche (€)</label>
                                  <input
                                    type="number"
                                    value={alojamientoPrecioNoche}
                                    onChange={(e) => setAlojamientoPrecioNoche(e.target.value)}
                                    placeholder="85"
                                    min="0"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {['WiFi', 'Parking', 'Piscina', 'A/C', 'Cocina', 'TV', 'Mascotas'].map((servicio) => (
                                  <label key={servicio} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 cursor-pointer hover:border-teal-300 transition-colors">
                                    <input 
                                      type="checkbox" 
                                      checked={alojamientoServicios.includes(servicio)} 
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setAlojamientoServicios([...alojamientoServicios, servicio]);
                                        } else {
                                          setAlojamientoServicios(alojamientoServicios.filter(s => s !== servicio));
                                        }
                                      }} 
                                      className="w-4 h-4 text-teal-600 rounded" 
                                    />
                                    <span className="text-sm text-gray-700">{servicio}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Matrimoniale / Contactos */}
                          {publishCategoria === Categoria.MATRIMONIALE && (
                            <div className="mt-6 p-4 bg-gradient-to-br from-rose-50 to-red-50 rounded-xl border border-rose-100">
                              <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <Heart size={18} className="text-rose-600" />
                                Información personal
                              </h4>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Edad</label>
                                  <input
                                    type="number"
                                    value={matrimonialEdad}
                                    onChange={(e) => setMatrimonialEdad(e.target.value)}
                                    placeholder="30"
                                    min="18"
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-600 mb-1">Busco</label>
                                  <select
                                    value={matrimonialBusco}
                                    onChange={(e) => setMatrimonialBusco(e.target.value as typeof matrimonialBusco)}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                                  >
                                    <option value="">Seleccionar</option>
                                    <option value="amistad">Amistad</option>
                                    <option value="relacion">Relación</option>
                                    <option value="serio">Algo serio</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Step 3: Imágenes */}
                    {publishStep === 3 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Camera className="text-indigo-600" size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Añade fotos</h3>
                          <p className="text-gray-500 text-sm">Los anuncios con fotos reciben 10x más visitas</p>
                        </div>

                        <div
                          onDragEnter={handlePublishDrag}
                          onDragLeave={handlePublishDrag}
                          onDragOver={handlePublishDrag}
                          onDrop={handlePublishDrop}
                          onClick={() => publishFileInputRef.current?.click()}
                          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                            publishDragActive 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-gray-200 bg-gray-50 hover:border-indigo-300 hover:bg-gray-100'
                          }`}
                        >
                          <input
                            ref={publishFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handlePublishImageChange}
                            className="hidden"
                            multiple
                          />
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 ${
                            publishDragActive ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            <Upload size={24} />
                          </div>
                          <p className="font-medium text-gray-700">{publishDragActive ? 'Suelta aquí' : 'Arrastra tus fotos aquí'}</p>
                          <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
                        </div>

                        {publishImagenesPreview.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {publishImagenesPreview.map((preview, index) => (
                              <div key={index} className={`relative aspect-square rounded-xl overflow-hidden group ${index === 0 ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}>
                                <Image src={preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  {index > 0 && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); movePublishImage(index, index - 1); }} className="p-2 bg-white rounded-lg hover:bg-gray-100">
                                      <ArrowLeft size={14} />
                                    </button>
                                  )}
                                  <button type="button" onClick={(e) => { e.stopPropagation(); removePublishImage(index); }} className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                    <X size={14} />
                                  </button>
                                  {index < publishImagenesPreview.length - 1 && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); movePublishImage(index, index + 1); }} className="p-2 bg-white rounded-lg hover:bg-gray-100">
                                      <ArrowRight size={14} />
                                    </button>
                                  )}
                                </div>
                                {index === 0 && <span className="absolute bottom-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-lg font-medium">Portada</span>}
                              </div>
                            ))}
                            {publishImagenesPreview.length < 10 && (
                              <button type="button" onClick={() => publishFileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 hover:border-indigo-300 hover:bg-indigo-50 transition-all">
                                <Camera className="text-gray-400" size={20} />
                                <span className="text-xs text-gray-500">{publishImagenesPreview.length}/10</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Step 4: Precio y Ubicación */}
                    {publishStep === 4 && (
                      <div className="space-y-6">
                        <div className="text-center mb-6">
                          <div className="w-14 h-14 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Euro className="text-indigo-600" size={24} />
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">Precio y ubicación</h3>
                          <p className="text-gray-500 text-sm">Últimos detalles para publicar</p>
                        </div>

                        <div className="space-y-4">
                          <div className="bg-gray-50 rounded-xl p-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Precio</label>
                            <div className="relative">
                              <input
                                type="number"
                                value={publishPrecio}
                                onChange={(e) => setPublishPrecio(e.target.value)}
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className="w-full px-4 py-3 pr-12 bg-white border border-gray-200 rounded-xl text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">€</span>
                            </div>
                            <label className="flex items-center gap-3 mt-3 cursor-pointer">
                              <input type="checkbox" checked={publishNegociable} onChange={(e) => setPublishNegociable(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-indigo-500 focus:ring-indigo-500" />
                              <span className="text-sm text-gray-600">Precio negociable</span>
                            </label>
                          </div>

                          <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Provincia</label>
                              <select
                                value={publishProvincia}
                                onChange={(e) => setPublishProvincia(e.target.value)}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
                              >
                                <option value="">Seleccionar...</option>
                                {provinciasEspana.map((prov) => (
                                  <option key={prov} value={prov}>{prov}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Ciudad</label>
                              <input
                                type="text"
                                value={publishUbicacion}
                                onChange={(e) => setPublishUbicacion(e.target.value)}
                                placeholder="Ej: Barcelona"
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono (opcional)</label>
                            <input
                              type="tel"
                              value={publishTelefono}
                              onChange={(e) => setPublishTelefono(e.target.value)}
                              placeholder="+34 600 000 000"
                              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white"
                            />
                          </div>

                          {/* Resumen */}
                          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                            <p className="text-sm font-semibold text-gray-700 mb-3">Resumen</p>
                            <div className="flex gap-3">
                              {publishImagenesPreview[0] && (
                                <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                  <Image src={publishImagenesPreview[0]} alt="Preview" width={64} height={64} className="w-full h-full object-cover" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-900 truncate">{publishTitulo || 'Sin título'}</p>
                                <p className="text-xs text-gray-500">{publishCategoria || 'Sin categoría'}</p>
                                <p className="text-lg font-bold text-indigo-600">{publishPrecio ? `${publishPrecio} €` : 'Sin precio'}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Error */}
                    {publishError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mt-4">
                        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                        <p className="text-red-700 text-sm">{publishError}</p>
                      </div>
                    )}

                    {/* Botones de navegación */}
                    <div className="flex gap-3 mt-6">
                      {publishStep > 1 && (
                        <button
                          type="button"
                          onClick={() => setPublishStep(publishStep - 1)}
                          disabled={publishLoading}
                          className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
                        >
                          Anterior
                        </button>
                      )}
                      {publishStep < 4 ? (
                        <button
                          type="button"
                          onClick={() => setPublishStep(publishStep + 1)}
                          disabled={!canPublishProceed()}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          Continuar
                          <ChevronRight size={18} />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handlePublishSubmit}
                          disabled={publishLoading || !canPublishProceed()}
                          className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {publishLoading ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              Publicando...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 size={18} />
                              Publicar anuncio
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <>
              {/* Stats rápidos */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                      <List className="text-blue-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{misAnuncios.length}</p>
                      <p className="text-xs text-gray-500">{t('profile.total')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                      <Eye className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{misAnuncios.reduce((sum, a) => sum + (a.vistas || 0), 0)}</p>
                      <p className="text-xs text-gray-500">{t('profile.views')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <Heart className="text-red-500" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{misAnuncios.reduce((sum, a) => sum + (a.favoritos || 0), 0)}</p>
                      <p className="text-xs text-gray-500">{t('profile.favorites')}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <Star className="text-yellow-500" size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{misAnuncios.filter(a => a.destacado).length}</p>
                      <p className="text-xs text-gray-500">{t('profile.promoted')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toggle de vista y filtros */}
              {misAnuncios.length > 0 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">{misAnuncios.length} {t('profile.adsFound')}</p>
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Vista de cuadrícula"
                    >
                      <LayoutGrid size={18} />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                      title="Vista de lista"
                    >
                      <LayoutList size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* Lista de anuncios */}
              {misAnuncios.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <List className="text-blue-400" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes anuncios publicados</h3>
                  <p className="text-gray-500 mb-6">Publica tu primer anuncio y empieza a vender</p>
                  <button 
                    onClick={() => window.location.href = '/publish'}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Publicar mi primer anuncio
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {misAnuncios.map((anuncio) => (
                    <div 
                      key={anuncio.id} 
                      className={`bg-white rounded-xl overflow-hidden shadow-sm border hover:shadow-lg transition-all group ${
                        anuncio.estado === 'En revisión' ? 'border-amber-300 bg-amber-50/30' : 'border-gray-100'
                      }`}
                    >
                      {/* Imagen */}
                      <div className="relative h-40 bg-gray-100">
                        <img 
                          src={anuncio.imagenes?.[0] || '/placeholder.jpg'} 
                          alt={anuncio.titulo}
                          className={`w-full h-full object-cover ${anuncio.estado === 'En revisión' ? 'opacity-80' : ''}`}
                        />
                        {/* Badge de revisión */}
                        {anuncio.estado === 'En revisión' ? (
                          <span className="absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg text-white bg-amber-500 flex items-center gap-1">
                            <Clock size={12} />
                            En revisión
                          </span>
                        ) : anuncio.destacado && anuncio.planPromocion ? (
                          <span className={`absolute top-2 left-2 text-xs font-bold px-2 py-1 rounded-lg text-white flex items-center gap-1 ${
                            anuncio.planPromocion === 'VIP' ? 'bg-gradient-to-r from-pink-500 to-red-500' :
                            anuncio.planPromocion === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-blue-500' :
                            anuncio.planPromocion === 'Destacado' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                            'bg-blue-500'
                          }`}>
                            {anuncio.planPromocion === 'VIP' && <Crown size={12} />}
                            {anuncio.planPromocion === 'Premium' && <Star size={12} />}
                            {anuncio.planPromocion === 'Destacado' && <Award size={12} />}
                            {anuncio.planPromocion}
                          </span>
                        ) : null}
                        {/* Precio */}
                        <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-lg shadow">
                          <span className="font-bold text-blue-600">{new Intl.NumberFormat('es-ES').format(anuncio.precio)} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors flex-1">
                            {anuncio.titulo}
                          </h3>
                          {anuncio.estado === 'En revisión' && (
                            <span className="text-xs text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full ml-2 flex-shrink-0">
                              ~30s
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                          <MapPin size={12} /> {anuncio.ubicacion}
                        </p>
                        
                        {/* Stats */}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <span className="flex items-center gap-1"><Eye size={12} /> {anuncio.vistas || 0}</span>
                          <span className="flex items-center gap-1"><Heart size={12} /> {anuncio.favoritos || 0}</span>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => window.location.href = `/ad/${anuncio.id}/edit`}
                            className="flex-1 py-2 px-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-medium text-gray-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <Edit3 size={14} /> Editar
                          </button>
                          <button 
                            onClick={() => window.location.href = `/ad/${anuncio.id}`}
                            className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-xs font-medium text-blue-700 transition-colors flex items-center justify-center gap-1"
                          >
                            <Eye size={14} /> Ver
                          </button>
                          {/* Botón de eliminar */}
                          <button 
                            onClick={async () => {
                              if (window.confirm('¿Estás seguro de que quieres eliminar este anuncio? Esta acción no se puede deshacer.')) {
                                try {
                                  const { deleteAnuncio } = await import('@/lib/anuncios.service');
                                  await deleteAnuncio(anuncio.id, user?.uid || '');
                                  setMisAnuncios(prev => prev.filter(a => a.id !== anuncio.id));
                                  toastSuccess('Anuncio eliminado', 'El anuncio ha sido eliminado correctamente');
                                } catch (error) {
                                  console.error('Error eliminando anuncio:', error);
                                  toastError('Error', 'No se pudo eliminar el anuncio');
                                }
                              }
                            }}
                            className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition-colors"
                            title="Eliminar anuncio"
                          >
                            <Trash2 size={16} />
                          </button>
                          {/* Botón de promoción - Activar o Desactivar */}
                          {anuncio.destacado ? (
                            <button 
                              onClick={async () => {
                                try {
                                  const { updateAnuncio } = await import('@/lib/anuncios.service');
                                  const { collection, query, where, getDocs, deleteDoc } = await import('firebase/firestore');
                                  const { db } = await import('@/lib/firebase');
                                  
                                  await updateAnuncio(anuncio.id, { 
                                    destacado: false, 
                                    planPromocion: null 
                                  });
                                  
                                  // Eliminar promoción de Firestore
                                  const promocionesRef = collection(db, 'promociones');
                                  const q = query(promocionesRef, where('anuncioId', '==', anuncio.id));
                                  const snapshot = await getDocs(q);
                                  for (const doc of snapshot.docs) {
                                    await deleteDoc(doc.ref);
                                  }
                                  
                                  // Devolver el anuncio al plan correspondiente
                                  const planDelAnuncio = planesActivos.find(p => p.tipo === anuncio.planPromocion);
                                  if (planDelAnuncio) {
                                    await actualizarPlan(planDelAnuncio.id, {
                                      anunciosDisponibles: planDelAnuncio.anunciosDisponibles + 1,
                                      anunciosUsados: Math.max(0, (planDelAnuncio.anunciosUsados || 0) - 1)
                                    });
                                    setPlanesActivos(prev => prev.map(p => 
                                      p.id === planDelAnuncio.id 
                                        ? { ...p, anunciosDisponibles: p.anunciosDisponibles + 1 }
                                        : p
                                    ));
                                  }
                                  
                                  // Actualizar estado local
                                  setMisAnuncios(prev => prev.map(a => 
                                    a.id === anuncio.id ? { ...a, destacado: false, planPromocion: null } : a
                                  ));
                                } catch (error) {
                                  console.error('Error desactivando promoción:', error);
                                }
                              }}
                              className={`p-2 rounded-lg transition-all ${
                                anuncio.planPromocion === 'VIP' 
                                  ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:shadow-lg' 
                                  : anuncio.planPromocion === 'Premium'
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-lg'
                              }`}
                              title="Desactivar promoción"
                            >
                              <Rocket size={16} />
                            </button>
                          ) : planesActivos.length > 0 && planesActivos.some(p => p.anunciosDisponibles > 0) ? (
                            <button 
                              onClick={async () => {
                                const planPrincipal = planesActivos.find(p => p.tipo === 'VIP' && p.anunciosDisponibles > 0) 
                                  || planesActivos.find(p => p.tipo === 'Premium' && p.anunciosDisponibles > 0)
                                  || planesActivos.find(p => p.tipo === 'Destacado' && p.anunciosDisponibles > 0);
                                
                                if (!planPrincipal) {
                                  toastWarning('Sin anuncios', 'No tienes anuncios disponibles en tus planes');
                                  return;
                                }
                                
                                try {
                                  const { updateAnuncio } = await import('@/lib/anuncios.service');
                                  const { collection, addDoc, Timestamp } = await import('firebase/firestore');
                                  const { db } = await import('@/lib/firebase');
                                  
                                  await updateAnuncio(anuncio.id, { 
                                    destacado: true, 
                                    planPromocion: planPrincipal.tipo 
                                  });
                                  await actualizarPlan(planPrincipal.id, {
                                    anunciosDisponibles: planPrincipal.anunciosDisponibles - 1,
                                    anunciosUsados: (planPrincipal.anunciosUsados || 0) + 1
                                  });
                                  
                                  // Crear documento de promoción en Firestore para que TODOS lo vean
                                  const fechaFin = new Date();
                                  fechaFin.setDate(fechaFin.getDate() + (planPrincipal.diasDuracion || 30));
                                  
                                  await addDoc(collection(db, 'promociones'), {
                                    anuncioId: anuncio.id,
                                    userId: user?.uid,
                                    tipo: planPrincipal.tipo,
                                    planId: planPrincipal.id,
                                    fechaInicio: Timestamp.now(),
                                    fechaFin: Timestamp.fromDate(fechaFin),
                                    activo: true
                                  });
                                  
                                  // Actualizar estado local
                                  const updatedAnuncios = misAnuncios.map(a => 
                                    a.id === anuncio.id ? { ...a, destacado: true, planPromocion: planPrincipal.tipo } : a
                                  );
                                  setMisAnuncios(updatedAnuncios);
                                  setPlanesActivos(prev => prev.map(p => 
                                    p.id === planPrincipal.id 
                                      ? { ...p, anunciosDisponibles: p.anunciosDisponibles - 1 }
                                      : p
                                  ));
                                } catch (error) {
                                  console.error('Error activando promoción:', error);
                                }
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                planesActivos.find(p => p.tipo === 'VIP' && p.anunciosDisponibles > 0)
                                  ? 'bg-pink-50 hover:bg-pink-100 text-pink-600'
                                  : planesActivos.find(p => p.tipo === 'Premium' && p.anunciosDisponibles > 0)
                                    ? 'bg-purple-50 hover:bg-purple-100 text-purple-600'
                                    : 'bg-yellow-50 hover:bg-yellow-100 text-yellow-600'
                              }`}
                              title="Activar promoción"
                            >
                              <Rocket size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleTabChange('promociones')}
                              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-400 transition-colors"
                              title="Comprar un plan para promocionar"
                            >
                              <Rocket size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Vista de Lista */
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.ad')}</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('profile.price')}</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('profile.views')}</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Favs</th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.status')}</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">{t('profile.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {misAnuncios.map((anuncio) => (
                        <tr key={anuncio.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <img 
                                src={anuncio.imagenes?.[0] || '/placeholder.jpg'} 
                                alt={anuncio.titulo}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                              <div className="min-w-0">
                                <p className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{anuncio.titulo}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin size={10} /> {anuncio.ubicacion}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <span className="font-bold text-blue-600">{new Intl.NumberFormat('es-ES').format(anuncio.precio)} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <span className="text-sm text-gray-600">{anuncio.vistas || 0}</span>
                          </td>
                          <td className="px-4 py-3 text-center hidden sm:table-cell">
                            <span className="text-sm text-gray-600">{anuncio.favoritos || 0}</span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {anuncio.estado === 'En revisión' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-white bg-amber-500">
                                <Clock size={10} />
                                {t('profile.inReview')}
                              </span>
                            ) : anuncio.destacado && anuncio.planPromocion ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full text-white ${
                                anuncio.planPromocion === 'VIP' ? 'bg-gradient-to-r from-pink-500 to-red-500' :
                                anuncio.planPromocion === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-blue-500' :
                                anuncio.planPromocion === 'Destacado' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                                'bg-blue-500'
                              }`}>
                                {anuncio.planPromocion === 'VIP' && <Crown size={10} />}
                                {anuncio.planPromocion === 'Premium' && <Star size={10} />}
                                {anuncio.planPromocion === 'Destacado' && <Award size={10} />}
                                {anuncio.planPromocion}
                              </span>
                            ) : !anuncio.destacado && anuncio.planPromocion ? (
                              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border-2 border-dashed ${
                                anuncio.planPromocion === 'VIP' ? 'border-pink-400 text-pink-500' :
                                anuncio.planPromocion === 'Premium' ? 'border-purple-400 text-purple-500' :
                                'border-yellow-400 text-yellow-600'
                              }`}>
                                {anuncio.planPromocion === 'VIP' && <Crown size={10} />}
                                {anuncio.planPromocion === 'Premium' && <Star size={10} />}
                                {anuncio.planPromocion === 'Destacado' && <Award size={10} />}
                                {t('profile.paused')}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">{t('profile.noPromotion')}</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => window.location.href = `/ad/${anuncio.id}/edit`}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                title={t('profile.editAction')}
                              >
                                <Edit3 size={16} className="text-gray-500" />
                              </button>
                              <button 
                                onClick={() => window.location.href = `/ad/${anuncio.id}`}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title={t('profile.viewAction')}
                              >
                                <Eye size={16} className="text-blue-500" />
                              </button>
                              {/* Botón de eliminar */}
                              <button 
                                onClick={async () => {
                                  if (window.confirm(t('profile.confirmDelete'))) {
                                    try {
                                      const { deleteAnuncio } = await import('@/lib/anuncios.service');
                                      await deleteAnuncio(anuncio.id, user?.uid || '');
                                      setMisAnuncios(prev => prev.filter(a => a.id !== anuncio.id));
                                      toastSuccess(t('profile.adDeleted'), t('profile.adDeletedDesc'));
                                    } catch (error) {
                                      console.error('Error eliminando anuncio:', error);
                                      toastError('Error', t('profile.errorDeleting'));
                                    }
                                  }
                                }}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title={t('profile.deleteAction')}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                              {/* Botón de promoción - Toggle Activar/Desactivar */}
                              {anuncio.destacado ? (
                                <button 
                                  onClick={async () => {
                                    // PAUSAR promoción (mantiene la info para poder reactivar)
                                    try {
                                      await updateAnuncio(anuncio.id, { 
                                        destacado: false
                                      } as any);
                                      
                                      setMisAnuncios(prev => prev.map(a => 
                                        a.id === anuncio.id ? { ...a, destacado: false } : a
                                      ));
                                      
                                      // Eliminar de promociones activas
                                      setPromocionesActivas(prev => prev.filter(p => p.anuncio.id !== anuncio.id));
                                      
                                      toastSuccess('Promoción pausada', `Haz clic en el cohete para reactivarla`);
                                    } catch (error) {
                                      console.error('Error pausando promoción:', error);
                                      toastError('Error', 'No se pudo pausar la promoción');
                                    }
                                  }}
                                  className={`p-2 rounded-lg transition-all ${
                                    anuncio.planPromocion === 'VIP' 
                                      ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white hover:shadow-md' 
                                      : anuncio.planPromocion === 'Premium'
                                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-md'
                                        : 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-md'
                                  }`}
                                  title="Pausar promoción"
                                >
                                  <Rocket size={16} />
                                </button>
                              ) : anuncio.planPromocion && anuncio.fechaPromocion ? (
                                // Tiene promoción pausada - reactivar directamente
                                <button 
                                  onClick={async () => {
                                    // Verificar si aún tiene tiempo restante
                                    const fechaInicio = new Date(anuncio.fechaPromocion);
                                    const diasTotales = anuncio.diasPromocion || 7;
                                    const fechaFin = new Date(fechaInicio);
                                    fechaFin.setDate(fechaFin.getDate() + diasTotales);
                                    const ahora = new Date();
                                    
                                    if (ahora > fechaFin) {
                                      // Expiró - abrir modal para comprar nueva
                                      toastWarning('Promoción expirada', 'Tu promoción ha expirado. Compra una nueva.');
                                      setAnuncioParaPromover(anuncio);
                                      setShowPromoverAnuncioModal(true);
                                      return;
                                    }
                                    
                                    // Reactivar
                                    try {
                                      await updateAnuncio(anuncio.id, { 
                                        destacado: true
                                      } as any);
                                      
                                      setMisAnuncios(prev => prev.map(a => 
                                        a.id === anuncio.id ? { ...a, destacado: true } : a
                                      ));
                                      
                                      toastSuccess('¡Promoción reactivada!', `"${anuncio.titulo}" vuelve a estar promocionado`);
                                    } catch (error) {
                                      console.error('Error reactivando promoción:', error);
                                      toastError('Error', 'No se pudo reactivar la promoción');
                                    }
                                  }}
                                  className={`p-2 rounded-lg transition-all border-2 border-dashed ${
                                    anuncio.planPromocion === 'VIP' 
                                      ? 'border-pink-400 text-pink-500 hover:bg-pink-50' 
                                      : anuncio.planPromocion === 'Premium'
                                        ? 'border-purple-400 text-purple-500 hover:bg-purple-50'
                                        : 'border-yellow-400 text-yellow-600 hover:bg-yellow-50'
                                  }`}
                                  title="Reactivar promoción"
                                >
                                  <Rocket size={16} />
                                </button>
                              ) : (
                                <button 
                                  onClick={() => {
                                    // Abrir modal de promocionar con este anuncio preseleccionado
                                    setAnuncioParaPromover(anuncio);
                                    setShowPromoverAnuncioModal(true);
                                  }}
                                  className="p-2 rounded-lg hover:bg-purple-50 text-gray-400 hover:text-purple-500 transition-colors"
                                  title="Promocionar anuncio"
                                >
                                  <Rocket size={16} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
                </>
              )}
            </div>
          ) : activeTab === 'favoritos' ? (
            /* Favoritos Tab */
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profile.totalSaved')}</p>
                      <p className="text-2xl font-bold text-gray-900">{anunciosFavoritos.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                      <Heart className="text-red-500" size={24} fill="currentColor" />
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profile.recentlyAdded')}</p>
                      <p className="text-2xl font-bold text-gray-900">{Math.min(3, anunciosFavoritos.length)}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Clock className="text-blue-500" size={24} />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">{t('profile.categories')}</p>
                      <p className="text-2xl font-bold text-gray-900">{new Set(anunciosFavoritos.map(a => a.categoria)).size}</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                      <Package className="text-purple-500" size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Barra de búsqueda */}
              {anunciosFavoritos.length > 0 && (
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder={t('profile.searchFavorites')}
                      value={searchFavoritos}
                      onChange={(e) => setSearchFavoritos(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Contenido */}
              {loadingFavoritos ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">{t('profile.loadingFavorites')}</p>
                </div>
              ) : anunciosFavoritos.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                  <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart className="text-red-400" size={48} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('profile.noFavoritesYet')}</h3>
                  <p className="text-gray-500 mb-8 max-w-md mx-auto">
                    {t('profile.noFavoritesDesc')}
                  </p>
                  <button 
                    onClick={() => window.location.href = '/'} 
                    className="px-8 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2"
                  >
                    <TrendingUp size={20} />
                    {t('profile.exploreAds')}
                  </button>
                </div>
              ) : (
                <>
                  {searchFavoritos && anunciosFavoritos.filter(a => 
                    a.titulo.toLowerCase().includes(searchFavoritos.toLowerCase()) ||
                    a.descripcion?.toLowerCase().includes(searchFavoritos.toLowerCase())
                  ).length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Search className="text-gray-400" size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.noResults')}</h3>
                      <p className="text-gray-500 mb-6">{t('profile.noResultsFor')} "{searchFavoritos}"</p>
                      <button 
                        onClick={() => setSearchFavoritos('')}
                        className="px-6 py-3 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-colors"
                      >
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className={
                      viewMode === 'grid' 
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                        : 'grid grid-cols-1 lg:grid-cols-2 gap-4'
                    }>
                      {anunciosFavoritos
                        .filter(a => 
                          !searchFavoritos || 
                          a.titulo.toLowerCase().includes(searchFavoritos.toLowerCase()) ||
                          a.descripcion?.toLowerCase().includes(searchFavoritos.toLowerCase())
                        )
                        .map(a => (
                          <div 
                            key={a.id} 
                            onClick={() => window.location.href = `/ad/${a.id}`}
                            className={`cursor-pointer transition-all duration-200 ${
                              viewMode === 'grid' 
                                ? 'transform hover:scale-[1.02]' 
                                : 'hover:translate-x-1'
                            }`}
                          >
                            <AnuncioCard
                              anuncio={a}
                              soloImagen={false}
                              compact={viewMode === 'grid'}
                              horizontal={viewMode === 'list'}
                              onToggleFavorito={async (id) => {
                                toggleFavoritoLocal(id);
                                if (user?.uid) {
                                  try {
                                    await syncLocalToRemote(user.uid);
                                    await toggleFavoritoRemoteWithNotification(user.uid, id);
                                  } catch (err) {
                                    console.error('Error sincronizando favorito:', err);
                                  }
                                }
                                setAnunciosFavoritos(prev => prev.filter(p => p.id !== id));
                              }}
                              esFavorito={true}
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : activeTab === 'mensajes' ? (
            /* Mensajes Tab - Split View */
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden -mt-8" style={{ height: 'calc(100vh - 120px)', minHeight: '600px' }}>
              <div className="flex h-full">
                {/* Panel izquierdo - Lista de conversaciones */}
                <div className={`${conversacionActiva ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-gray-100`}>
                  {/* Header compacto de conversaciones */}
                  <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <MessageCircle className="text-white" size={16} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900 text-sm">Conversaciones</h3>
                          <span className="text-xs bg-indigo-500 text-white px-2 py-0.5 rounded-full font-medium">
                            {conversaciones.length}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">Gestiona tus chats</p>
                      </div>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                      <input
                        type="text"
                        placeholder="Buscar..."
                        value={searchMensajes}
                        onChange={(e) => setSearchMensajes(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Lista de conversaciones */}
                  <div className="flex-1 overflow-y-auto">
                    {loadingMensajes ? (
                      <div className="p-8 text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                        <p className="text-gray-500 text-sm">Cargando...</p>
                      </div>
                    ) : conversaciones.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                          <MessageCircle className="text-indigo-500" size={28} />
                        </div>
                        <p className="text-gray-500 text-sm">No tienes conversaciones</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {conversaciones
                          .filter(conv => {
                            if (!searchMensajes) return true;
                            const otroUsuarioId = conv.participantes.find(p => p !== user?.uid);
                            const otroUsuario = otroUsuarioId ? usuariosConversaciones[otroUsuarioId] : null;
                            const anuncio = anunciosConversaciones[conv.anuncioId];
                            const searchLower = searchMensajes.toLowerCase();
                            return (
                              otroUsuario?.nombre?.toLowerCase().includes(searchLower) ||
                              anuncio?.titulo?.toLowerCase().includes(searchLower) ||
                              conv.ultimoMensaje?.toLowerCase().includes(searchLower)
                            );
                          })
                          .map(conv => {
                            const otroUsuarioId = conv.participantes.find(p => p !== user?.uid);
                            const otroUsuario = otroUsuarioId ? usuariosConversaciones[otroUsuarioId] : null;
                            const anuncio = anunciosConversaciones[conv.anuncioId];
                            const noLeidosKey = `noLeidos_${user?.uid}`;
                            const noLeidos = (conv as any)[noLeidosKey] || 0;
                            const isActive = conversacionActiva === conv.id;
                            
                            return (
                              <div
                                key={conv.id}
                                onClick={() => setConversacionActiva(conv.id)}
                                className={`p-4 cursor-pointer transition-all ${
                                  isActive 
                                    ? 'bg-indigo-50 border-l-4 border-indigo-500' 
                                    : noLeidos > 0 
                                      ? 'bg-indigo-50/30 hover:bg-gray-50' 
                                      : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className="relative flex-shrink-0">
                                    {anuncio?.imagenes?.[0] ? (
                                      <img
                                        src={anuncio.imagenes[0]}
                                        alt={anuncio.titulo}
                                        className="w-12 h-12 rounded-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                        {otroUsuario?.nombre?.[0]?.toUpperCase() || '?'}
                                      </div>
                                    )}
                                    {noLeidos > 0 && (
                                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {noLeidos}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className={`font-semibold text-sm truncate ${noLeidos > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                                        {otroUsuario?.nombre || 'Usuario'}
                                      </h4>
                                      <span className="text-xs text-gray-400">
                                        {conv.fechaUltimoMensaje.toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}
                                      </span>
                                    </div>
                                    <p className={`text-xs truncate mt-0.5 ${noLeidos > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                                      {conv.ultimoMensaje}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Panel derecho - Chat activo */}
                <div className={`${conversacionActiva ? 'flex' : 'hidden md:flex'} flex-col flex-1`}>
                  {!conversacionActiva ? (
                    /* Estado vacío - ninguna conversación seleccionada */
                    <div className="flex-1 flex flex-col bg-gray-50">
                      {/* Header informativo */}
                      <div className="p-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-2 text-gray-500">
                          <MessageCircle size={18} className="text-indigo-500" />
                          <span className="text-sm">Gestiona tus conversaciones con compradores y vendedores</span>
                        </div>
                      </div>
                      {/* Contenido central */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="text-center p-8">
                          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageCircle className="text-indigo-500" size={32} />
                          </div>
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">Selecciona una conversación</h4>
                          <p className="text-gray-500 text-sm max-w-sm">
                            Elige una conversación de la lista para ver los mensajes y responder.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Header del chat */}
                      {(() => {
                        const convActual = conversaciones.find(c => c.id === conversacionActiva);
                        const otroUsuarioId = convActual?.participantes.find(p => p !== user?.uid);
                        const otroUsuario = otroUsuarioId ? usuariosConversaciones[otroUsuarioId] : null;
                        const anuncio = convActual ? anunciosConversaciones[convActual.anuncioId] : null;
                        
                        return (
                          <div className="p-4 border-b border-gray-100 bg-white">
                            <div className="flex items-center gap-3">
                              {/* Botón volver en móvil */}
                              <button 
                                onClick={() => setConversacionActiva(null)}
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ChevronRight className="rotate-180 text-gray-600" size={20} />
                              </button>
                              
                              <div className="relative flex-shrink-0">
                                {anuncio?.imagenes?.[0] ? (
                                  <img
                                    src={anuncio.imagenes[0]}
                                    alt={anuncio.titulo}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
                                    {otroUsuario?.nombre?.[0]?.toUpperCase() || '?'}
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 truncate">{otroUsuario?.nombre || 'Usuario'}</h4>
                                {anuncio && (
                                  <p className="text-xs text-indigo-600 truncate">📦 {anuncio.titulo}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Área de mensajes */}
                      <div ref={mensajesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 scroll-smooth">
                        {loadingChat ? (
                          <div className="flex items-center justify-center h-full">
                            <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
                          </div>
                        ) : mensajesChat.length === 0 ? (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-400 text-sm">No hay mensajes aún. ¡Envía el primero!</p>
                          </div>
                        ) : (
                          mensajesChat.map((msg) => {
                            const esMio = msg.remitenteId === user?.uid;
                            return (
                              <div key={msg.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                  esMio 
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-br-md' 
                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                }`}>
                                  <p className="text-sm whitespace-pre-wrap">{msg.contenido}</p>
                                  <p className={`text-xs mt-1 ${esMio ? 'text-indigo-200' : 'text-gray-400'}`}>
                                    {msg.fecha.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}
                                    {esMio && msg.leido && <span className="ml-1">✓✓</span>}
                                  </p>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={mensajesEndRef} />
                      </div>

                      {/* Input de mensaje */}
                      <div className="p-4 border-t border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            value={nuevoMensaje}
                            onChange={(e) => setNuevoMensaje(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleEnviarMensaje()}
                            placeholder="Escribe un mensaje..."
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            disabled={enviandoMensaje}
                          />
                          <button
                            onClick={handleEnviarMensaje}
                            disabled={!nuevoMensaje.trim() || enviandoMensaje}
                            className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {enviandoMensaje ? (
                              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                            ) : (
                              <Send size={20} />
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : activeTab === 'soporte' ? (
            /* Soporte Tab - Mensajes de contacto con respuestas */
            <div className="space-y-4">
              {/* Header compacto y profesional */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Headphones className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Centru de Suport</h2>
                      <p className="text-sm text-gray-500">Mesajele tale către echipa noastră</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{mensajesSoporte.length}</p>
                      <p className="text-xs text-gray-500">Total</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-600">{mensajesSoporte.filter(m => m.estado === 'pendiente').length}</p>
                      <p className="text-xs text-gray-500">În așteptare</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{mensajesSoporte.filter(m => m.respondido).length}</p>
                      <p className="text-xs text-gray-500">Răspunse</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de mensajes */}
              {loadingSoporte ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 text-sm">Se încarcă mesajele...</p>
                </div>
              ) : mensajesSoporte.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                  <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Headphones className="w-7 h-7 text-gray-400" />
                  </div>
                  <h3 className="text-base font-medium text-gray-900 mb-1">Nu ai trimis mesaje</h3>
                  <p className="text-gray-500 text-sm mb-4">Când trimiți un mesaj prin formularul de contact, va apărea aici.</p>
                  <Link
                    href="/contacto"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                  >
                    <Send size={16} />
                    Contactează-ne
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {mensajesSoporte.map((mensaje) => (
                    <div
                      key={mensaje.id}
                      className={`bg-white rounded-xl border overflow-hidden transition-all ${
                        mensaje.respondido ? 'border-green-300' : 'border-gray-200'
                      }`}
                    >
                      {/* Header del mensaje */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                              mensaje.asunto === 'general' ? 'bg-blue-50' :
                              mensaje.asunto === 'technical' ? 'bg-purple-50' :
                              mensaje.asunto === 'account' ? 'bg-indigo-50' :
                              mensaje.asunto === 'payment' ? 'bg-green-50' :
                              mensaje.asunto === 'report' ? 'bg-red-50' :
                              mensaje.asunto === 'suggestion' ? 'bg-amber-50' :
                              'bg-gray-50'
                            }`}>
                              <span className="text-base">
                                {mensaje.asunto === 'general' ? '❓' :
                                 mensaje.asunto === 'technical' ? '🔧' :
                                 mensaje.asunto === 'account' ? '👤' :
                                 mensaje.asunto === 'payment' ? '💳' :
                                 mensaje.asunto === 'report' ? '⚠️' :
                                 mensaje.asunto === 'suggestion' ? '💡' :
                                 '📝'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 text-sm">
                                {mensaje.asunto === 'general' ? 'Întrebare generală' :
                                 mensaje.asunto === 'technical' ? 'Problemă tehnică' :
                                 mensaje.asunto === 'account' ? 'Contul meu' :
                                 mensaje.asunto === 'payment' ? 'Plăți și facturi' :
                                 mensaje.asunto === 'report' ? 'Raportare înșelătorie' :
                                 mensaje.asunto === 'suggestion' ? 'Sugestie' :
                                 'Altele'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                                  #{mensaje.numeroTicket}
                                </span>
                                <span className="text-xs text-gray-400">•</span>
                                <p className="text-xs text-gray-500">
                                  {mensaje.fecha.toLocaleDateString('ro-RO', { 
                                    day: 'numeric', 
                                    month: 'short', 
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                          <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                            mensaje.estado === 'pendiente' ? 'bg-amber-50 text-amber-700' :
                            mensaje.estado === 'en_proceso' ? 'bg-blue-50 text-blue-700' :
                            'bg-green-50 text-green-700'
                          }`}>
                            {mensaje.estado === 'pendiente' ? 'În așteptare' :
                             mensaje.estado === 'en_proceso' ? 'În procesare' :
                             'Rezolvat'}
                          </span>
                        </div>
                      </div>

                      {/* Contenido del mensaje */}
                      <div className="p-4">
                        <div className="bg-gray-50 rounded-lg p-3 mb-3">
                          <p className="text-xs text-gray-500 mb-1">Mesajul tău:</p>
                          <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensaje.mensaje}</p>
                        </div>

                        {/* Respuesta del admin */}
                        {mensaje.respondido && mensaje.respuesta ? (
                          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
                            <div className="flex items-center gap-1.5 text-green-700 text-xs font-medium mb-1">
                              <CheckCircle size={14} />
                              Răspuns de la suport
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{mensaje.respuesta}</p>
                            {mensaje.fechaRespuesta && (
                              <p className="text-xs text-gray-400 mt-2">
                                {mensaje.fechaRespuesta.toLocaleDateString('ro-RO', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-600 text-xs">
                            <Clock size={14} />
                            Așteptăm răspunsul...
                          </div>
                        )}

                        {/* Botón eliminar solo para mensajes resueltos */}
                        {mensaje.estado === 'resuelto' && (
                          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                            <button
                              onClick={async () => {
                                if (confirm('Sigur doriți să ștergeți acest mesaj?')) {
                                  try {
                                    await eliminarMensajeContacto(mensaje.id);
                                  } catch (error) {
                                    console.error('Error al eliminar mensaje:', error);
                                  }
                                }
                              }}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={14} />
                              Șterge mesajul
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : activeTab === 'facturas' ? (
            /* Facturas Tab */
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full blur-3xl"></div>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Receipt className="text-white" size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{t('profile.myInvoices')}</h2>
                      <p className="text-slate-400 text-sm">{t('profile.paymentHistory')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">{t('profile.totalInvoices')}</p>
                      <p className="text-2xl font-bold text-white">{facturas.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de facturas */}
              {loadingFacturas ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                </div>
              ) : facturas.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Receipt className="text-gray-400" size={32} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('profile.noInvoices')}</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto">
                    {t('profile.noInvoicesDesc')}
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.invoiceNumber')}</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.date')}</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.concept')}</th>
                          <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.totalAmount')}</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.status')}</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {facturas.map((factura) => (
                          <tr key={factura.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <span className="font-mono text-sm font-semibold text-gray-900">{factura.numero}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-gray-600">
                                {new Intl.DateTimeFormat('ro-RO', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                }).format(factura.fecha)}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{factura.concepto}</p>
                                <p className="text-xs text-gray-500">{factura.descripcion}</p>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <span className="text-lg font-bold text-gray-900">
                                {new Intl.NumberFormat('ro-RO', {
                                  style: 'currency',
                                  currency: 'EUR'
                                }).format(factura.total)}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                                factura.estado === 'pagada' 
                                  ? 'bg-emerald-100 text-emerald-700' 
                                  : factura.estado === 'pendiente'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : 'bg-red-100 text-red-700'
                              }`}>
                                {factura.estado === 'pagada' && <CheckCircle size={12} />}
                                {factura.estado === 'pagada' ? t('profile.paid') : factura.estado === 'pendiente' ? t('profile.pending') : t('profile.cancelled')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => previsualizarFactura(factura)}
                                  className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                  title={t('profile.viewInvoice')}
                                >
                                  <ExternalLink size={18} />
                                </button>
                                <button
                                  onClick={() => descargarFacturaPDF(factura)}
                                  className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                                  title={t('profile.downloadPdf')}
                                >
                                  <FileDown size={18} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Resumen */}
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div>
                          <p className="text-xs text-gray-500">{t('profile.totalBilled')}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('ro-RO', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(facturas.reduce((sum, f) => sum + f.total, 0))}
                          </p>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div>
                          <p className="text-xs text-gray-500">{t('profile.vatIncluded')}</p>
                          <p className="text-lg font-bold text-gray-900">
                            {new Intl.NumberFormat('ro-RO', {
                              style: 'currency',
                              currency: 'EUR'
                            }).format(facturas.reduce((sum, f) => sum + f.ivaImporte, 0))}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {facturas.length} {facturas.length === 1 ? t('profile.invoiceInTotal') : t('profile.invoicesInTotal')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : activeTab === 'bonificaciones' ? (
            /* Bonificaciones Tab */
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-300 rounded-full blur-3xl"></div>
                </div>
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                      <Gift className="text-white" size={28} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">Mis Bonificaciones</h2>
                      <p className="text-emerald-100 text-sm">Recompensas y regalos especiales</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-emerald-100 text-xs">Activas</p>
                      <p className="text-3xl font-bold text-white">
                        {bonificacionesUsuario.filter(b => b.estado === 'activa').length}
                      </p>
                    </div>
                    {bonificacionesNoLeidas > 0 && (
                      <div className="px-4 py-2 bg-yellow-400 text-yellow-900 rounded-xl font-bold text-sm flex items-center gap-2">
                        <Sparkles size={16} />
                        {bonificacionesNoLeidas} {bonificacionesNoLeidas === 1 ? 'nueva' : 'nuevas'}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🎁 SECCIÓN DE CRÉDITOS DIARIOS */}
              <div className={`bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500 rounded-2xl p-6 relative overflow-hidden shadow-lg transition-all duration-500 ${mostrarAnimacionCreditos ? 'scale-105' : ''}`}>
                {/* Animación de brillo */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/30 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-yellow-300/40 rounded-full blur-2xl"></div>
                  {mostrarAnimacionCreditos && (
                    <div className="absolute inset-0 bg-white/30 animate-ping"></div>
                  )}
                </div>
                
                <div className="relative">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Info de puntos */}
                    <div className="flex items-center gap-4">
                      <div className={`w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center transition-transform ${puedeReclamar ? 'animate-bounce' : ''}`}>
                        <span className="text-3xl">💰</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          Puntos Diarios
                          {puedeReclamar && (
                            <span className="px-2 py-0.5 bg-white/30 text-white text-xs font-bold rounded-full animate-pulse">
                              ¡DISPONIBLE!
                            </span>
                          )}
                        </h3>
                        <p className="text-amber-100 text-sm">
                          {puedeReclamar 
                            ? `¡Reclama ${configCreditos.creditosPorDia} puntos gratis hoy!`
                            : `Vuelve en ${horasParaReclamar}h para reclamar más`
                          }
                        </p>
                      </div>
                    </div>
                    
                    {/* Saldo actual */}
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 text-center min-w-[120px]">
                        <p className="text-amber-100 text-xs mb-1">Tu saldo</p>
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-3xl">🪙</span>
                          <span className="text-3xl font-black text-white">
                            {loadingCreditos ? '...' : (creditosUsuario?.saldo || 0)}
                          </span>
                        </div>
                      </div>
                      
                      {/* Botón reclamar */}
                      <button
                        onClick={async () => {
                          if (!user?.uid || !puedeReclamar || reclamandoCreditos) return;
                          
                          setReclamandoCreditos(true);
                          try {
                            const resultado = await reclamarCreditosDiarios(user.uid, configCreditos.creditosPorDia);
                            
                            if (resultado.success) {
                              setMostrarAnimacionCreditos(true);
                              setTimeout(() => setMostrarAnimacionCreditos(false), 1000);
                              
                              setCreditosUsuario(prev => prev ? {
                                ...prev,
                                saldo: resultado.nuevoSaldo || prev.saldo + configCreditos.creditosPorDia
                              } : {
                                usuarioId: user.uid,
                                saldo: resultado.nuevoSaldo || configCreditos.creditosPorDia,
                                ultimoReclamo: new Date(),
                                totalReclamado: configCreditos.creditosPorDia,
                                historialReclamos: []
                              });
                              
                              setPuedeReclamar(false);
                              setHorasParaReclamar(24);
                              
                              toastPoints('¡Puntos Reclamados!', `${resultado.mensaje} • Nuevo saldo: ${resultado.nuevoSaldo} puntos`);
                            } else {
                              toastError('No disponible', resultado.mensaje);
                            }
                          } catch (error) {
                            console.error('Error reclamando puntos:', error);
                            toastError('Error', 'No se pudieron reclamar los puntos. Inténtalo de nuevo.');
                          } finally {
                            setReclamandoCreditos(false);
                          }
                        }}
                        disabled={!puedeReclamar || reclamandoCreditos}
                        className={`px-6 py-4 rounded-xl font-bold text-lg transition-all flex items-center gap-2 ${
                          puedeReclamar
                            ? 'bg-white text-orange-600 hover:bg-yellow-50 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer'
                            : 'bg-white/20 text-white/70 cursor-not-allowed'
                        }`}
                      >
                        {reclamandoCreditos ? (
                          <>
                            <div className="animate-spin w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full"></div>
                            Reclamando...
                          </>
                        ) : puedeReclamar ? (
                          <>
                            <Sparkles size={20} />
                            ¡Reclamar Gratis!
                          </>
                        ) : (
                          <>
                            <Clock size={20} />
                            {horasParaReclamar}h restantes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Info adicional sobre créditos */}
                  <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-lg">📅</span>
                      <div>
                        <p className="text-white text-xs font-semibold">Diario</p>
                        <p className="text-amber-100 text-xs">{configCreditos.creditosPorDia} puntos/día</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-lg">💵</span>
                      <div>
                        <p className="text-white text-xs font-semibold">Valor</p>
                        <p className="text-amber-100 text-xs">1 punto = {configCreditos.valorPuntosEnEuros.toFixed(2)}€</p>
                      </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center gap-2">
                      <span className="text-lg">💎</span>
                      <div>
                        <p className="text-white text-xs font-semibold">{t('profile.totalClaimed')}</p>
                        <p className="text-amber-100 text-xs">{creditosUsuario?.totalReclamado || 0} puntos</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 🛒 TIENDA DE ANUNCIOS CON PUNTOS */}
              <div className="bg-white rounded-2xl shadow-lg border-2 border-purple-100 overflow-hidden">
                {/* Header de la tienda */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <span className="text-2xl">🏪</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Tienda de Anuncios</h3>
                        <p className="text-purple-200 text-sm">Canjea tus puntos por anuncios extras</p>
                      </div>
                    </div>
                    <div className="text-right bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2">
                      <p className="text-purple-200 text-xs">Puedes comprar</p>
                      <p className="text-2xl font-black text-white">
                        {calcularAnunciosConPuntos(creditosUsuario?.saldo || 0, configCreditos)} anuncios
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Contenido de la tienda */}
                <div className="p-6">
                  {/* Info de precios */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 mb-6">
                    <div className="flex flex-wrap items-center justify-center gap-6">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Precio por anuncio</p>
                        <p className="text-2xl font-black text-purple-600">{configCreditos.precioAnuncioEnEuros}€</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">=</p>
                        <p className="text-2xl font-bold text-gray-400">=</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">En puntos</p>
                        <p className="text-2xl font-black text-amber-600">
                          {calcularPuntosPorAnuncios(1, configCreditos)} puntos
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Selector de cantidad */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      ¿Cuántos anuncios quieres? (máx. {configCreditos.maxAnunciosPorCanje})
                    </label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {[1, 2, 3, 5, 10].filter(n => n <= configCreditos.maxAnunciosPorCanje).map(num => (
                        <button
                          key={num}
                          onClick={() => setCantidadAnunciosACanjear(num)}
                          className={`px-5 py-3 rounded-xl font-bold transition-all ${
                            cantidadAnunciosACanjear === num
                              ? 'bg-purple-600 text-white shadow-lg scale-105'
                              : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                    
                    {/* Slider para cantidad personalizada */}
                    <input
                      type="range"
                      min="1"
                      max={configCreditos.maxAnunciosPorCanje}
                      value={cantidadAnunciosACanjear}
                      onChange={(e) => setCantidadAnunciosACanjear(parseInt(e.target.value))}
                      className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                    />
                  </div>
                  
                  {/* Resumen del canje */}
                  <div className="bg-gray-50 rounded-xl p-5 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Anuncios</p>
                        <p className="text-3xl font-black text-purple-600">{cantidadAnunciosACanjear}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Puntos necesarios</p>
                        <p className="text-3xl font-black text-amber-600">
                          {calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs mb-1">Valor en €</p>
                        <p className="text-3xl font-black text-green-600">
                          {(cantidadAnunciosACanjear * configCreditos.precioAnuncioEnEuros).toFixed(2)}€
                        </p>
                      </div>
                    </div>
                    
                    {/* Barra de progreso de puntos */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-500 mb-1">
                        <span>Tus puntos: {creditosUsuario?.saldo || 0}</span>
                        <span>Necesitas: {calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos)}</span>
                      </div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-500 ${
                            (creditosUsuario?.saldo || 0) >= calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos)
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                              : 'bg-gradient-to-r from-amber-400 to-orange-500'
                          }`}
                          style={{ 
                            width: `${Math.min(100, ((creditosUsuario?.saldo || 0) / calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      {(creditosUsuario?.saldo || 0) < calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos) && (
                        <p className="text-xs text-orange-600 mt-2 flex items-center gap-1">
                          <Clock size={12} />
                          Te faltan {calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos) - (creditosUsuario?.saldo || 0)} puntos
                          (≈{Math.ceil((calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos) - (creditosUsuario?.saldo || 0)) / configCreditos.creditosPorDia)} días)
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón de canjear */}
                  <button
                    onClick={async () => {
                      if (!user?.uid || canjeandoAnuncios) return;
                      
                      const puntosNecesarios = calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos);
                      
                      if ((creditosUsuario?.saldo || 0) < puntosNecesarios) {
                        toastWarning('Puntos insuficientes', `Tienes ${creditosUsuario?.saldo || 0} puntos. Necesitas ${puntosNecesarios} puntos.`);
                        return;
                      }
                      
                      setCanjeandoAnuncios(true);
                      try {
                        const resultado = await comprarAnunciosConPuntos(user.uid, cantidadAnunciosACanjear, configCreditos);
                        
                        if (resultado.success) {
                          // Actualizar saldo local
                          setCreditosUsuario(prev => prev ? {
                            ...prev,
                            saldo: resultado.saldoRestante || 0
                          } : null);
                          
                          // TODO: Aquí deberías también añadir los anuncios al plan del usuario
                          // Por ahora solo mostramos el mensaje de éxito
                          
                          toastGift('¡Canje exitoso!', `${resultado.mensaje} • Saldo restante: ${resultado.saldoRestante} puntos`);
                        } else {
                          toastError('Error en el canje', resultado.mensaje);
                        }
                      } catch (error) {
                        console.error('Error canjeando anuncios:', error);
                        toastError('Error', 'No se pudo procesar el canje. Inténtalo de nuevo.');
                      } finally {
                        setCanjeandoAnuncios(false);
                      }
                    }}
                    disabled={(creditosUsuario?.saldo || 0) < calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos) || canjeandoAnuncios}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                      (creditosUsuario?.saldo || 0) >= calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos)
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl hover:scale-[1.02]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canjeandoAnuncios ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Procesando...
                      </>
                    ) : (creditosUsuario?.saldo || 0) >= calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos) ? (
                      <>
                        <span className="text-xl">🛒</span>
                        Canjear {cantidadAnunciosACanjear} anuncio{cantidadAnunciosACanjear > 1 ? 's' : ''} por {calcularPuntosPorAnuncios(cantidadAnunciosACanjear, configCreditos)} puntos
                      </>
                    ) : (
                      <>
                        <span className="text-xl">🔒</span>
                        Puntos insuficientes
                      </>
                    )}
                  </button>
                  
                  {/* Info adicional */}
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Los anuncios canjeados se añaden a tu plan activo y tienen la misma duración.
                  </p>
                </div>
              </div>

              {/* Lista de bonificaciones */}
              {loadingBonificaciones ? (
                <div className="flex items-center justify-center py-20">
                  <div className="animate-spin w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full"></div>
                </div>
              ) : bonificacionesUsuario.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Gift className="text-emerald-500" size={40} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No tienes bonificaciones</h3>
                  <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
                    Cuando recibas una bonificación especial, aparecerá aquí. ¡Sigue participando en la plataforma para obtener recompensas!
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      <Star size={14} className="text-yellow-500" />
                      Recompensas por fidelidad
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      <Gift size={14} className="text-emerald-500" />
                      Regalos de bienvenida
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
                      <Sparkles size={14} className="text-purple-500" />
                      Promociones especiales
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {bonificacionesUsuario.map((bonif) => (
                    <div 
                      key={bonif.id} 
                      className={`bg-white rounded-2xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${
                        !bonif.leida ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-gray-100'
                      }`}
                      onClick={async () => {
                        if (!bonif.leida && bonif.id) {
                          try {
                            // Marcar como leída en Firebase
                            await marcarBonificacionLeida(bonif.id);
                            // Actualizar estado local
                            setBonificacionesUsuario(prev => 
                              prev.map(b => b.id === bonif.id ? {...b, leida: true} : b)
                            );
                            setBonificacionesNoLeidas(prev => Math.max(0, prev - 1));
                          } catch (error) {
                            console.error('Error al marcar como leída:', error);
                          }
                        }
                      }}
                    >
                      {/* Badge de no leída */}
                      {!bonif.leida && (
                        <div className="bg-gradient-to-r from-emerald-500 to-green-500 px-4 py-1.5 text-white text-xs font-bold flex items-center gap-2">
                          <Sparkles size={12} />
                          ¡Nueva bonificación!
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icono del tipo */}
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            bonif.tipo === 'dias' ? 'bg-blue-100' :
                            bonif.tipo === 'anuncios' ? 'bg-purple-100' :
                            bonif.tipo === 'promocion_gratis' ? 'bg-pink-100' :
                            bonif.tipo === 'descuento' ? 'bg-green-100' :
                            'bg-indigo-100'
                          }`}>
                            {bonif.tipo === 'dias' && <Calendar className="text-blue-600" size={24} />}
                            {bonif.tipo === 'anuncios' && <FileText className="text-purple-600" size={24} />}
                            {bonif.tipo === 'promocion_gratis' && <Sparkles className="text-pink-600" size={24} />}
                            {bonif.tipo === 'descuento' && <Tag className="text-green-600" size={24} />}
                            {bonif.tipo === 'regalo' && <Gift className="text-indigo-600" size={24} />}
                          </div>
                          
                          {/* Contenido */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-bold text-gray-900 text-lg">
                                  {bonif.tipo === 'dias' ? '¡Días Extra!' :
                                   bonif.tipo === 'anuncios' ? '¡Anuncios Extra!' :
                                   bonif.tipo === 'promocion_gratis' ? '¡Promoción Gratis!' :
                                   bonif.tipo === 'descuento' ? '¡Descuento Especial!' :
                                   '¡Regalo Especial!'}
                                </h4>
                                <p className="text-gray-600 text-sm mt-1">{bonif.motivo}</p>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                bonif.estado === 'activa' ? 'bg-green-100 text-green-700' :
                                bonif.estado === 'usada' ? 'bg-blue-100 text-blue-700' :
                                bonif.estado === 'expirada' ? 'bg-gray-100 text-gray-600' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {bonif.estado === 'activa' ? '✓ Activa' :
                                 bonif.estado === 'usada' ? 'Usada' :
                                 bonif.estado === 'expirada' ? 'Expirada' : 'Cancelada'}
                              </span>
                            </div>
                            
                            {/* Valor de la bonificación */}
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl mt-2 ${
                              bonif.tipo === 'dias' ? 'bg-blue-50 text-blue-700' :
                              bonif.tipo === 'anuncios' ? 'bg-purple-50 text-purple-700' :
                              bonif.tipo === 'promocion_gratis' ? 'bg-pink-50 text-pink-700' :
                              bonif.tipo === 'descuento' ? 'bg-green-50 text-green-700' :
                              'bg-indigo-50 text-indigo-700'
                            }`}>
                              <span className="text-2xl font-black">
                                {bonif.tipo === 'descuento' ? `${bonif.porcentajeDescuento}%` :
                                 bonif.tipo === 'promocion_gratis' ? bonif.planTipo || 'Promoción' :
                                 `+${bonif.cantidad}`}
                              </span>
                              <span className="font-medium">
                                {bonif.tipo === 'dias' ? 'días extra' :
                                 bonif.tipo === 'anuncios' ? 'anuncios' :
                                 bonif.tipo === 'descuento' ? 'de descuento' :
                                 bonif.tipo === 'promocion_gratis' ? 'gratis' : ''}
                              </span>
                            </div>
                            
                            {/* Código promocional si existe */}
                            {bonif.codigoPromo && (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                <p className="text-xs text-gray-500 mb-1">Tu código:</p>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-lg font-bold text-gray-900">{bonif.codigoPromo}</span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      navigator.clipboard.writeText(bonif.codigoPromo || '');
                                      toastSuccess('Copiado', '¡Código copiado al portapapeles!');
                                    }}
                                    className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                                    title="Copiar código"
                                  >
                                    <FileText size={14} className="text-gray-500" />
                                  </button>
                                </div>
                              </div>
                            )}
                            
                            {/* Fechas */}
                            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <Calendar size={12} />
                                <span>Recibida: {bonif.fechaCreacion?.toLocaleDateString?.() || 'N/A'}</span>
                              </div>
                              {bonif.fechaExpiracion && (
                                <div className="flex items-center gap-1">
                                  <Clock size={12} />
                                  <span>Expira: {bonif.fechaExpiracion?.toLocaleDateString?.() || 'Sin fecha'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Botón de usar (solo si está activa) */}
                        {bonif.estado === 'activa' && (
                          <div className="mt-4 pt-4 border-t border-gray-100">
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!user?.uid || !bonif.id) return;
                                
                                // Usar bonificación a través de Firebase
                                try {
                                  const resultado = await usarBonificacion(bonif.id, user.uid);
                                  
                                  if (resultado.success) {
                                    // Actualizar estado local
                                    setBonificacionesUsuario(prev => 
                                      prev.map(b => b.id === bonif.id ? {...b, estado: 'usada'} : b)
                                    );
                                    
                                    // Mensaje de éxito
                                    toastGift('¡Bonificación activada!', resultado.mensaje);
                                    
                                    // Si es descuento, ir a promociones
                                    if (bonif.tipo === 'descuento') {
                                      handleTabChange('promociones');
                                    }
                                  } else {
                                    toastError('No se pudo usar', resultado.mensaje);
                                  }
                                } catch (error) {
                                  console.error('Error al usar bonificación:', error);
                                  toastError('Error', 'No se pudo procesar la bonificación. Inténtalo de nuevo.');
                                }
                              }}
                              className={`w-full py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.01] hover:shadow-lg flex items-center justify-center gap-2 ${
                                bonif.tipo === 'dias' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                                bonif.tipo === 'anuncios' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                                bonif.tipo === 'promocion_gratis' ? 'bg-gradient-to-r from-pink-500 to-pink-600' :
                                bonif.tipo === 'descuento' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                'bg-gradient-to-r from-indigo-500 to-indigo-600'
                              }`}
                            >
                              <CheckCircle size={18} />
                              {bonif.tipo === 'descuento' ? 'Ir a Promociones' : 'Usar Bonificación'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Info adicional */}
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                <h4 className="font-bold text-emerald-900 mb-3 flex items-center gap-2">
                  <Gift size={18} />
                  ¿Cómo funcionan las bonificaciones?
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-emerald-600">1</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">Recíbelas</h5>
                    <p className="text-xs text-gray-600">Te notificaremos cuando recibas una nueva bonificación.</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-emerald-600">2</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">Revísalas</h5>
                    <p className="text-xs text-gray-600">Consulta los detalles y la fecha de expiración.</p>
                  </div>
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-2">
                      <span className="text-lg font-bold text-emerald-600">3</span>
                    </div>
                    <h5 className="font-semibold text-gray-900 text-sm mb-1">Úsalas</h5>
                    <p className="text-xs text-gray-600">Haz clic en "Usar Bonificación" antes de que expire.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Promociones Tab - Nuevo sistema simplificado */
            <div className="space-y-6">
              {/* Tabla de Anuncios Promovidos */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <Rocket className="text-white" size={24} />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">{t('profile.myPromotedAds')}</h2>
                        <p className="text-white/80 text-sm mt-1">
                          {promocionesActivas.length} {promocionesActivas.length === 1 ? t('profile.activePromotion') : t('profile.activePromotionsPlural')}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowPromoverAnuncioModal(true)}
                      className="px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all inline-flex items-center gap-2 border border-white/30"
                    >
                      <Rocket size={18} />
                      {t('profile.promoteAd')}
                    </button>
                  </div>
                </div>

                {/* Tabla */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.ad')}</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.plan')}</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.views')}</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.duration')}</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.performance')}</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.status')}</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">{t('profile.actions')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {promocionesActivas.length > 0 ? 
                        promocionesActivas.map((promo, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            {/* Anuncio */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-4">
                                {promo.anuncio?.imagenes && promo.anuncio.imagenes[0] && (
                                  <img 
                                    src={promo.anuncio.imagenes[0]} 
                                    alt={promo.anuncio.titulo}
                                    className="w-16 h-16 object-cover rounded-lg shadow-sm"
                                  />
                                )}
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1">
                                    {promo.anuncio?.titulo || t('profile.noTitle')}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">{promo.anuncio?.categoria || t('profile.noCategory')}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <span className="text-sm font-bold text-purple-600">{promo.anuncio?.precio || 0}€</span>
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Plan */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                {promo.tipo === 'Premium' && <Star className="text-purple-600" size={18} />}
                                {promo.tipo === 'VIP' && <Crown className="text-pink-600" size={18} />}
                                {promo.tipo === 'Destacado' && <Award className="text-yellow-600" size={18} />}
                                {promo.tipo === 'Básico' && <Rocket className="text-blue-600" size={18} />}
                                <div>
                                  <div className="font-bold text-sm text-gray-900">{promo.tipo}</div>
                                  <div className="text-xs text-gray-500">{promo.totalAnuncios || 1} {(promo.totalAnuncios || 1) === 1 ? t('profile.adCount') : t('profile.adsCount')}</div>
                                </div>
                              </div>
                            </td>

                            {/* Vistas */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-blue-600">
                                  <Eye size={16} />
                                  <span className="font-bold text-lg">{promo.vistas || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500 mt-0.5">{t('profile.viewsCount')}</span>
                              </div>
                            </td>

                            {/* Duración */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-purple-600">
                                  <Clock size={16} />
                                  <span className="font-bold text-lg">{promo.diasRestantes || promo.diasDuracion || 0}</span>
                                </div>
                                <span className="text-xs text-gray-500 mt-0.5">{t('profile.daysRemainingTable')}</span>
                              </div>
                            </td>

                            {/* Rendimiento */}
                            <td className="px-6 py-4 text-center">
                              <div className="flex flex-col items-center">
                                <div className="flex items-center gap-1.5 text-green-600">
                                  <TrendingUp size={16} />
                                  <span className="font-bold text-lg">+{promo.rendimiento || 150}%</span>
                                </div>
                                <span className="text-xs text-gray-500 mt-0.5">{t('profile.increase')}</span>
                              </div>
                            </td>

                            {/* Estado */}
                            <td className="px-6 py-4 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-full">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs font-semibold text-green-700">{t('profile.activeStatus')}</span>
                              </div>
                            </td>

                            {/* Acciones */}
                            <td className="px-6 py-4 text-center">
                              <button
                                onClick={() => setPromocionDetalleModal(promo)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all"
                              >
                                <Eye size={14} />
                                {t('profile.viewDetails')}
                              </button>
                            </td>
                          </tr>
                        ))
                      : 
                        <tr>
                          <td colSpan={7} className="px-6 py-12">
                            <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
                              {/* Icono animado */}
                              <div className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6 bg-gradient-to-br from-purple-100 to-blue-100">
                                <Rocket className="text-purple-500 animate-bounce" size={48} />
                              </div>
                              
                              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('profile.noPromotedAdsYet')}</h3>
                              <p className="text-gray-600 text-center mb-6">
                                {t('profile.promoteAdsDescription')}
                              </p>
                              
                              {/* Botón */}
                              <button 
                                onClick={() => setShowPromoverAnuncioModal(true)}
                                className="px-8 py-3.5 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all inline-flex items-center gap-2 bg-gradient-to-r from-purple-500 to-blue-500"
                              >
                                <Rocket size={20} />
                                Promocionar un Anuncio
                              </button>
                            </div>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>

                {/* Resumen al pie */}
                {promocionesActivas.length > 0 && (
                  <div className="bg-gray-50 px-8 py-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">
                          {promocionesActivas.length}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{t('profile.totalPromotions')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {promocionesActivas.reduce((sum, p) => sum + (p.vistas || 0), 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{t('profile.totalViews')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {promocionesActivas.reduce((sum, p) => sum + (p.precio || 0), 0)}€
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{t('profile.totalInvestment')}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-600">
                          +{promocionesActivas.length > 0 ? Math.floor((promocionesActivas.reduce((sum, p) => sum + (p.vistas || 0), 0) / promocionesActivas.length / 10) || 0) : 0}%
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{t('profile.avgIncrease')}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">{t('profile.promotionStats')}</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      {t('profile.promotedAds')}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">5x</div>
                        <div className="text-xs text-gray-600">{t('profile.moreViews')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-blue-600">3x</div>
                        <div className="text-xs text-gray-600">{t('profile.faster')}</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">85%</div>
                        <div className="text-xs text-gray-600">{t('profile.successRate')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Detalles de Promoción */}
        {promocionDetalleModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPromocionDetalleModal(null)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              {/* Header con imagen */}
              <div className={`relative h-48 ${
                promocionDetalleModal.tipo === 'VIP' ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-red-500' :
                promocionDetalleModal.tipo === 'Premium' ? 'bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500' :
                'bg-gradient-to-br from-yellow-400 via-orange-500 to-amber-500'
              }`}>
                {promocionDetalleModal.anuncio?.imagenes?.[0] && (
                  <img 
                    src={promocionDetalleModal.anuncio.imagenes[0]} 
                    alt={promocionDetalleModal.anuncio.titulo}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <button 
                  onClick={() => setPromocionDetalleModal(null)}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
                >
                  <X size={20} />
                </button>
                <div className="absolute bottom-4 left-6 right-6">
                  <div className="flex items-center gap-2 mb-2">
                    {promocionDetalleModal.tipo === 'VIP' && <Crown className="text-white" size={24} />}
                    {promocionDetalleModal.tipo === 'Premium' && <Star className="text-white" size={24} />}
                    {promocionDetalleModal.tipo === 'Destacado' && <Award className="text-white" size={24} />}
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold">
                      Plan {promocionDetalleModal.tipo}
                    </span>
                    <span className="px-3 py-1 bg-green-500/80 backdrop-blur-sm rounded-full text-white text-xs font-bold flex items-center gap-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      Activo
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-white line-clamp-2">{promocionDetalleModal.anuncio?.titulo || 'Sin título'}</h2>
                </div>
              </div>

              {/* Contenido */}
              <div className="p-6 space-y-6">
                {/* Info del anuncio */}
                <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                  {promocionDetalleModal.anuncio?.imagenes?.[0] && (
                    <img 
                      src={promocionDetalleModal.anuncio.imagenes[0]} 
                      alt=""
                      className="w-20 h-20 object-cover rounded-lg shadow-md"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-lg truncate">{promocionDetalleModal.anuncio?.titulo}</h3>
                    <p className="text-sm text-gray-500">{promocionDetalleModal.anuncio?.categoria}</p>
                    <p className="text-xl font-bold text-purple-600 mt-1">
                      {promocionDetalleModal.anuncio?.precio?.toLocaleString() || 0} {promocionDetalleModal.anuncio?.moneda === 'LEI' ? 'Lei' : '€'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1 font-mono flex items-center gap-1">
                      <Tag size={10} />
                      ID: {promocionDetalleModal.anuncio?.id?.slice(0, 12)}...
                    </p>
                  </div>
                </div>

                {/* Estadísticas de la promoción */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <BarChart3 size={18} className="text-purple-600" />
                    {t('profile.promotionStatsTitle')}
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-blue-50 rounded-xl p-4 text-center border border-blue-100">
                      <Eye className="text-blue-600 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold text-blue-700">{promocionDetalleModal.vistas || promocionDetalleModal.anuncio?.vistas || 0}</p>
                      <p className="text-xs text-blue-600">{t('profile.totalViews')}</p>
                    </div>
                    <div className="bg-red-50 rounded-xl p-4 text-center border border-red-100">
                      <Heart className="text-red-500 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold text-red-600">{promocionDetalleModal.anuncio?.favoritos || 0}</p>
                      <p className="text-xs text-red-500">{t('profile.favorites')}</p>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 text-center border border-purple-100">
                      <Clock className="text-purple-600 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold text-purple-700">{promocionDetalleModal.diasRestantes || promocionDetalleModal.diasDuracion || 0}</p>
                      <p className="text-xs text-purple-600">{t('profile.daysLeft')}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4 text-center border border-green-100">
                      <TrendingUp className="text-green-600 mx-auto mb-2" size={24} />
                      <p className="text-2xl font-bold text-green-700">+{Math.floor((promocionDetalleModal.vistas || 100) * 2.5)}%</p>
                      <p className="text-xs text-green-600">{t('profile.increase')}</p>
                    </div>
                  </div>
                </div>

                {/* Detalles de la promoción */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Info size={18} className="text-gray-600" />
                    {t('profile.promotionDetails')}
                  </h4>
                  <div className="bg-gray-50 rounded-xl divide-y divide-gray-200">
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">{t('profile.planTypeLabel')}</span>
                      <span className={`font-bold ${
                        promocionDetalleModal.tipo === 'VIP' ? 'text-pink-600' :
                        promocionDetalleModal.tipo === 'Premium' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`}>{promocionDetalleModal.tipo}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">{t('profile.activationDate')}</span>
                      <span className="font-medium text-gray-900">
                        {promocionDetalleModal.fechaInicio ? new Date(promocionDetalleModal.fechaInicio).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">{t('profile.expirationDate')}</span>
                      <span className="font-medium text-gray-900">
                        {promocionDetalleModal.fechaExpiracion ? new Date(promocionDetalleModal.fechaExpiracion).toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">{t('profile.totalDuration')}</span>
                      <span className="font-medium text-gray-900">{promocionDetalleModal.diasDuracion || 7} {t('profile.days')}</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">{t('profile.searchPriority')}</span>
                      <span className={`font-bold ${
                        promocionDetalleModal.tipo === 'VIP' ? 'text-pink-600' :
                        promocionDetalleModal.tipo === 'Premium' ? 'text-purple-600' :
                        'text-yellow-600'
                      }`}>
                        {promocionDetalleModal.tipo === 'VIP' ? t('profile.maximum') :
                         promocionDetalleModal.tipo === 'Premium' ? t('profile.high') : t('profile.medium')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <span className="text-sm text-gray-600">{t('profile.visibilityBoost')}</span>
                      <span className="font-bold text-green-600">
                        {promocionDetalleModal.tipo === 'VIP' ? '+500%' :
                         promocionDetalleModal.tipo === 'Premium' ? '+300%' : '+150%'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Beneficios del plan */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles size={18} className="text-yellow-500" />
                    {t('profile.activeBenefits')}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {promocionDetalleModal.tipo === 'VIP' && (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                          <CheckCircle className="text-pink-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.firstPosition')}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                          <CheckCircle className="text-pink-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.vipLabel')}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                          <CheckCircle className="text-pink-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.mainCarousel')}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-pink-50 rounded-lg border border-pink-100">
                          <CheckCircle className="text-pink-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.notifyInterested')}</span>
                        </div>
                      </>
                    )}
                    {promocionDetalleModal.tipo === 'Premium' && (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <CheckCircle className="text-purple-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.top5Results')}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <CheckCircle className="text-purple-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.premiumLabel')}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <CheckCircle className="text-purple-500" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.moreVisibility')}</span>
                        </div>
                      </>
                    )}
                    {promocionDetalleModal.tipo === 'Destacado' && (
                      <>
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <CheckCircle className="text-yellow-600" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.featuredInCategory')}</span>
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                          <CheckCircle className="text-yellow-600" size={20} />
                          <span className="text-sm text-gray-700">{t('profile.featuredLabel')}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => window.location.href = `/ad/${promocionDetalleModal.anuncio?.id}`}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <ExternalLink size={18} />
                    {t('profile.viewAd')}
                  </button>
                  <button
                    onClick={() => setPromocionDetalleModal(null)}
                    className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                  >
                    {t('profile.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Recargar Créditos */}
        {showRecargarModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowRecargarModal(false); setSelectedRechargeAmount(null); }}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className="bg-gradient-to-br from-emerald-500 to-cyan-600 p-8 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Wallet size={40} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Reîncarcă Credite</h2>
                  <p className="text-white/80 text-sm">Sold actual: <span className="font-bold text-white">{creditos.toFixed(2)}€</span></p>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                {!selectedRechargeAmount ? (
                  <>
                    <p className="text-gray-500 text-sm text-center mb-6">Selectează suma pe care dorești să o încarci</p>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      {[
                        { amount: 10, bonus: 0 },
                        { amount: 25, bonus: 2 },
                        { amount: 50, bonus: 5 },
                        { amount: 100, bonus: 15 },
                      ].map((option) => (
                        <button
                          key={option.amount}
                          onClick={() => setSelectedRechargeAmount(option)}
                          className="relative p-4 border-2 border-gray-200 rounded-xl hover:border-emerald-400 hover:bg-emerald-50 transition-all group"
                        >
                          {option.bonus > 0 && (
                            <span className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-[10px] font-bold rounded-full">
                              +{option.bonus}€ gratis
                            </span>
                          )}
                          <p className="text-2xl font-black text-gray-900 group-hover:text-emerald-600">{option.amount}€</p>
                          <p className="text-xs text-gray-500">
                            {option.bonus > 0 ? `Primești ${option.amount + option.bonus}€` : 'Fără bonus'}
                          </p>
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Resumen de selección */}
                    <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 rounded-xl p-4 mb-6 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Sumă selectată</p>
                          <p className="text-3xl font-black text-emerald-600">{selectedRechargeAmount.amount}€</p>
                          {selectedRechargeAmount.bonus > 0 && (
                            <p className="text-sm text-emerald-600 font-medium">+ {selectedRechargeAmount.bonus}€ bonus = {selectedRechargeAmount.amount + selectedRechargeAmount.bonus}€ total</p>
                          )}
                        </div>
                        <button 
                          onClick={() => setSelectedRechargeAmount(null)}
                          className="text-gray-400 hover:text-gray-600 p-2"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>

                    {/* Métodos de pago activos */}
                    <p className="text-gray-700 font-medium text-center mb-4">Alege metoda de plată</p>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={() => setShowCardForm(true)}
                        className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                          <CreditCard size={28} className="text-blue-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900 group-hover:text-blue-600 text-sm">Card</p>
                          <p className="text-[10px] text-gray-500">Visa, Mastercard</p>
                        </div>
                      </button>

                      <button
                        onClick={async () => {
                          try {
                            // Crear orden de PayPal
                            const response = await fetch('/api/paypal/create-order', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({
                                amount: selectedRechargeAmount.amount,
                                bonus: selectedRechargeAmount.bonus,
                                userId: user?.uid,
                              }),
                            });
                            
                            const data = await response.json();
                            
                            if (data.approvalUrl) {
                              // Redirigir a PayPal
                              window.location.href = data.approvalUrl;
                            } else {
                              alert('❌ Eroare la procesarea plății PayPal. Încearcă din nou.');
                            }
                          } catch (error) {
                            console.error('Error:', error);
                            alert('❌ Eroare la conectarea cu PayPal.');
                          }
                        }}
                        className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-[#0070ba] hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-14 h-14 bg-[#0070ba]/10 rounded-xl flex items-center justify-center group-hover:bg-[#0070ba]/20 transition-colors">
                          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="#0070ba">
                            <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.93 4.778-4.005 7.201-9.138 7.201h-2.19a.563.563 0 0 0-.556.479l-1.187 7.527h-.506l-.24 1.516a.56.56 0 0 0 .554.647h3.882c.46 0 .85-.334.922-.788.06-.26.76-4.852.816-5.09a.932.932 0 0 1 .923-.788h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.777-4.471z"/>
                          </svg>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900 group-hover:text-[#0070ba] text-sm">PayPal</p>
                          <p className="text-[10px] text-gray-500">Cont PayPal</p>
                        </div>
                      </button>

                      <button
                        onClick={() => {
                          const codigo = prompt('Introdu codul promoțional:');
                          if (codigo) {
                            // Validación de código
                            if (codigo.toUpperCase() === 'VINDEL10' || codigo.toUpperCase() === 'BONUS20') {
                              const bonusExtra = codigo.toUpperCase() === 'VINDEL10' ? 10 : 20;
                              setCreditos(prev => prev + selectedRechargeAmount.amount + selectedRechargeAmount.bonus + bonusExtra);
                              setShowRecargarModal(false);
                              setSelectedRechargeAmount(null);
                              alert(`✅ Cod valid! S-au adăugat ${selectedRechargeAmount.amount + selectedRechargeAmount.bonus + bonusExtra}€ în cont (${bonusExtra}€ bonus cod).`);
                            } else {
                              alert('❌ Cod invalid. Încearcă din nou.');
                            }
                          }
                        }}
                        className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
                      >
                        <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <Gift size={28} className="text-purple-600" />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-gray-900 group-hover:text-purple-600 text-sm">Cod</p>
                          <p className="text-[10px] text-gray-500">Promoțional</p>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Footer */}
              <div className="px-6 pb-6">
                <button
                  onClick={() => { 
                    if (selectedRechargeAmount) {
                      setSelectedRechargeAmount(null);
                    } else {
                      setShowRecargarModal(false); 
                    }
                  }}
                  className="w-full py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                >
                  {selectedRechargeAmount ? 'Înapoi' : 'Anulează'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Stripe Payment */}
        <StripePaymentModal
          isOpen={showCardForm && selectedRechargeAmount !== null}
          onClose={() => {
            setShowCardForm(false);
            setCardData({ number: '', expiry: '', cvc: '', name: '' });
          }}
          amount={selectedRechargeAmount?.amount || 0}
          bonus={selectedRechargeAmount?.bonus || 0}
          userId={user?.uid || ''}
          userEmail={user?.email || ''}
          onSuccess={() => {
            setCreditos(prev => prev + (selectedRechargeAmount?.amount || 0) + (selectedRechargeAmount?.bonus || 0));
            setShowCardForm(false);
            setShowRecargarModal(false);
            setSelectedRechargeAmount(null);
            setCardData({ number: '', expiry: '', cvc: '', name: '' });
          }}
        />

        {/* Modal Stripe Payment para Promociones */}
        <StripePaymentModal
          isOpen={showPromoPaymentModal && anuncioParaPromover !== null && tipoPromocionSeleccionada !== null}
          onClose={() => setShowPromoPaymentModal(false)}
          amount={(() => {
            const precioBase = tipoPromocionSeleccionada === 'VIP' ? 10 : tipoPromocionSeleccionada === 'Premium' ? 5 : 2;
            const multiplicador = duracionPromocion === 7 ? 1 : duracionPromocion === 14 ? 1.8 : 3.5;
            return Math.round(precioBase * multiplicador);
          })()}
          bonus={0}
          userId={user?.uid || ''}
          userEmail={user?.email || ''}
          onSuccess={() => {
            handleActivarPromocion(false);
            setShowPromoPaymentModal(false);
          }}
        />

      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          <button
            onClick={() => handleTabChange('perfil')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
              activeTab === 'perfil' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            <User size={20} />
            <span className="text-[10px] font-medium">Perfil</span>
          </button>
          <button
            onClick={() => handleTabChange('mis-anuncios')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
              activeTab === 'mis-anuncios' 
                ? 'text-blue-600 bg-blue-50' 
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            <List size={20} />
            <span className="text-[10px] font-medium">Anuncios</span>
          </button>
          <button
            onClick={() => handleTabChange('promociones')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
              activeTab === 'promociones' 
                ? 'text-purple-600 bg-purple-50' 
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            <Rocket size={20} />
            <span className="text-[10px] font-medium">Promos</span>
          </button>
          <button
            onClick={() => handleTabChange('favoritos')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
              activeTab === 'favoritos' 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            <Heart size={20} />
            <span className="text-[10px] font-medium">Favoritos</span>
          </button>
          <button
            onClick={() => handleTabChange('mensajes')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] relative ${
              activeTab === 'mensajes' 
                ? 'text-green-600 bg-green-50' 
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            <MessageCircle size={20} />
            <span className="text-[10px] font-medium">Mensajes</span>
            {conversaciones.reduce((sum, conv) => sum + ((conv as any)[`noLeidos_${user?.uid}`] || 0), 0) > 0 && (
              <span className="absolute -top-0.5 right-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-red-500 text-white rounded-full px-1">
                {conversaciones.reduce((sum, conv) => sum + ((conv as any)[`noLeidos_${user?.uid}`] || 0), 0) > 99 ? '99+' : conversaciones.reduce((sum, conv) => sum + ((conv as any)[`noLeidos_${user?.uid}`] || 0), 0)}
              </span>
            )}
          </button>
          <button
            onClick={() => handleTabChange('facturas')}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[60px] ${
              activeTab === 'facturas' 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700 active:bg-gray-100'
            }`}
          >
            <Receipt size={20} />
            <span className="text-[10px] font-medium">Facturas</span>
          </button>
        </div>
      </nav>

      {/* Modal de Promocionar Anuncio Individual */}
      {showPromoverAnuncioModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowPromoverAnuncioModal(false); setAnuncioParaPromover(null); setTipoPromocionSeleccionada(null); }}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 px-6 py-5 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <Rocket className="text-white" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Promovează Anunțul</h2>
                    <p className="text-white/80 text-sm">
                      {!anuncioParaPromover ? 'Selectează un anunț' : !tipoPromocionSeleccionada ? 'Alege tipul de promovare' : 'Confirmă promovarea'}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => { setShowPromoverAnuncioModal(false); setAnuncioParaPromover(null); setTipoPromocionSeleccionada(null); }}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              {/* Progress steps */}
              <div className="flex items-center gap-2 mt-4">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${!anuncioParaPromover ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">1</span>
                  Anunț
                </div>
                <ChevronRight className="text-white/50" size={16} />
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${anuncioParaPromover && !tipoPromocionSeleccionada ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">2</span>
                  Tip
                </div>
                <ChevronRight className="text-white/50" size={16} />
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${anuncioParaPromover && tipoPromocionSeleccionada ? 'bg-white text-purple-600' : 'bg-white/20 text-white'}`}>
                  <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-[10px]">3</span>
                  Confirmare
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Paso 1: Seleccionar anuncio */}
              {!anuncioParaPromover && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Anunțurile mele ({misAnuncios.length})</h3>
                    {misAnuncios.length > 4 && (
                      <p className="text-xs text-gray-500">Derulează pentru a vedea mai multe</p>
                    )}
                  </div>
                  {misAnuncios.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <Package className="mx-auto text-gray-300 mb-3" size={48} />
                      <p className="text-gray-500 font-medium">Nu ai anunțuri active</p>
                      <p className="text-gray-400 text-sm mt-1">Publică primul tău anunț pentru a-l promova</p>
                      <button 
                        onClick={() => { setShowPromoverAnuncioModal(false); window.location.href = '/publish'; }}
                        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                      >
                        Publică anunț
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                      {misAnuncios.map((anuncio: any) => {
                        // Verificar si ya tiene promoción activa
                        const yaPromocionado = anuncio.destacado === true;
                        return (
                          <button
                            key={anuncio.id}
                            onClick={() => !yaPromocionado && setAnuncioParaPromover(anuncio)}
                            disabled={yaPromocionado}
                            className={`flex gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                              yaPromocionado 
                                ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed'
                                : 'bg-white border-gray-200 hover:border-purple-400 hover:shadow-md'
                            }`}
                          >
                            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                              {anuncio.imagenes?.[0] ? (
                                <img src={anuncio.imagenes[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="text-gray-300" size={24} />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 text-sm truncate">{anuncio.titulo}</h4>
                              <p className="text-lg font-bold text-purple-600">{anuncio.precio}€</p>
                              {yaPromocionado && (
                                <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 text-white ${
                                  anuncio.planPromocion === 'VIP' ? 'bg-gradient-to-r from-pink-500 to-red-500' :
                                  anuncio.planPromocion === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-blue-500' :
                                  'bg-gradient-to-r from-yellow-400 to-orange-500'
                                }`}>
                                  {anuncio.planPromocion === 'VIP' && <Crown size={10} />}
                                  {anuncio.planPromocion === 'Premium' && <Star size={10} />}
                                  {anuncio.planPromocion === 'Destacado' && <Award size={10} />}
                                  {anuncio.planPromocion} activ
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Paso 2: Seleccionar tipo de promoción */}
              {anuncioParaPromover && !tipoPromocionSeleccionada && (
                <div>
                  {/* Anuncio seleccionado */}
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200 mb-6">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      {anuncioParaPromover.imagenes?.[0] ? (
                        <img src={anuncioParaPromover.imagenes[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200"><Package size={16} /></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-purple-600 font-medium">Anunț selectat</p>
                      <h4 className="font-semibold text-gray-900 truncate">{anuncioParaPromover.titulo}</h4>
                    </div>
                    <button onClick={() => setAnuncioParaPromover(null)} className="text-gray-400 hover:text-gray-600">
                      <XCircle size={20} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-4">Alege tipul de promovare</h3>
                  <div className="space-y-3">
                    {/* Destacado */}
                    <button
                      onClick={() => setTipoPromocionSeleccionada('Destacado')}
                      className="w-full p-4 rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 hover:border-yellow-400 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-400 flex items-center justify-center shadow-lg shadow-yellow-200/50">
                          <Award className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 flex items-center gap-2">
                            Evidențiat
                            <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 text-[10px] font-bold rounded-full">POPULAR</span>
                          </h4>
                          <p className="text-sm text-gray-500">Apare primul în căutări • +100% vizibilitate</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-yellow-600">2€</p>
                          <p className="text-xs text-gray-500">/7 zile</p>
                        </div>
                      </div>
                    </button>

                    {/* Premium */}
                    <button
                      onClick={() => setTipoPromocionSeleccionada('Premium')}
                      className="w-full p-4 rounded-xl border-2 border-purple-300 bg-gradient-to-br from-purple-600 to-blue-600 hover:shadow-xl transition-all text-left text-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Star className="text-white" size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold flex items-center gap-2">
                            Premium
                            <span className="px-2 py-0.5 bg-white/20 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Flame size={10} /> RECOMANDAT
                            </span>
                          </h4>
                          <p className="text-sm text-white/80">Expunere maximă • Badge Premium • +200% vizibilitate</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black">5€</p>
                          <p className="text-xs text-white/70">/7 zile</p>
                        </div>
                      </div>
                    </button>

                    {/* VIP */}
                    <button
                      onClick={() => setTipoPromocionSeleccionada('VIP')}
                      className="w-full p-4 rounded-xl border-2 border-pink-300 bg-gradient-to-br from-pink-600 via-rose-600 to-red-600 hover:shadow-xl transition-all text-left text-white"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Crown className="text-yellow-300" size={24} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold flex items-center gap-2">
                            VIP
                            <span className="px-2 py-0.5 bg-gradient-to-r from-yellow-300 to-amber-400 text-amber-900 text-[10px] font-bold rounded-full flex items-center gap-1">
                              <Crown size={10} /> EXCLUSIV
                            </span>
                          </h4>
                          <p className="text-sm text-white/80">Prima poziție • Badge VIP • Suport prioritar • +500% vizibilitate</p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black">10€</p>
                          <p className="text-xs text-white/70">/7 zile</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Paso 3: Confirmar duración y pagar */}
              {anuncioParaPromover && tipoPromocionSeleccionada && (
                <div>
                  {/* Resumen */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {anuncioParaPromover.imagenes?.[0] ? (
                          <img src={anuncioParaPromover.imagenes[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200"><Package size={20} /></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{anuncioParaPromover.titulo}</h4>
                        <p className="text-sm text-gray-500">{anuncioParaPromover.precio}€</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
                        tipoPromocionSeleccionada === 'VIP' ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white' :
                        tipoPromocionSeleccionada === 'Premium' ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' :
                        'bg-gradient-to-r from-yellow-400 to-orange-400 text-white'
                      }`}>
                        {tipoPromocionSeleccionada === 'VIP' && <Crown size={14} className="inline mr-1" />}
                        {tipoPromocionSeleccionada === 'Premium' && <Star size={14} className="inline mr-1" />}
                        {tipoPromocionSeleccionada === 'Destacado' && <Award size={14} className="inline mr-1" />}
                        {tipoPromocionSeleccionada}
                      </div>
                    </div>
                    <button 
                      onClick={() => setTipoPromocionSeleccionada(null)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      ← Schimbă tipul de promovare
                    </button>
                  </div>

                  {/* Seleccionar duración */}
                  <h3 className="font-semibold text-gray-900 mb-3">Selectează durata</h3>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {[
                      { dias: 7 as const, label: '7 zile', multiplicador: 1 },
                      { dias: 14 as const, label: '14 zile', multiplicador: 1.8, ahorro: '10%' },
                      { dias: 30 as const, label: '30 zile', multiplicador: 3.5, ahorro: '17%' },
                    ].map((opcion) => {
                      const precioBase = tipoPromocionSeleccionada === 'VIP' ? 10 : tipoPromocionSeleccionada === 'Premium' ? 5 : 2;
                      const precio = Math.round(precioBase * opcion.multiplicador);
                      return (
                        <button
                          key={opcion.dias}
                          onClick={() => setDuracionPromocion(opcion.dias)}
                          className={`p-4 rounded-xl border-2 transition-all ${
                            duracionPromocion === opcion.dias 
                              ? 'border-purple-500 bg-purple-50 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-purple-300'
                          }`}
                        >
                          <p className="font-bold text-gray-900">{opcion.label}</p>
                          <p className="text-2xl font-black text-purple-600 mt-1">{precio}€</p>
                          {opcion.ahorro && <span className="text-xs text-green-600 font-bold">-{opcion.ahorro}</span>}
                        </button>
                      );
                    })}
                  </div>

                  {/* Botón de pagar */}
                  {(() => {
                    const precioBase = tipoPromocionSeleccionada === 'VIP' ? 10 : tipoPromocionSeleccionada === 'Premium' ? 5 : 2;
                    const multiplicador = duracionPromocion === 7 ? 1 : duracionPromocion === 14 ? 1.8 : 3.5;
                    const precioFinal = Math.round(precioBase * multiplicador);
                    return (
                      <button
                        onClick={() => setShowPromoPaymentModal(true)}
                        className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-purple-200/50 transition-all flex items-center justify-center gap-2"
                      >
                        <CreditCard size={20} />
                        Plătește {precioFinal}€ cu cardul
                      </button>
                    );
                  })()}

                  {/* Método de pago con créditos */}
                  {(() => {
                    const precioBase = tipoPromocionSeleccionada === 'VIP' ? 10 : tipoPromocionSeleccionada === 'Premium' ? 5 : 2;
                    const multiplicador = duracionPromocion === 7 ? 1 : duracionPromocion === 14 ? 1.8 : 3.5;
                    const precioFinal = Math.round(precioBase * multiplicador);
                    return creditos >= precioFinal ? (
                      <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Wallet className="text-emerald-600" size={18} />
                            <span className="text-sm font-medium text-emerald-700">Ai {creditos.toFixed(0)}€ în credite</span>
                          </div>
                          <button 
                            onClick={() => handleActivarPromocion(true)}
                            className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                          >
                            Folosește credite ({precioFinal}€)
                          </button>
                        </div>
                      </div>
                    ) : null;
                  })()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Verificación Email/Teléfono */}
      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        onVerified={() => {
          toastSuccess('Verificare reușită!', 'Contul tău este acum mai sigur.');
        }}
      />

      {/* Toast Container */}
      <ToastContainer toast={toast} onClose={hideToast} />
    </div>
  );
}


