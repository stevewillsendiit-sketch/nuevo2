export enum Categoria {
  IMOBILIARE = "Imobiliare",
  AUTO_MOTO = "Auto moto",
  LOCURI_DE_MUNCA = "Locuri de muncă",
  MATRIMONIALE = "Matrimoniale",
  SERVICII = "Servicii",
  ELECTRONICE = "Electronice",
  MODA_ACCESORII = "Modă și accesorii",
  ANIMALE = "Animale",
  CASA_GRADINA = "Casă și grădină",
  TIMP_LIBER_SPORT = "Timp liber și sport",
  MAMA_COPIL = "Mama și copilul",
  CAZARE_TURISM = "Cazare turism",
  VIDEOJOCURI = "Videojocuri",
}

export enum EstadoAnuncio {
  ACTIVO = "Activo",
  PAUSADO = "Pausado",
  EN_REVISION = "En revisión",
  RECHAZADO = "Rechazado",
  VENDIDO = "Vendido",
  CADUCADO = "Caducado"
}

export enum CondicionProducto {
  NINGUNA = "Ninguna",
  NUEVO = "Nuevo",
  SEMINUEVO = "Seminuevo",
  USADO = "Usado"
}

export interface Anuncio {
  id: string;
  titulo: string;
  descripcion: string;
  precio: number;
  moneda?: 'EUR' | 'LEI';
  categoria: Categoria;
  subcategoria?: string;
  imagenes: string[];
  ubicacion: string;
  provincia: string;
  vendedorId: string;
  fechaPublicacion: Date;
  estado: EstadoAnuncio;
  condicion: CondicionProducto;
  vistas: number;
  favoritos: number;
  destacado: boolean;
  destacadoPrioridad?: number;
  etiquetas: string[];
  negociable: boolean;
  promovado?: boolean;
  ventaPresencial?: boolean;
  envioDisponible?: boolean;
  // Mantener compatibilidad con versiones antiguas/remote builds
  ventaEnPersona?: boolean;
  reportes?: number;
  telefono?: string;
  // Campo para control de edición (24h)
  ultimaEdicion?: Date | string;
  // Campos de promoción
  planPromocion?: string | null;
  fechaPromocion?: string;
  tiempoVisualizacion?: number;
  promocion?: {
    tipo: string;
    diasRestantes?: number;
    anuncioId?: string;
  };
}

export type TipoUsuario = 'particular' | 'empresa';
export type RolUsuario = 'user' | 'moderator' | 'admin' | 'superadmin';

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: number;
  ubicacion?: string;
  verificado: boolean;
  valoracion: number;
  numeroValoraciones: number;
  fechaRegistro: Date;
  // Tipo de cuenta
  tipoUsuario?: TipoUsuario;
  // Rol del usuario (para administración)
  rol?: RolUsuario;
  // Estado de la cuenta
  suspendido?: boolean;
  motivoSuspension?: string;
  fechaSuspension?: Date;
  // Verificaciones de seguridad
  emailVerificado?: boolean;
  telefonVerificat?: boolean;
  fechaVerificacionEmail?: Date;
  fechaVerificacionTelefon?: Date;
  // Campos exclusivos para empresas
  nombreComercial?: string;
  cif?: string;
  direccionFiscal?: string;
  web?: string;
  horarioAtencion?: string;
  descripcionEmpresa?: string;
  logoUrl?: string;
  empresaVerificada?: boolean;
  // Campos adicionales
  avatar?: string;
  plan?: string;
  creditos?: number;
}

// Estadísticas del sistema
export interface EstadisticasSistema {
  totalUsuarios: number;
  totalAnuncios: number;
  anunciosActivos: number;
  anunciosPendientes: number;
  anunciosRechazados: number;
  totalMensajes: number;
  usuariosNuevosHoy: number;
  anunciosNuevosHoy: number;
  visitasHoy: number;
}

// Reporte de anuncio
export interface ReporteAnuncio {
  id: string;
  anuncioId: string;
  reportadorId: string;
  motivo: 'spam' | 'fraude' | 'contenido_inapropiado' | 'producto_ilegal' | 'duplicado' | 'otro';
  descripcion?: string;
  fecha: Date;
  estado: 'pendiente' | 'revisado' | 'resuelto' | 'descartado';
  accionTomada?: string;
  revisadoPor?: string;
}

// Log de actividad admin
export interface LogAdmin {
  id: string;
  adminId: string;
  adminEmail: string;
  accion: string;
  entidad: 'usuario' | 'anuncio' | 'reporte' | 'sistema';
  entidadId?: string;
  detalles?: string;
  fecha: Date;
}

export interface Mensaje {
  id: string;
  conversacionId: string;
  remitenteId: string;
  contenido: string;
  fecha: Date;
  leido: boolean;
}

export interface Conversacion {
  id: string;
  participantes: string[];
  anuncioId: string;
  ultimoMensaje: string;
  fechaUltimoMensaje: Date;
  noLeidos: number;
}

export interface Factura {
  id: string;
  numero: string;
  userId: string;
  fecha: Date;
  // Datos del cliente
  clienteNombre: string;
  clienteEmail: string;
  clienteTelefono?: string;
  clienteDireccion?: string;
  clienteCif?: string;
  // Datos del vendedor/empresa
  vendedorNombre: string;
  vendedorCif: string;
  vendedorDireccion: string;
  // Detalles de la factura
  concepto: string;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  iva: number;
  ivaImporte: number;
  total: number;
  // Estado
  estado: 'pagada' | 'pendiente' | 'cancelada';
  metodoPago: 'creditos' | 'tarjeta' | 'paypal';
  // Referencia al plan
  planId?: string;
  planTipo?: string;
}

// `getCategoriaIcon` moved to `src/lib/categoriaIcons.tsx` because it returns JSX.
// Keep types file free of JSX to avoid requiring .tsx for this module.
export {};
