'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createAnuncio } from '@/lib/anuncios.service';
import { Categoria, CondicionProducto, EstadoAnuncio } from '@/types';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';
import { getConfiguracionPromociones, type ConfiguracionPromociones } from '@/lib/promociones.service';
import { 
  Camera, 
  X, 
  MapPin, 
  Euro, 
  Tag, 
  FileText, 
  Sparkles,
  ChevronRight,
  Check,
  AlertCircle,
  Loader2,
  Upload,
  Package,
  Home,
  Car,
  Briefcase,
  Heart,
  Wrench,
  Smartphone,
  Shirt,
  PawPrint,
  TreeDeciduous,
  Dumbbell,
  Baby,
  Plane,
  MoreHorizontal,
  Shield,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Rocket,
  Award,
  Star,
  Crown,
  Flame,
  Zap,
} from 'lucide-react';

// Iconos por categoría
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

export default function PublishPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Form states
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState('');
  const [moneda, setMoneda] = useState<'EUR' | 'LEI'>('LEI');
  const [categoria, setCategoria] = useState<Categoria | ''>();
  const [condicion, setCondicion] = useState<CondicionProducto>(CondicionProducto.NINGUNA);
  const [ubicacion, setUbicacion] = useState('');
  const [provincia, setProvincia] = useState('');
  const [negociable, setNegociable] = useState(false);
  const [ventaPresencial, setVentaPresencial] = useState(true);
  const [telefono, setTelefono] = useState('');
  const [imagenes, setImagenes] = useState<File[]>([]);
  const [imagenesPreview, setImagenesPreview] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  
  // Estados para promoción
  const [promocionarAlPublicar, setPromocionarAlPublicar] = useState(true);
  const [tipoPromocion, setTipoPromocion] = useState<'Destacado' | 'Premium' | 'VIP' | null>('Destacado');
  const [duracionPromocion, setDuracionPromocion] = useState<7 | 14 | 30>(7);
  const [configuracionPromociones, setConfiguracionPromociones] = useState<ConfiguracionPromociones | null>(null);
  
  // Cargar configuración de promociones
  useEffect(() => {
    getConfiguracionPromociones().then(setConfiguracionPromociones);
  }, []);
  
  // Función helper para obtener precios de promoción (con descuento si aplica)
  const getPrecioPromocion = (tipo: 'VIP' | 'Premium' | 'Destacado'): number => {
    const precios = {
      VIP: configuracionPromociones?.precioVIP ?? 10,
      Premium: configuracionPromociones?.precioPremium ?? 5,
      Destacado: configuracionPromociones?.precioDestacado ?? 2
    };
    let precio = precios[tipo];
    
    // Aplicar descuento global si está activo
    if (configuracionPromociones?.descuentoGlobalActivo && configuracionPromociones?.descuentoGlobalPorcentaje > 0) {
      precio = precio * (1 - configuracionPromociones.descuentoGlobalPorcentaje / 100);
    }
    
    return Math.round(precio * 100) / 100; // Redondear a 2 decimales
  };
  
  // Estados para campos específicos por categoría
  // Auto moto
  const [autoMarca, setAutoMarca] = useState('');
  const [autoModelo, setAutoModelo] = useState('');
  const [autoAnio, setAutoAnio] = useState('');
  const [autoKilometros, setAutoKilometros] = useState('');
  const [autoTransmision, setAutoTransmision] = useState<'manual' | 'automatico' | ''>('');
  const [autoCombustible, setAutoCombustible] = useState<'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | ''>('');
  const [autoPotencia, setAutoPotencia] = useState('');
  const [autoColor, setAutoColor] = useState('');
  
  // Inmobiliaria
  const [inmoTipo, setInmoTipo] = useState<'piso' | 'casa' | 'atico' | 'duplex' | 'estudio' | 'local' | 'oficina' | 'terreno' | 'garaje' | ''>('');
  const [inmoOperacion, setInmoOperacion] = useState<'venta' | 'alquiler' | ''>('');
  const [inmoHabitaciones, setInmoHabitaciones] = useState('');
  const [inmoBanios, setInmoBanios] = useState('');
  const [inmoMetros, setInmoMetros] = useState('');
  const [inmoAmueblado, setInmoAmueblado] = useState(false);
  const [inmoAscensor, setInmoAscensor] = useState(false);
  const [inmoParking, setInmoParking] = useState(false);
  const [inmoTerraza, setInmoTerraza] = useState(false);
  const [inmoPiscina, setInmoPiscina] = useState(false);
  
  // Electrónica
  const [electroMarca, setElectroMarca] = useState('');
  const [electroModelo, setElectroModelo] = useState('');
  const [electroGarantia, setElectroGarantia] = useState(false);
  
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
  
  // Estados para búsqueda de localidad
  const [localidadBusqueda, setLocalidadBusqueda] = useState('');
  const [showLocalidadSugerencias, setShowLocalidadSugerencias] = useState(false);

  // Base de datos de localidades de Rumania (ciudad, județ)
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
    // Localidades adicionales con mismo nombre en diferentes județe
    { ciudad: 'Slatina', judet: 'Argeș' },
    { ciudad: 'Slatina', judet: 'Suceava' },
    { ciudad: 'Slatina de Criș', judet: 'Arad' },
    { ciudad: 'Slatina de Mureș', judet: 'Arad' },
    { ciudad: 'Slatina-Nera', judet: 'Caraș-Severin' },
    { ciudad: 'Slatina-Timiș', judet: 'Caraș-Severin' },
    // ===== COMUNE (Localități) =====
    { ciudad: 'Afumați', judet: 'Ilfov' },
    { ciudad: 'Agnita', judet: 'Sibiu' },
    { ciudad: 'Agigea', judet: 'Constanța' },
    { ciudad: 'Aleșd', judet: 'Bihor' },
    { ciudad: 'Apahida', judet: 'Cluj' },
    { ciudad: 'Apața', judet: 'Brașov' },
    { ciudad: 'Avrig', judet: 'Sibiu' },
    { ciudad: 'Azuga', judet: 'Prahova' },
    { ciudad: 'Balș', judet: 'Olt' },
    { ciudad: 'Băicoi', judet: 'Prahova' },
    { ciudad: 'Băile Felix', judet: 'Bihor' },
    { ciudad: 'Băile Herculane', judet: 'Caraș-Severin' },
    { ciudad: 'Băile Tușnad', judet: 'Harghita' },
    { ciudad: 'Băilești', judet: 'Dolj' },
    { ciudad: 'Bălan', judet: 'Harghita' },
    { ciudad: 'Bălcești', judet: 'Vâlcea' },
    { ciudad: 'Băleni', judet: 'Dâmbovița' },
    { ciudad: 'Băneasa', judet: 'Constanța' },
    { ciudad: 'Bascov', judet: 'Argeș' },
    { ciudad: 'Becicherecu Mic', judet: 'Timiș' },
    { ciudad: 'Beclean', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Beiuș', judet: 'Bihor' },
    { ciudad: 'Berești', judet: 'Galați' },
    { ciudad: 'Bicaz', judet: 'Neamț' },
    { ciudad: 'Bistrița Bârgăului', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Bod', judet: 'Brașov' },
    { ciudad: 'Bogata', judet: 'Mureș' },
    { ciudad: 'Boldești-Scăeni', judet: 'Prahova' },
    { ciudad: 'Bolintinu', judet: 'Ilfov' },
    { ciudad: 'Bolintin-Vale', judet: 'Giurgiu' },
    { ciudad: 'Boroșneu Mare', judet: 'Covasna' },
    { ciudad: 'Borsec', judet: 'Harghita' },
    { ciudad: 'Bran', judet: 'Brașov' },
    { ciudad: 'Brănești', judet: 'Ilfov' },
    { ciudad: 'Brebu', judet: 'Prahova' },
    { ciudad: 'Broșteni', judet: 'Suceava' },
    { ciudad: 'Bucecea', judet: 'Botoșani' },
    { ciudad: 'Bucov', judet: 'Prahova' },
    { ciudad: 'Budești', judet: 'Maramureș' },
    { ciudad: 'Buhuși', judet: 'Bacău' },
    { ciudad: 'Bușteni', judet: 'Prahova' },
    { ciudad: 'Călan', judet: 'Hunedoara' },
    { ciudad: 'Calafat', judet: 'Dolj' },
    { ciudad: 'Câmpeni', judet: 'Alba' },
    { ciudad: 'Câmpulung Moldovenesc', judet: 'Suceava' },
    { ciudad: 'Câmpulung Muscel', judet: 'Argeș' },
    { ciudad: 'Căpușu Mare', judet: 'Cluj' },
    { ciudad: 'Castelu', judet: 'Constanța' },
    { ciudad: 'Catunele', judet: 'Gorj' },
    { ciudad: 'Cârțișoara', judet: 'Sibiu' },
    { ciudad: 'Cernavodă', judet: 'Constanța' },
    { ciudad: 'Cernișoara', judet: 'Vâlcea' },
    { ciudad: 'Chiajna', judet: 'Ilfov' },
    { ciudad: 'Cisnădie', judet: 'Sibiu' },
    { ciudad: 'Ciucea', judet: 'Cluj' },
    { ciudad: 'Ciugud', judet: 'Alba' },
    { ciudad: 'Comarnic', judet: 'Prahova' },
    { ciudad: 'Comloșu Mare', judet: 'Timiș' },
    { ciudad: 'Copalnic-Mănăștur', judet: 'Maramureș' },
    { ciudad: 'Copșa Mică', judet: 'Sibiu' },
    { ciudad: 'Corabia', judet: 'Olt' },
    { ciudad: 'Corbeni', judet: 'Argeș' },
    { ciudad: 'Corbeanca', judet: 'Ilfov' },
    { ciudad: 'Corbu', judet: 'Constanța' },
    { ciudad: 'Cornetu', judet: 'Ilfov' },
    { ciudad: 'Costești', judet: 'Argeș' },
    { ciudad: 'Costinești', judet: 'Constanța' },
    { ciudad: 'Covasna', judet: 'Covasna' },
    { ciudad: 'Cozmești', judet: 'Vaslui' },
    { ciudad: 'Cristuru Secuiesc', judet: 'Harghita' },
    { ciudad: 'Cugir', judet: 'Alba' },
    { ciudad: 'Curtici', judet: 'Arad' },
    { ciudad: 'Dărmănești', judet: 'Bacău' },
    { ciudad: 'Darabani', judet: 'Botoșani' },
    { ciudad: 'Deta', judet: 'Timiș' },
    { ciudad: 'Deveselu', judet: 'Olt' },
    { ciudad: 'Dezna', judet: 'Arad' },
    { ciudad: 'Diosig', judet: 'Bihor' },
    { ciudad: 'Drăgănești-Olt', judet: 'Olt' },
    { ciudad: 'Drăgășani', judet: 'Vâlcea' },
    { ciudad: 'Dragomirești', judet: 'Maramureș' },
    { ciudad: 'Dumbrăveni', judet: 'Sibiu' },
    { ciudad: 'Dumbrăvița', judet: 'Timiș' },
    { ciudad: 'Eforie Nord', judet: 'Constanța' },
    { ciudad: 'Eforie Sud', judet: 'Constanța' },
    { ciudad: 'Fieni', judet: 'Dâmbovița' },
    { ciudad: 'Filiași', judet: 'Dolj' },
    { ciudad: 'Florești', judet: 'Cluj' },
    { ciudad: 'Florești', judet: 'Prahova' },
    { ciudad: 'Fundulea', judet: 'Călărași' },
    { ciudad: 'Galda de Jos', judet: 'Alba' },
    { ciudad: 'Gheorgheni', judet: 'Harghita' },
    { ciudad: 'Gilău', judet: 'Cluj' },
    { ciudad: 'Giroc', judet: 'Timiș' },
    { ciudad: 'Giulești', judet: 'Maramureș' },
    { ciudad: 'Glina', judet: 'Ilfov' },
    { ciudad: 'Gura Humorului', judet: 'Suceava' },
    { ciudad: 'Hârlău', judet: 'Iași' },
    { ciudad: 'Hășmaș', judet: 'Arad' },
    { ciudad: 'Hațeg', judet: 'Hunedoara' },
    { ciudad: 'Horezu', judet: 'Vâlcea' },
    { ciudad: 'Huedin', judet: 'Cluj' },
    { ciudad: 'Iernut', judet: 'Mureș' },
    { ciudad: 'Ineu', judet: 'Arad' },
    { ciudad: 'Întorsura Buzăului', judet: 'Covasna' },
    { ciudad: 'Ioanis', judet: 'Bihor' },
    { ciudad: 'Isaccea', judet: 'Tulcea' },
    { ciudad: 'Jibou', judet: 'Sălaj' },
    { ciudad: 'Jilava', judet: 'Ilfov' },
    { ciudad: 'Jimbolia', judet: 'Timiș' },
    { ciudad: 'Jupiter', judet: 'Constanța' },
    { ciudad: 'Lancrăm', judet: 'Alba' },
    { ciudad: 'Lehliu-Gară', judet: 'Călărași' },
    { ciudad: 'Lipova', judet: 'Arad' },
    { ciudad: 'Liteni', judet: 'Suceava' },
    { ciudad: 'Luduș', judet: 'Mureș' },
    { ciudad: 'Lunca Cetățuii', judet: 'Iași' },
    { ciudad: 'Mărășești', judet: 'Vrancea' },
    { ciudad: 'Măgura', judet: 'Brașov' },
    { ciudad: 'Mamaia', judet: 'Constanța' },
    { ciudad: 'Marghita', judet: 'Bihor' },
    { ciudad: 'Mărgineni', judet: 'Bacău' },
    { ciudad: 'Măxineni', judet: 'Brăila' },
    { ciudad: 'Mihăilești', judet: 'Giurgiu' },
    { ciudad: 'Milișăuți', judet: 'Suceava' },
    { ciudad: 'Mizil', judet: 'Prahova' },
    { ciudad: 'Mogoșoaia', judet: 'Ilfov' },
    { ciudad: 'Moinești', judet: 'Bacău' },
    { ciudad: 'Moldova Nouă', judet: 'Caraș-Severin' },
    { ciudad: 'Momârlani', judet: 'Hunedoara' },
    { ciudad: 'Moșnița Nouă', judet: 'Timiș' },
    { ciudad: 'Motru', judet: 'Gorj' },
    { ciudad: 'Movila', judet: 'Ialomița' },
    { ciudad: 'Nădlac', judet: 'Arad' },
    { ciudad: 'Năsăud', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Nehoiu', judet: 'Buzău' },
    { ciudad: 'Negrești', judet: 'Vaslui' },
    { ciudad: 'Negrești-Oaș', judet: 'Satu Mare' },
    { ciudad: 'Neptun', judet: 'Constanța' },
    { ciudad: 'Novaci', judet: 'Gorj' },
    { ciudad: 'Nucet', judet: 'Bihor' },
    { ciudad: 'Ocna Mureș', judet: 'Alba' },
    { ciudad: 'Ocna Sibiului', judet: 'Sibiu' },
    { ciudad: 'Ocnele Mari', judet: 'Vâlcea' },
    { ciudad: 'Odobești', judet: 'Vrancea' },
    { ciudad: 'Oituz', judet: 'Bacău' },
    { ciudad: 'Olimp', judet: 'Constanța' },
    { ciudad: 'Oravița', judet: 'Caraș-Severin' },
    { ciudad: 'Otelu Roșu', judet: 'Caraș-Severin' },
    { ciudad: 'Ovidiu', judet: 'Constanța' },
    { ciudad: 'Panciu', judet: 'Vrancea' },
    { ciudad: 'Pâncota', judet: 'Arad' },
    { ciudad: 'Păltiniș', judet: 'Sibiu' },
    { ciudad: 'Pecica', judet: 'Arad' },
    { ciudad: 'Peciu Nou', judet: 'Timiș' },
    { ciudad: 'Petrești', judet: 'Dâmbovița' },
    { ciudad: 'Plopeni', judet: 'Prahova' },
    { ciudad: 'Pogoanele', judet: 'Buzău' },
    { ciudad: 'Poiana Brașov', judet: 'Brașov' },
    { ciudad: 'Poiana Stampei', judet: 'Suceava' },
    { ciudad: 'Popricani', judet: 'Iași' },
    { ciudad: 'Predeal', judet: 'Brașov' },
    { ciudad: 'Pucioasa', judet: 'Dâmbovița' },
    { ciudad: 'Răcari', judet: 'Dâmbovița' },
    { ciudad: 'Rădești', judet: 'Alba' },
    { ciudad: 'Râșnov', judet: 'Brașov' },
    { ciudad: 'Recaș', judet: 'Timiș' },
    { ciudad: 'Roata de Jos', judet: 'Giurgiu' },
    { ciudad: 'Roșia Montană', judet: 'Alba' },
    { ciudad: 'Rupea', judet: 'Brașov' },
    { ciudad: 'Salcea', judet: 'Suceava' },
    { ciudad: 'Salonta', judet: 'Bihor' },
    { ciudad: 'Sângeorz-Băi', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Sânmartin', judet: 'Bihor' },
    { ciudad: 'Sânnicolau Mare', judet: 'Timiș' },
    { ciudad: 'Sântana', judet: 'Arad' },
    { ciudad: 'Sărata', judet: 'Bacău' },
    { ciudad: 'Săveni', judet: 'Botoșani' },
    { ciudad: 'Scornicești', judet: 'Olt' },
    { ciudad: 'Sebiș', judet: 'Arad' },
    { ciudad: 'Segarcea', judet: 'Dolj' },
    { ciudad: 'Sfântu Ilie', judet: 'Harghita' },
    { ciudad: 'Simleu Silvaniei', judet: 'Sălaj' },
    { ciudad: 'Simeria', judet: 'Hunedoara' },
    { ciudad: 'Sinaia', judet: 'Prahova' },
    { ciudad: 'Siret', judet: 'Suceava' },
    { ciudad: 'Slănic', judet: 'Prahova' },
    { ciudad: 'Slănic-Moldova', judet: 'Bacău' },
    { ciudad: 'Snagov', judet: 'Ilfov' },
    { ciudad: 'Șimleu Silvaniei', judet: 'Sălaj' },
    { ciudad: 'Șomcuta Mare', judet: 'Maramureș' },
    { ciudad: 'Sovata', judet: 'Mureș' },
    { ciudad: 'Ștefănești', judet: 'Argeș' },
    { ciudad: 'Stei', judet: 'Bihor' },
    { ciudad: 'Strehaia', judet: 'Mehedinți' },
    { ciudad: 'Suceava', judet: 'Suceava' },
    { ciudad: 'Sulina', judet: 'Tulcea' },
    { ciudad: 'Tălmaciu', judet: 'Sibiu' },
    { ciudad: 'Tăndărei', judet: 'Ialomița' },
    { ciudad: 'Tășnad', judet: 'Satu Mare' },
    { ciudad: 'Techirghiol', judet: 'Constanța' },
    { ciudad: 'Teius', judet: 'Alba' },
    { ciudad: 'Timișul de Jos', judet: 'Brașov' },
    { ciudad: 'Tismana', judet: 'Gorj' },
    { ciudad: 'Titu', judet: 'Dâmbovița' },
    { ciudad: 'Toplița', judet: 'Harghita' },
    { ciudad: 'Topoloveni', judet: 'Argeș' },
    { ciudad: 'Tuzla', judet: 'Constanța' },
    { ciudad: 'Ungheni', judet: 'Mureș' },
    { ciudad: 'Uricani', judet: 'Hunedoara' },
    { ciudad: 'Urlați', judet: 'Prahova' },
    { ciudad: 'Valea lui Mihai', judet: 'Bihor' },
    { ciudad: 'Vălenii de Munte', judet: 'Prahova' },
    { ciudad: 'Valu lui Traian', judet: 'Constanța' },
    { ciudad: 'Vama', judet: 'Suceava' },
    { ciudad: 'Vânju Mare', judet: 'Mehedinți' },
    { ciudad: 'Venus', judet: 'Constanța' },
    { ciudad: 'Vicovu de Sus', judet: 'Suceava' },
    { ciudad: 'Victoria', judet: 'Brașov' },
    { ciudad: 'Videle', judet: 'Teleorman' },
    { ciudad: 'Vișeu de Sus', judet: 'Maramureș' },
    { ciudad: 'Vlădești', judet: 'Vâlcea' },
    { ciudad: 'Voineasa', judet: 'Vâlcea' },
    { ciudad: 'Zărnești', judet: 'Brașov' },
    { ciudad: 'Zimnicea', judet: 'Teleorman' },
    // ===== SATE (Villages) =====
    { ciudad: 'Baciu', judet: 'Cluj' },
    { ciudad: 'Băbeni', judet: 'Vâlcea' },
    { ciudad: 'Băcia', judet: 'Hunedoara' },
    { ciudad: 'Baia de Fier', judet: 'Gorj' },
    { ciudad: 'Bălteni', judet: 'Ilfov' },
    { ciudad: 'Balta Albă', judet: 'Buzău' },
    { ciudad: 'Balta Doamnei', judet: 'Prahova' },
    { ciudad: 'Bănia', judet: 'Caraș-Severin' },
    { ciudad: 'Bărăganu', judet: 'Constanța' },
    { ciudad: 'Bedeciu', judet: 'Cluj' },
    { ciudad: 'Belciugatele', judet: 'Călărași' },
    { ciudad: 'Berca', judet: 'Buzău' },
    { ciudad: 'Bocșa', judet: 'Caraș-Severin' },
    { ciudad: 'Bogdănești', judet: 'Suceava' },
    { ciudad: 'Bonțida', judet: 'Cluj' },
    { ciudad: 'Borca', judet: 'Neamț' },
    { ciudad: 'Borcea', judet: 'Călărași' },
    { ciudad: 'Boroșneu', judet: 'Covasna' },
    { ciudad: 'Botoroaga', judet: 'Teleorman' },
    { ciudad: 'Breaza de Sus', judet: 'Prahova' },
    { ciudad: 'Bucerdea Grânoasă', judet: 'Alba' },
    { ciudad: 'Buciumeni', judet: 'Dâmbovița' },
    { ciudad: 'Bucșani', judet: 'Dâmbovița' },
    { ciudad: 'Budila', judet: 'Brașov' },
    { ciudad: 'Bujoreni', judet: 'Vâlcea' },
    { ciudad: 'Bunești', judet: 'Brașov' },
    { ciudad: 'Căciulați', judet: 'Ilfov' },
    { ciudad: 'Câlnic', judet: 'Alba' },
    { ciudad: 'Cămin', judet: 'Arad' },
    { ciudad: 'Cămpia', judet: 'Sălaj' },
    { ciudad: 'Căpâlna', judet: 'Alba' },
    { ciudad: 'Căpreni', judet: 'Gorj' },
    { ciudad: 'Cârligele', judet: 'Vrancea' },
    { ciudad: 'Cârțișoara', judet: 'Sibiu' },
    { ciudad: 'Cernica', judet: 'Ilfov' },
    { ciudad: 'Ciocănești', judet: 'Dâmbovița' },
    { ciudad: 'Ciocănești', judet: 'Suceava' },
    { ciudad: 'Ciprian Porumbescu', judet: 'Suceava' },
    { ciudad: 'Ciolpani', judet: 'Ilfov' },
    { ciudad: 'Cisnădioara', judet: 'Sibiu' },
    { ciudad: 'Ciurea', judet: 'Iași' },
    { ciudad: 'Clejani', judet: 'Giurgiu' },
    { ciudad: 'Cocorăștii Mislii', judet: 'Prahova' },
    { ciudad: 'Colceag', judet: 'Prahova' },
    { ciudad: 'Colibași', judet: 'Giurgiu' },
    { ciudad: 'Comana', judet: 'Giurgiu' },
    { ciudad: 'Comișani', judet: 'Dâmbovița' },
    { ciudad: 'Conțești', judet: 'Dâmbovița' },
    { ciudad: 'Corunca', judet: 'Mureș' },
    { ciudad: 'Cozieni', judet: 'Buzău' },
    { ciudad: 'Crângurile', judet: 'Dâmbovița' },
    { ciudad: 'Cristian', judet: 'Brașov' },
    { ciudad: 'Cristian', judet: 'Sibiu' },
    { ciudad: 'Cristești', judet: 'Mureș' },
    { ciudad: 'Crivina', judet: 'Timiș' },
    { ciudad: 'Crucea', judet: 'Constanța' },
    { ciudad: 'Cudalbi', judet: 'Galați' },
    { ciudad: 'Cumpăna', judet: 'Constanța' },
    { ciudad: 'Dăești', judet: 'Vâlcea' },
    { ciudad: 'Daia Română', judet: 'Sibiu' },
    { ciudad: 'Dascălu', judet: 'Ilfov' },
    { ciudad: 'Dobra', judet: 'Hunedoara' },
    { ciudad: 'Dobroești', judet: 'Ilfov' },
    { ciudad: 'Domnești', judet: 'Ilfov' },
    { ciudad: 'Dragodana', judet: 'Dâmbovița' },
    { ciudad: 'Dragomirești-Vale', judet: 'Ilfov' },
    { ciudad: 'Dridu', judet: 'Ialomița' },
    { ciudad: 'Drăgănești Vlașca', judet: 'Teleorman' },
    { ciudad: 'Dumbrava', judet: 'Timiș' },
    { ciudad: 'Dumbrava Roșie', judet: 'Neamț' },
    { ciudad: 'Dunavățu de Jos', judet: 'Tulcea' },
    { ciudad: 'Eforie', judet: 'Constanța' },
    { ciudad: 'Feldioara', judet: 'Brașov' },
    { ciudad: 'Fierbinți-Târg', judet: 'Ialomița' },
    { ciudad: 'Filipeștii de Pădure', judet: 'Prahova' },
    { ciudad: 'Frumoasa', judet: 'Harghita' },
    { ciudad: 'Frunzănești', judet: 'Olt' },
    { ciudad: 'Fundu Moldovei', judet: 'Suceava' },
    { ciudad: 'Găgești', judet: 'Vaslui' },
    { ciudad: 'Gănești', judet: 'Mureș' },
    { ciudad: 'Ghimbav', judet: 'Brașov' },
    { ciudad: 'Ghiroda', judet: 'Timiș' },
    { ciudad: 'Golești', judet: 'Argeș' },
    { ciudad: 'Gornești', judet: 'Mureș' },
    { ciudad: 'Gornet', judet: 'Prahova' },
    { ciudad: 'Grădiștea', judet: 'Ilfov' },
    { ciudad: 'Gruia', judet: 'Mehedinți' },
    { ciudad: 'Hălchiu', judet: 'Brașov' },
    { ciudad: 'Hărman', judet: 'Brașov' },
    { ciudad: 'Hârșova', judet: 'Constanța' },
    { ciudad: 'Holbav', judet: 'Brașov' },
    { ciudad: 'Holod', judet: 'Bihor' },
    { ciudad: 'Hopârta', judet: 'Alba' },
    { ciudad: 'Hotarele', judet: 'Giurgiu' },
    { ciudad: 'Hudești', judet: 'Botoșani' },
    { ciudad: 'Ianculeşti', judet: 'Teleorman' },
    { ciudad: 'Iara', judet: 'Cluj' },
    { ciudad: 'Ibănești', judet: 'Mureș' },
    { ciudad: 'Ighiu', judet: 'Alba' },
    { ciudad: 'Ion Corvin', judet: 'Constanța' },
    { ciudad: 'Josenii Bârgăului', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Leordeni', judet: 'Argeș' },
    { ciudad: 'Letea Veche', judet: 'Bacău' },
    { ciudad: 'Liebling', judet: 'Timiș' },
    { ciudad: 'Limanu', judet: 'Constanța' },
    { ciudad: 'Lisa', judet: 'Brașov' },
    { ciudad: 'Luncavița', judet: 'Tulcea' },
    { ciudad: 'Malu', judet: 'Giurgiu' },
    { ciudad: 'Mândruloc', judet: 'Arad' },
    { ciudad: 'Mărășești', judet: 'Vrancea' },
    { ciudad: 'Mărășu', judet: 'Brăila' },
    { ciudad: 'Merei', judet: 'Buzău' },
    { ciudad: 'Merișor', judet: 'Hunedoara' },
    { ciudad: 'Micești', judet: 'Alba' },
    { ciudad: 'Mihai Viteazu', judet: 'Constanța' },
    { ciudad: 'Mihăileni', judet: 'Sibiu' },
    { ciudad: 'Mircești', judet: 'Iași' },
    { ciudad: 'Mitreni', judet: 'Călărași' },
    { ciudad: 'Modelu', judet: 'Călărași' },
    { ciudad: 'Moieciu', judet: 'Brașov' },
    { ciudad: 'Movila Banului', judet: 'Buzău' },
    { ciudad: 'Murighiol', judet: 'Tulcea' },
    { ciudad: 'Mușătești', judet: 'Argeș' },
    { ciudad: 'Neagra Șarului', judet: 'Suceava' },
    { ciudad: 'Negrilești', judet: 'Vrancea' },
    { ciudad: 'Nucșoara', judet: 'Argeș' },
    { ciudad: 'Nuțeni', judet: 'Vrancea' },
    { ciudad: 'Oancea', judet: 'Galați' },
    { ciudad: 'Ocland', judet: 'Harghita' },
    { ciudad: 'Odobești', judet: 'Dâmbovița' },
    { ciudad: 'Ogrezeni', judet: 'Giurgiu' },
    { ciudad: 'Ohaba', judet: 'Alba' },
    { ciudad: 'Olănești', judet: 'Vâlcea' },
    { ciudad: 'Orăștioara de Sus', judet: 'Hunedoara' },
    { ciudad: 'Ostra', judet: 'Suceava' },
    { ciudad: 'Oteșani', judet: 'Vâlcea' },
    { ciudad: 'Pădurea Neagră', judet: 'Timiș' },
    { ciudad: 'Păulești', judet: 'Prahova' },
    { ciudad: 'Peștera', judet: 'Constanța' },
    { ciudad: 'Pietroasa', judet: 'Buzău' },
    { ciudad: 'Pietroșani', judet: 'Argeș' },
    { ciudad: 'Pipirig', judet: 'Neamț' },
    { ciudad: 'Plătărești', judet: 'Călărași' },
    { ciudad: 'Podari', judet: 'Dolj' },
    { ciudad: 'Poiana Lacului', judet: 'Argeș' },
    { ciudad: 'Poiana Mărului', judet: 'Brașov' },
    { ciudad: 'Poienile de sub Munte', judet: 'Maramureș' },
    { ciudad: 'Polovragi', judet: 'Gorj' },
    { ciudad: 'Praid', judet: 'Harghita' },
    { ciudad: 'Prejmer', judet: 'Brașov' },
    { ciudad: 'Pui', judet: 'Hunedoara' },
    { ciudad: 'Purcăreni', judet: 'Brașov' },
    { ciudad: 'Putna', judet: 'Suceava' },
    { ciudad: 'Racovița', judet: 'Sibiu' },
    { ciudad: 'Racu', judet: 'Harghita' },
    { ciudad: 'Rafaila', judet: 'Vaslui' },
    { ciudad: 'Rășinari', judet: 'Sibiu' },
    { ciudad: 'Rățești', judet: 'Argeș' },
    { ciudad: 'Râu Alb', judet: 'Hunedoara' },
    { ciudad: 'Râu de Mori', judet: 'Hunedoara' },
    { ciudad: 'Redea', judet: 'Olt' },
    { ciudad: 'Remetea Mare', judet: 'Timiș' },
    { ciudad: 'Repedea', judet: 'Maramureș' },
    { ciudad: 'Ribița', judet: 'Hunedoara' },
    { ciudad: 'Rociu', judet: 'Argeș' },
    { ciudad: 'Românești', judet: 'Timiș' },
    { ciudad: 'Roșcani', judet: 'Iași' },
    { ciudad: 'Roșia', judet: 'Bihor' },
    { ciudad: 'Rotunda', judet: 'Teleorman' },
    { ciudad: 'Rucăr', judet: 'Argeș' },
    { ciudad: 'Runcu', judet: 'Gorj' },
    { ciudad: 'Rușețu', judet: 'Buzău' },
    { ciudad: 'Șagu', judet: 'Arad' },
    { ciudad: 'Săhăteni', judet: 'Buzău' },
    { ciudad: 'Șăliștea', judet: 'Alba' },
    { ciudad: 'Sălsig', judet: 'Maramureș' },
    { ciudad: 'Sânandrei', judet: 'Timiș' },
    { ciudad: 'Sâncel', judet: 'Alba' },
    { ciudad: 'Sâncrăieni', judet: 'Harghita' },
    { ciudad: 'Sândominic', judet: 'Harghita' },
    { ciudad: 'Sângeru', judet: 'Prahova' },
    { ciudad: 'Sângeorz-Băi', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Sânpaul', judet: 'Cluj' },
    { ciudad: 'Sânpetru', judet: 'Brașov' },
    { ciudad: 'Sântimbru', judet: 'Alba' },
    { ciudad: 'Sascut', judet: 'Bacău' },
    { ciudad: 'Satu Nou', judet: 'Constanța' },
    { ciudad: 'Șcheia', judet: 'Suceava' },
    { ciudad: 'Șelimbăr', judet: 'Sibiu' },
    { ciudad: 'Seleuș', judet: 'Arad' },
    { ciudad: 'Sfântu Gheorghe', judet: 'Tulcea' },
    { ciudad: 'Sibiel', judet: 'Sibiu' },
    { ciudad: 'Siculeni', judet: 'Harghita' },
    { ciudad: 'Șieu', judet: 'Maramureș' },
    { ciudad: 'Simionești', judet: 'Harghita' },
    { ciudad: 'Șinca Nouă', judet: 'Brașov' },
    { ciudad: 'Șinca Veche', judet: 'Brașov' },
    { ciudad: 'Șirna', judet: 'Prahova' },
    { ciudad: 'Slătioara', judet: 'Vâlcea' },
    { ciudad: 'Slobozia Bradului', judet: 'Vrancea' },
    { ciudad: 'Socol', judet: 'Caraș-Severin' },
    { ciudad: 'Spătaru', judet: 'Buzău' },
    { ciudad: 'Suharău', judet: 'Botoșani' },
    { ciudad: 'Șura Mare', judet: 'Sibiu' },
    { ciudad: 'Șuștiu', judet: 'Arad' },
    { ciudad: 'Târgoviște', judet: 'Dâmbovița' },
    { ciudad: 'Tătărăștii de Sus', judet: 'Teleorman' },
    { ciudad: 'Telciu', judet: 'Bistrița-Năsăud' },
    { ciudad: 'Teliucu Inferior', judet: 'Hunedoara' },
    { ciudad: 'Tilișca', judet: 'Sibiu' },
    { ciudad: 'Tinca', judet: 'Bihor' },
    { ciudad: 'Tinosu', judet: 'Prahova' },
    { ciudad: 'Tisa', judet: 'Alba' },
    { ciudad: 'Tomești', judet: 'Iași' },
    { ciudad: 'Topalu', judet: 'Constanța' },
    { ciudad: 'Topolog', judet: 'Tulcea' },
    { ciudad: 'Tortoman', judet: 'Constanța' },
    { ciudad: 'Totești', judet: 'Hunedoara' },
    { ciudad: 'Traian', judet: 'Brăila' },
    { ciudad: 'Tunari', judet: 'Ilfov' },
    { ciudad: 'Țuțora', judet: 'Iași' },
    { ciudad: 'Uivar', judet: 'Timiș' },
    { ciudad: 'Ulmi', judet: 'Dâmbovița' },
    { ciudad: 'Ulmu', judet: 'Călărași' },
    { ciudad: 'Ungureni', judet: 'Bacău' },
    { ciudad: 'Unirea', judet: 'Alba' },
    { ciudad: 'Ususău', judet: 'Arad' },
    { ciudad: 'Vaideeni', judet: 'Vâlcea' },
    { ciudad: 'Valea Călugărească', judet: 'Prahova' },
    { ciudad: 'Valea Doftanei', judet: 'Prahova' },
    { ciudad: 'Valea Mare', judet: 'Olt' },
    { ciudad: 'Valea Stanciului', judet: 'Dolj' },
    { ciudad: 'Vânători', judet: 'Iași' },
    { ciudad: 'Vârciorova', judet: 'Mehedinți' },
    { ciudad: 'Vărvărești', judet: 'Botoșani' },
    { ciudad: 'Vășad', judet: 'Bihor' },
    { ciudad: 'Vetrișoaia', judet: 'Vaslui' },
    { ciudad: 'Viișoara', judet: 'Cluj' },
    { ciudad: 'Vintilă Vodă', judet: 'Buzău' },
    { ciudad: 'Viștea', judet: 'Brașov' },
    { ciudad: 'Vlădaia', judet: 'Mehedinți' },
    { ciudad: 'Vlăhița', judet: 'Harghita' },
    { ciudad: 'Voila', judet: 'Brașov' },
    { ciudad: 'Voitinel', judet: 'Suceava' },
    { ciudad: 'Vorona', judet: 'Botoșani' },
    { ciudad: 'Vulcana-Băi', judet: 'Dâmbovița' },
    { ciudad: 'Vulpeni', judet: 'Olt' },
    { ciudad: 'Zăbala', judet: 'Covasna' },
    { ciudad: 'Zalha', judet: 'Sălaj' },
    { ciudad: 'Zam', judet: 'Hunedoara' },
    { ciudad: 'Zătreni', judet: 'Vâlcea' },
    { ciudad: 'Zăvoi', judet: 'Caraș-Severin' },
    { ciudad: 'Zimandcuz', judet: 'Arad' },
    { ciudad: 'Zorleni', judet: 'Vaslui' },
  ];

  // Filtrar localidades según búsqueda
  const localidadesFiltradas = localidadBusqueda.length >= 2
    ? localidades.filter(loc => 
        loc.ciudad.toLowerCase().includes(localidadBusqueda.toLowerCase())
      ).slice(0, 10)
    : [];

  const handleSeleccionarLocalidad = (loc: {ciudad: string, judet: string}) => {
    setUbicacion(loc.ciudad);
    setProvincia(loc.judet);
    setLocalidadBusqueda(`${loc.ciudad}, ${loc.judet}`);
    setShowLocalidadSugerencias(false);
  };

  const totalSteps = 4;

  // Cerrar sugerencias cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('[data-localidad-search]')) {
        setShowLocalidadSugerencias(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Cargar teléfono del usuario al iniciar
  useEffect(() => {
    if (user?.phoneNumber) {
      setTelefono(user.phoneNumber);
    }
  }, [user]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith('image/'));
    if (imagenes.length + imageFiles.length > 10) {
      setError('Máximo 10 imágenes permitidas');
      return;
    }

    setImagenes(prev => [...prev, ...imageFiles]);
    
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenesPreview(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const removeImage = (index: number) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
    setImagenesPreview(imagenesPreview.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    const newImages = [...imagenes];
    const newPreviews = [...imagenesPreview];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    [newPreviews[from], newPreviews[to]] = [newPreviews[to], newPreviews[from]];
    setImagenes(newImages);
    setImagenesPreview(newPreviews);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return categoria !== '';
      case 2:
        return titulo.length >= 5 && descripcion.length >= 20;
      case 3:
        return imagenesPreview.length >= 1;
      case 4:
        return precio && provincia && ubicacion;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      setError('Debes iniciar sesión para publicar');
      return;
    }

    if (imagenes.length === 0) {
      setError('Debes subir al menos una imagen');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const anuncioData: any = {
        titulo,
        descripcion,
        precio: parseFloat(precio),
        moneda,
        categoria: categoria as Categoria,
        condicion,
        ubicacion,
        provincia,
        negociable,
        estado: EstadoAnuncio.EN_REVISION, // Estado inicial: en revisión
        usuarioId: user.uid,
        vendedorId: user.uid,
        etiquetas: [],
        imagenes: [],
        destacado: false,
        destacadoPrioridad: 0,
        promovado: false,
        ventaPresencial,
        telefono,
        fechaCreacionRevision: new Date().toISOString(), // Para auto-aprobar después de 30 segundos
      };

      // Agregar campos específicos por categoría
      if (categoria === Categoria.AUTO_MOTO) {
        if (autoMarca) anuncioData.autoMarca = autoMarca;
        if (autoModelo) anuncioData.autoModelo = autoModelo;
        if (autoAnio) anuncioData.autoAnio = parseInt(autoAnio);
        if (autoKilometros) anuncioData.autoKilometros = parseInt(autoKilometros);
        if (autoTransmision) anuncioData.autoTransmision = autoTransmision;
        if (autoCombustible) anuncioData.autoCombustible = autoCombustible;
        if (autoPotencia) anuncioData.autoPotencia = parseInt(autoPotencia);
        if (autoColor) anuncioData.autoColor = autoColor;
      }

      if (categoria === Categoria.IMOBILIARE) {
        if (inmoTipo) anuncioData.inmoTipo = inmoTipo;
        if (inmoOperacion) anuncioData.inmoOperacion = inmoOperacion;
        if (inmoHabitaciones) anuncioData.inmoHabitaciones = parseInt(inmoHabitaciones);
        if (inmoBanios) anuncioData.inmoBanios = parseInt(inmoBanios);
        if (inmoMetros) anuncioData.inmoMetros = parseInt(inmoMetros);
        anuncioData.inmoAmueblado = inmoAmueblado;
        anuncioData.inmoAscensor = inmoAscensor;
        anuncioData.inmoParking = inmoParking;
        anuncioData.inmoTerraza = inmoTerraza;
        anuncioData.inmoPiscina = inmoPiscina;
      }

      if (categoria === Categoria.ELECTRONICE) {
        if (electroMarca) anuncioData.electroMarca = electroMarca;
        if (electroModelo) anuncioData.electroModelo = electroModelo;
        anuncioData.electroGarantia = electroGarantia;
      }

      if (categoria === Categoria.LOCURI_DE_MUNCA) {
        if (empleoTipo) anuncioData.empleoTipo = empleoTipo;
        if (empleoExperiencia) anuncioData.empleoExperiencia = empleoExperiencia;
        if (empleoSalario) anuncioData.empleoSalario = empleoSalario;
        anuncioData.empleoRemoto = empleoRemoto;
      }

      if (categoria === Categoria.ANIMALE) {
        if (animalTipo) anuncioData.animalTipo = animalTipo;
        if (animalRaza) anuncioData.animalRaza = animalRaza;
        if (animalEdad) anuncioData.animalEdad = animalEdad;
        anuncioData.animalVacunado = animalVacunado;
      }

      const id = await createAnuncio(anuncioData, imagenes);
      
      // Auto-aprobar después de 30 segundos usando el API
      // Usamos fetch con keepalive para que siga ejecutándose aunque el usuario navegue
      setTimeout(async () => {
        try {
          await fetch('/api/auto-aprobar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anuncioId: id }),
            keepalive: true // Importante: permite que la request termine aunque la página cambie
          });
          console.log('✅ Solicitud de auto-aprobación enviada:', id);
        } catch (e) {
          console.error('Error en auto-aprobación:', e);
        }
      }, 30000); // 30 segundos
      
      router.push(`/ad/${id}?nuevo=true`);
    } catch (err) {
      console.error('Error al crear anuncio:', err);
      setError('Error al publicar el anuncio. Inténtalo de nuevo.');
      setLoading(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <Package className="text-white" size={32} />
          </div>
          <p className="text-gray-600">{t('general.loading')}</p>
        </div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-gray-100">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="text-indigo-600" size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('auth.login')}</h2>
          <p className="text-gray-500 mb-8">{t('publish.title')}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-4 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold"
          >
            {t('auth.login')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowLeft className="text-gray-600" size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('publish.title')}</h1>
                <p className="text-sm text-gray-500">{step} / {totalSteps}</p>
              </div>
            </div>
            
            {/* Progress */}
            <div className="hidden sm:flex items-center gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div 
                  key={s}
                  className={`flex items-center ${s < 4 ? 'gap-2' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    s < step 
                      ? 'bg-green-500 text-white' 
                      : s === step 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-400'
                  }`}>
                    {s < step ? <Check size={16} /> : s}
                  </div>
                  {s < 4 && (
                    <div className={`w-8 h-1 rounded-full transition-all ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Progress */}
      <div className="sm:hidden px-4 py-3 bg-white border-b">
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((s) => (
            <div 
              key={s}
              className={`h-1.5 rounded-full flex-1 transition-all ${
                s <= step ? 'bg-gradient-to-r from-indigo-500 to-purple-500' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1: Categoría */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Tag className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Qué quieres vender?</h2>
              <p className="text-gray-500">Selecciona la categoría que mejor describe tu producto</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.values(Categoria).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoria(cat)}
                  className={`p-4 rounded-2xl border-2 transition-all text-left group hover:shadow-md ${
                    categoria === cat 
                      ? 'border-indigo-500 bg-indigo-50 shadow-md' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                    categoria === cat 
                      ? 'bg-indigo-500 text-white' 
                      : 'bg-gray-100 text-gray-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                  }`}>
                    {categoryIcons[cat] || <Package size={20} />}
                  </div>
                  <p className={`font-medium text-sm ${categoria === cat ? 'text-indigo-700' : 'text-gray-700'}`}>
                    {cat}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Información */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <FileText className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('publish.description')}</h2>
              <p className="text-gray-500">{t('publish.descriptionPlaceholder')}</p>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm">
              {/* Título */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('publish.titleField')}
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  maxLength={80}
                  placeholder="Ej: iPhone 14 Pro 256GB como nuevo"
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">Mínimo 5 caracteres</p>
                  <p className={`text-xs ${titulo.length >= 5 ? 'text-green-600' : 'text-gray-400'}`}>
                    {titulo.length}/80
                  </p>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('publish.description')}
                </label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="Describe tu producto con detalle: estado, características, motivo de venta, accesorios incluidos..."
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400 resize-none"
                />
                <div className="flex justify-between mt-2">
                  <p className="text-xs text-gray-500">Mínimo 20 caracteres</p>
                  <p className={`text-xs ${descripcion.length >= 20 ? 'text-green-600' : 'text-gray-400'}`}>
                    {descripcion.length}/2000
                  </p>
                </div>
              </div>

              {/* Condición */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {t('publish.condition')}
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {Object.values(CondicionProducto).map((cond) => (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => setCondicion(cond)}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        condicion === cond 
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                          : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                      }`}
                    >
                      <p className="font-medium text-sm">{cond}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Campos específicos por categoría - AUTO MOTO */}
              {categoria === Categoria.AUTO_MOTO && (
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Car size={18} className="text-blue-600" />
                    Detalii vehicul
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marcă</label>
                      <input
                        type="text"
                        value={autoMarca}
                        onChange={(e) => setAutoMarca(e.target.value)}
                        placeholder="Ex: BMW, Audi..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                      <input
                        type="text"
                        value={autoModelo}
                        onChange={(e) => setAutoModelo(e.target.value)}
                        placeholder="Ex: Serie 3, A4..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">An fabricație</label>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Kilometraj</label>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Cutie de viteze</label>
                      <select
                        value={autoTransmision}
                        onChange={(e) => setAutoTransmision(e.target.value as 'manual' | 'automatico' | '')}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="manual">Manuală</option>
                        <option value="automatico">Automată</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Combustibil</label>
                      <select
                        value={autoCombustible}
                        onChange={(e) => setAutoCombustible(e.target.value as 'gasolina' | 'diesel' | 'electrico' | 'hibrido' | 'gas' | '')}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="gasolina">Benzină</option>
                        <option value="diesel">Diesel</option>
                        <option value="hibrido">Hibrid</option>
                        <option value="electrico">Electric</option>
                        <option value="gas">GPL/Gas</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Putere (CP)</label>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Culoare</label>
                      <input
                        type="text"
                        value={autoColor}
                        onChange={(e) => setAutoColor(e.target.value)}
                        placeholder="Negru, Alb..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos - IMOBILIARE */}
              {categoria === Categoria.IMOBILIARE && (
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Home size={18} className="text-emerald-600" />
                    Detalii imobil
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tip proprietate</label>
                      <select
                        value={inmoTipo}
                        onChange={(e) => setInmoTipo(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="piso">Apartament</option>
                        <option value="casa">Casă</option>
                        <option value="atico">Penthouse</option>
                        <option value="duplex">Duplex</option>
                        <option value="estudio">Garsonieră</option>
                        <option value="local">Spațiu comercial</option>
                        <option value="oficina">Birou</option>
                        <option value="terreno">Teren</option>
                        <option value="garaje">Garaj</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tip tranzacție</label>
                      <select
                        value={inmoOperacion}
                        onChange={(e) => setInmoOperacion(e.target.value as 'venta' | 'alquiler' | '')}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="venta">Vânzare</option>
                        <option value="alquiler">Închiriere</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Camere</label>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Băi</label>
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
                      <label className="block text-xs font-medium text-gray-600 mb-1">Suprafață (m²)</label>
                      <input
                        type="number"
                        value={inmoMetros}
                        onChange={(e) => setInmoMetros(e.target.value)}
                        placeholder="80"
                        min="0"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2 flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={inmoAmueblado} onChange={(e) => setInmoAmueblado(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-gray-600">Mobilat</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={inmoAscensor} onChange={(e) => setInmoAscensor(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-gray-600">Lift</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={inmoParking} onChange={(e) => setInmoParking(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-gray-600">Parcare</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={inmoTerraza} onChange={(e) => setInmoTerraza(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-gray-600">Terasă</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={inmoPiscina} onChange={(e) => setInmoPiscina(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500" />
                        <span className="text-sm text-gray-600">Piscină</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos - ELECTRONICE */}
              {categoria === Categoria.ELECTRONICE && (
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-sky-50 rounded-xl border border-cyan-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Smartphone size={18} className="text-cyan-600" />
                    Detalii produs electronic
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Marcă</label>
                      <input
                        type="text"
                        value={electroMarca}
                        onChange={(e) => setElectroMarca(e.target.value)}
                        placeholder="Ex: Apple, Samsung..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Model</label>
                      <input
                        type="text"
                        value={electroModelo}
                        onChange={(e) => setElectroModelo(e.target.value)}
                        placeholder="Ex: iPhone 15, Galaxy S24..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={electroGarantia} onChange={(e) => setElectroGarantia(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500" />
                        <span className="text-sm text-gray-600">Cu garanție</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos - LOCURI DE MUNCĂ */}
              {categoria === Categoria.LOCURI_DE_MUNCA && (
                <div className="p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase size={18} className="text-violet-600" />
                    Detalii job
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tip angajare</label>
                      <select
                        value={empleoTipo}
                        onChange={(e) => setEmpleoTipo(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="tiempo-completo">Full-time</option>
                        <option value="media-jornada">Part-time</option>
                        <option value="freelance">Freelance</option>
                        <option value="practicas">Internship</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Experiență cerută</label>
                      <select
                        value={empleoExperiencia}
                        onChange={(e) => setEmpleoExperiencia(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="sin-experiencia">Fără experiență</option>
                        <option value="1-2">1-2 ani</option>
                        <option value="3-5">3-5 ani</option>
                        <option value="5+">5+ ani</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Salariu (RON/lună)</label>
                      <input
                        type="text"
                        value={empleoSalario}
                        onChange={(e) => setEmpleoSalario(e.target.value)}
                        placeholder="Ex: 5000-7000"
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input type="checkbox" checked={empleoRemoto} onChange={(e) => setEmpleoRemoto(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-violet-600 focus:ring-violet-500" />
                        <span className="text-sm text-gray-600">Remote / Lucru de acasă</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Campos específicos - ANIMALE */}
              {categoria === Categoria.ANIMALE && (
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <PawPrint size={18} className="text-orange-600" />
                    Detalii animal
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Tip animal</label>
                      <select
                        value={animalTipo}
                        onChange={(e) => setAnimalTipo(e.target.value as any)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      >
                        <option value="">Selectează</option>
                        <option value="perro">Câine</option>
                        <option value="gato">Pisică</option>
                        <option value="pajaro">Pasăre</option>
                        <option value="pez">Pește</option>
                        <option value="roedor">Rozător</option>
                        <option value="reptil">Reptilă</option>
                        <option value="otro">Altul</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Rasă</label>
                      <input
                        type="text"
                        value={animalRaza}
                        onChange={(e) => setAnimalRaza(e.target.value)}
                        placeholder="Ex: Labrador, Siameză..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Vârstă</label>
                      <input
                        type="text"
                        value={animalEdad}
                        onChange={(e) => setAnimalEdad(e.target.value)}
                        placeholder="Ex: 2 ani, 6 luni..."
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer pb-2">
                        <input type="checkbox" checked={animalVacunado} onChange={(e) => setAnimalVacunado(e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500" />
                        <span className="text-sm text-gray-600">Vaccinat</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
              <div className="flex gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="text-amber-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Consejos para vender más rápido</h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Usa un título claro y descriptivo</li>
                    <li>• Menciona la marca y modelo si aplica</li>
                    <li>• Describe el estado real del producto</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Imágenes */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Camera className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('publish.photos')}</h2>
              <p className="text-gray-500">{t('publish.addPhotos')}</p>
            </div>

            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                dragActive 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-200 bg-white hover:border-indigo-300 hover:bg-gray-50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                multiple
              />
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${
                dragActive ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-400'
              }`}>
                <Upload size={28} />
              </div>
              <p className="font-semibold text-gray-700 mb-1">
                {dragActive ? 'Suelta las imágenes aquí' : 'Arrastra tus fotos aquí'}
              </p>
              <p className="text-sm text-gray-500">o haz clic para seleccionar</p>
              <p className="text-xs text-gray-400 mt-3">PNG, JPG o WEBP • Máx. 10 imágenes</p>
            </div>

            {/* Preview Grid */}
            {imagenesPreview.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {imagenesPreview.map((preview, index) => (
                  <div 
                    key={index} 
                    className={`relative aspect-square rounded-xl overflow-hidden group ${
                      index === 0 ? 'ring-2 ring-indigo-500 ring-offset-2' : ''
                    }`}
                  >
                    <Image
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImage(index, index - 1); }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ArrowLeft size={16} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      {index < imagenesPreview.length - 1 && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveImage(index, index + 1); }}
                          className="p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <ArrowRight size={16} />
                        </button>
                      )}
                    </div>
                    {/* Badge */}
                    {index === 0 && (
                      <span className="absolute bottom-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-lg font-medium">
                        Portada
                      </span>
                    )}
                  </div>
                ))}
                
                {/* Add more button */}
                {imagenesPreview.length < 10 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                  >
                    <Camera className="text-gray-400" size={24} />
                    <span className="text-xs text-gray-500">{imagenesPreview.length}/10</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Precio y ubicación */}
        {step === 4 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-200">
                <Euro className="text-white" size={28} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('publish.price')} & {t('publish.location')}</h2>
              <p className="text-gray-500">{t('publish.submit')}</p>
            </div>

            <div className="space-y-4">
              {/* Precio */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Euro size={18} className="text-indigo-500" />
                  {t('publish.price')}
                </h3>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={precio}
                      onChange={(e) => setPrecio(e.target.value)}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-2xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all"
                    />
                  </div>
                  <div className="flex rounded-xl overflow-hidden border border-gray-200">
                    <button
                      type="button"
                      onClick={() => setMoneda('LEI')}
                      className={`px-4 py-4 font-bold text-lg transition-all ${
                        moneda === 'LEI' 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      LEI
                    </button>
                    <button
                      type="button"
                      onClick={() => setMoneda('EUR')}
                      className={`px-4 py-4 font-bold text-lg transition-all ${
                        moneda === 'EUR' 
                          ? 'bg-indigo-500 text-white' 
                          : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      €
                    </button>
                  </div>
                </div>
                <label className="flex items-center gap-3 mt-4 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={negociable}
                    onChange={(e) => setNegociable(e.target.checked)}
                    className="w-5 h-5 rounded-lg border-gray-300 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-600">{t('ad.negotiable')}</span>
                </label>
              </div>

              {/* Ubicación */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm" data-localidad-search>
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-indigo-500" />
                  {t('publish.location')}
                </h3>
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-600 mb-2">Localitatea*</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={localidadBusqueda}
                      onChange={(e) => {
                        setLocalidadBusqueda(e.target.value);
                        setShowLocalidadSugerencias(true);
                        // Limpiar selección si el usuario modifica
                        if (ubicacion) {
                          setUbicacion('');
                          setProvincia('');
                        }
                      }}
                      onFocus={() => setShowLocalidadSugerencias(true)}
                      placeholder="Caută localitatea..."
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    />
                    {ubicacion && (
                      <button
                        type="button"
                        onClick={() => {
                          setLocalidadBusqueda('');
                          setUbicacion('');
                          setProvincia('');
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X size={16} className="text-gray-500" />
                      </button>
                    )}
                  </div>
                  
                  {/* Lista de sugerencias */}
                  {showLocalidadSugerencias && localidadesFiltradas.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
                      {localidadesFiltradas.map((loc, index) => (
                        <button
                          key={`${loc.ciudad}-${loc.judet}-${index}`}
                          type="button"
                          onClick={() => handleSeleccionarLocalidad(loc)}
                          className="w-full px-4 py-3 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center gap-2"
                        >
                          <MapPin size={16} className="text-gray-400 flex-shrink-0" />
                          <div>
                            <span className="font-medium text-gray-900">{loc.ciudad}</span>
                            <span className="text-gray-500">, {loc.judet}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {/* Mensaje si no hay resultados */}
                  {showLocalidadSugerencias && localidadBusqueda.length >= 2 && localidadesFiltradas.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500">
                      Nu s-au găsit rezultate pentru &quot;{localidadBusqueda}&quot;
                    </div>
                  )}
                  
                  {/* Indicador de localidad seleccionada */}
                  {ubicacion && provincia && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg">
                      <Check size={16} />
                      <span>Selectat: <strong>{ubicacion}</strong>, {provincia}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contacto */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-indigo-500" />
                  Opciones de contacto
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Teléfono (opcional)</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+34 600 000 000"
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent focus:bg-white transition-all text-gray-900 placeholder-gray-400"
                    />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={ventaPresencial}
                      onChange={(e) => setVentaPresencial(e.target.checked)}
                      className="w-5 h-5 rounded-lg border-gray-300 text-indigo-500 focus:ring-indigo-500"
                    />
                    <span className="text-sm text-gray-600">{t('ad.inPerson')}</span>
                  </label>
                </div>
              </div>

              {/* Opción de promocionar */}
              <div className="bg-white rounded-2xl border-2 border-dashed border-purple-200 p-6 shadow-sm hover:border-purple-400 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200/50">
                      <Rocket className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        ¡Promociona tu anuncio!
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold rounded-full">OPCIONAL</span>
                      </h3>
                      <p className="text-sm text-gray-500">Aumenta tu visibilidad hasta un 500%</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={promocionarAlPublicar}
                      onChange={(e) => {
                        setPromocionarAlPublicar(e.target.checked);
                        if (!e.target.checked) setTipoPromocion(null);
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>

                {promocionarAlPublicar && (
                  <div className="space-y-4 pt-4 border-t border-gray-100 animate-fadeIn">
                    {/* Mostrar descuento global si está activo */}
                    {configuracionPromociones?.descuentoGlobalActivo && configuracionPromociones?.descuentoGlobalPorcentaje > 0 && (
                      <div className="p-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl text-white">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🎉</span>
                          <div>
                            <p className="font-bold text-sm">¡{configuracionPromociones.descuentoGlobalPorcentaje}% DESCUENTO!</p>
                            <p className="text-xs text-white/80">{configuracionPromociones.mensajePromo || 'Promoción por tiempo limitado'}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Selección de tipo de promoción */}
                    <div className="grid grid-cols-3 gap-3">
                      {/* Destacado */}
                      <button
                        type="button"
                        onClick={() => setTipoPromocion('Destacado')}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          tipoPromocion === 'Destacado'
                            ? 'border-yellow-400 bg-yellow-50 shadow-lg shadow-yellow-100'
                            : 'border-gray-200 bg-white hover:border-yellow-300'
                        }`}
                      >
                        <Award className={`mx-auto mb-2 ${tipoPromocion === 'Destacado' ? 'text-yellow-500' : 'text-gray-400'}`} size={24} />
                        <p className="font-bold text-sm text-gray-900">Destacado</p>
                        <p className="text-xs text-gray-500">+100%</p>
                        {configuracionPromociones?.descuentoGlobalActivo && configuracionPromociones?.descuentoGlobalPorcentaje > 0 && (
                          <p className="text-xs text-gray-400 line-through">{configuracionPromociones.precioDestacado}€</p>
                        )}
                        <p className="text-lg font-black text-yellow-600 mt-1">{getPrecioPromocion('Destacado')}€</p>
                      </button>

                      {/* Premium */}
                      <button
                        type="button"
                        onClick={() => setTipoPromocion('Premium')}
                        className={`p-3 rounded-xl border-2 transition-all text-center relative ${
                          tipoPromocion === 'Premium'
                            ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg shadow-purple-100'
                            : 'border-gray-200 bg-white hover:border-purple-300'
                        }`}
                      >
                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-purple-500 text-white text-[8px] font-bold rounded-full flex items-center gap-0.5">
                          <Flame size={8} /> TOP
                        </span>
                        <Star className={`mx-auto mb-2 ${tipoPromocion === 'Premium' ? 'text-purple-500' : 'text-gray-400'}`} size={24} />
                        <p className="font-bold text-sm text-gray-900">Premium</p>
                        <p className="text-xs text-gray-500">+200%</p>
                        {configuracionPromociones?.descuentoGlobalActivo && configuracionPromociones?.descuentoGlobalPorcentaje > 0 && (
                          <p className="text-xs text-gray-400 line-through">{configuracionPromociones.precioPremium}€</p>
                        )}
                        <p className="text-lg font-black text-purple-600 mt-1">{getPrecioPromocion('Premium')}€</p>
                      </button>

                      {/* VIP */}
                      <button
                        type="button"
                        onClick={() => setTipoPromocion('VIP')}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          tipoPromocion === 'VIP'
                            ? 'border-pink-400 bg-gradient-to-br from-pink-50 to-red-50 shadow-lg shadow-pink-100'
                            : 'border-gray-200 bg-white hover:border-pink-300'
                        }`}
                      >
                        <Crown className={`mx-auto mb-2 ${tipoPromocion === 'VIP' ? 'text-pink-500' : 'text-gray-400'}`} size={24} />
                        <p className="font-bold text-sm text-gray-900">VIP</p>
                        <p className="text-xs text-gray-500">+500%</p>
                        {configuracionPromociones?.descuentoGlobalActivo && configuracionPromociones?.descuentoGlobalPorcentaje > 0 && (
                          <p className="text-xs text-gray-400 line-through">{configuracionPromociones.precioVIP}€</p>
                        )}
                        <p className="text-lg font-black text-pink-600 mt-1">{getPrecioPromocion('VIP')}€</p>
                      </button>
                    </div>

                    {/* Duración */}
                    {tipoPromocion && (
                      <div className="animate-fadeIn">
                        <p className="text-sm font-medium text-gray-700 mb-2">Duración:</p>
                        <div className="flex gap-2">
                          {[
                            { dias: 7 as const, multiplicador: 1 },
                            { dias: 14 as const, multiplicador: 1.8, ahorro: '10%' },
                            { dias: 30 as const, multiplicador: 3.5, ahorro: '17%' },
                          ].map((opcion) => {
                            const precioBase = getPrecioPromocion(tipoPromocion);
                            const precio = Math.round(precioBase * opcion.multiplicador);
                            return (
                              <button
                                key={opcion.dias}
                                type="button"
                                onClick={() => setDuracionPromocion(opcion.dias)}
                                className={`flex-1 py-2 px-3 rounded-lg border-2 transition-all ${
                                  duracionPromocion === opcion.dias
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300'
                                }`}
                              >
                                <p className="font-bold text-sm">{opcion.dias} días</p>
                                <p className="text-lg font-black text-purple-600">{precio}€</p>
                                {opcion.ahorro && <span className="text-[10px] text-green-600 font-bold">-{opcion.ahorro}</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Total */}
                    {tipoPromocion && (
                      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 flex items-center justify-between animate-fadeIn">
                        <div className="flex items-center gap-2">
                          <Zap className="text-purple-600" size={20} />
                          <span className="font-medium text-gray-900">
                            {tipoPromocion} por {duracionPromocion} días
                          </span>
                        </div>
                        <span className="text-xl font-black text-purple-600">
                          +{(() => {
                            const precioBase = getPrecioPromocion(tipoPromocion);
                            const multiplicador = duracionPromocion === 7 ? 1 : duracionPromocion === 14 ? 1.8 : 3.5;
                            return Math.round(precioBase * multiplicador);
                          })()}€
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Resumen */}
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 border border-indigo-100">
                <h3 className="font-semibold text-gray-900 mb-4">Resumen de tu anuncio</h3>
                <div className="flex gap-4">
                  {imagenesPreview[0] && (
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
                      <Image src={imagenesPreview[0]} alt="Preview" width={80} height={80} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{titulo || 'Sin título'}</p>
                    <p className="text-sm text-gray-500 truncate">{categoria || 'Sin categoría'}</p>
                    <p className="text-lg font-bold text-indigo-600 mt-1">{precio ? `${precio} ${moneda === 'EUR' ? '€' : 'Lei'}` : 'Sin precio'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mt-6">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              disabled={loading}
              className="flex-1 px-6 py-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50"
            >
              {t('general.previous')}
            </button>
          )}
          
          {step < totalSteps ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-2"
            >
              {t('general.next')}
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !canProceed()}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  {t('publish.saving')}
                </>
              ) : (
                <>
                  <CheckCircle2 size={20} />
                  {t('publish.submit')}
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
