"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Anuncio, Usuario } from '@/types';
import { getAnuncioById, incrementarVistas } from '@/lib/anuncios.service';
import { getUsuario } from '@/lib/auth.service';
import { crearConversacion } from '@/lib/mensajes.service';
import { crearReporte } from '@/lib/admin.service';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { toggleFavorito, isFavorito } from '@/lib/favoritos.service';
import Image from 'next/image';
import { ArrowLeft, Heart, Share2, MapPin, Eye, Calendar, MessageCircle, Phone, ChevronLeft, ChevronRight, Shield, Clock, Tag, Star, BadgeCheck, AlertTriangle, Copy, Crown, Gem, Zap, ExternalLink, Car, Home, Briefcase, Smartphone, PawPrint, Wrench, Shirt, Sofa, Dumbbell, Baby, Plane, Users, Gauge, Fuel, Settings, Palette, Building, Bed, Bath, Ruler, ParkingCircle, Waves, Trees, CheckCircle, XCircle, X, Flag, Edit3 } from 'lucide-react';
import { Categoria } from '@/types';
import { UniversalCard } from '@/components/DesignCards';

type Props = { id: string };

export default function ClientDetail({ id }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [anuncio, setAnuncio] = useState<Anuncio | null>(null);
  const [vendedor, setVendedor] = useState<Usuario | null>(null);
  const [anunciosVendedor, setAnunciosVendedor] = useState<Anuncio[]>([]);
  const [loading, setLoading] = useState(true);
  const [esFavorito, setEsFavorito] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [promocion, setPromocion] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMotivo, setReportMotivo] = useState<'spam' | 'fraude' | 'contenido_inapropiado' | 'producto_ilegal' | 'duplicado' | 'otro'>('spam');
  const [reportDescripcion, setReportDescripcion] = useState('');
  const [enviandoReporte, setEnviandoReporte] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [mensajeTexto, setMensajeTexto] = useState('');

  useEffect(() => {
    if (id) {
      loadAnuncio(id);
      setEsFavorito(isFavorito(id));
      
      // Cargar promoción si existe - solo en cliente
      if (typeof window !== 'undefined') {
        const promocionesGuardadas = localStorage.getItem('promocionesActivas');
        if (promocionesGuardadas) {
          try {
            const promociones = JSON.parse(promocionesGuardadas);
            const promo = promociones.find((p: any) => p.anuncioId === id && p.diasRestantes > 0);
            setPromocion(promo);
          } catch (e) {}
        }
      }
    }
  }, [id]);

  // Auto-aprobar si el anuncio está en revisión y pertenece al usuario actual
  useEffect(() => {
    if (anuncio && user && anuncio.estado === 'En revisión' && anuncio.vendedorId === user.uid) {
      const timeoutId = setTimeout(async () => {
        try {
          const response = await fetch('/api/auto-aprobar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ anuncioId: id })
          });
          const result = await response.json();
          if (result.success) {
            console.log('✅ Anuncio auto-aprobado');
            // Recargar el anuncio para actualizar el estado
            loadAnuncio(id);
          }
        } catch (e) {
          console.error('Error en auto-aprobación:', e);
        }
      }, 30000); // 30 segundos

      return () => clearTimeout(timeoutId);
    }
  }, [anuncio, user, id]);

  const loadAnuncio = async (id: string) => {
    setLoading(true);
    try {
      const data = await getAnuncioById(id);
      if (data) {
        setAnuncio(data);
        await incrementarVistas(id);
        try {
          const vid = (data as any).vendedorId || (data as any).usuarioId || null;
          if (vid) {
            const u = await getUsuario(vid);
            if (u) setVendedor(u);
            
            // Cargar otros anuncios del vendedor
            const { getDocs, collection, query, where, limit } = await import('firebase/firestore');
            const { db } = await import('@/lib/firebase');
            const anunciosRef = collection(db, 'anuncios');
            const q = query(
              anunciosRef, 
              where('vendedorId', '==', vid),
              limit(6)
            );
            const querySnapshot = await getDocs(q);
            const otrosAnuncios: Anuncio[] = [];
            querySnapshot.forEach((doc: any) => {
              if (doc.id !== id) { // Excluir el anuncio actual
                otrosAnuncios.push({ id: doc.id, ...doc.data() } as Anuncio);
              }
            });
            setAnunciosVendedor(otrosAnuncios.slice(0, 5));
          }
        } catch (err) {
          console.error('Error cargando vendedor:', err);
        }
      }
    } catch (error) {
      console.error('Error loading anuncio:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarMensaje = async () => {
    if (!user || !anuncio) {
      router.push('/login');
      return;
    }

    if (anuncio.vendedorId === user.uid) {
      alert('Nu îți poți trimite mesaje ție însuți');
      return;
    }

    // Mostrar modal para escribir mensaje
    setShowMessageModal(true);
  };

  const handleConfirmarEnvioMensaje = async () => {
    if (!user || !anuncio || !mensajeTexto.trim()) return;

    setEnviandoMensaje(true);
    try {
      await crearConversacion(
        [user.uid, anuncio.vendedorId],
        anuncio.id,
        mensajeTexto.trim(),
        user.uid
      );
      setShowMessageModal(false);
      setMensajeTexto('');
      router.push('/messages');
    } catch (error) {
      console.error('Error al crear conversación:', error);
      alert('Eroare la trimiterea mesajului. Încearcă din nou.');
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const handleToggleFavorito = () => {
    if (anuncio) {
      toggleFavorito(anuncio.id);
      setEsFavorito(!esFavorito);
    }
  };

  const handleReportarAnuncio = async () => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!anuncio) return;

    setEnviandoReporte(true);
    try {
      await crearReporte({
        anuncioId: anuncio.id,
        reportadorId: user.uid,
        motivo: reportMotivo,
        descripcion: reportDescripcion || undefined,
      });
      setShowReportModal(false);
      setReportMotivo('spam');
      setReportDescripcion('');
      alert('Reporte enviado correctamente. Nuestro equipo lo revisará pronto.');
    } catch (error) {
      console.error('Error al reportar:', error);
      alert('Error al enviar el reporte. Inténtalo de nuevo.');
    } finally {
      setEnviandoReporte(false);
    }
  };

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = `Mira este anuncio: ${anuncio?.titulo}`;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        break;
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'copy':
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const isVIP = promocion?.tipo === 'VIP';
  const isPremium = promocion?.tipo === 'Premium';

  // Función para renderizar las características específicas de cada categoría
  const renderCategoryDetails = (anuncio: any) => {
    const a = anuncio as any;
    
    // Función para capitalizar primera letra
    const capitalize = (str: string | number | boolean) => {
      if (typeof str !== 'string') return str;
      return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    };

    // Componente de característica individual
    const Feature = ({ icon: Icon, label, value, color = "blue" }: { icon: any; label: string; value: string | number | boolean | null | undefined; color?: string }) => {
      if (value === null || value === undefined || value === '') return null;
      
      const displayValue = typeof value === 'boolean' 
        ? (value ? 'Da' : 'Nu') 
        : capitalize(value);
      
      return (
        <div className="flex items-center gap-2 py-1.5">
          <span className="text-gray-500 text-sm min-w-[100px]">{label}:</span>
          <span className="font-medium text-gray-900 text-sm">{displayValue}</span>
        </div>
      );
    };

    // Componente de característica booleana
    const BoolFeature = ({ label, value, iconYes = CheckCircle, iconNo = XCircle }: { label: string; value: boolean | undefined; iconYes?: any; iconNo?: any }) => {
      if (value === undefined) return null;
      return (
        <div className="flex items-center gap-2 py-1.5">
          <span className="text-gray-500 text-sm min-w-[100px]">{label}:</span>
          <span className={`text-sm font-medium ${value ? 'text-emerald-600' : 'text-gray-400'}`}>
            {value ? 'Da' : 'Nu'}
          </span>
        </div>
      );
    };

    // AUTO_MOTO
    if (anuncio.categoria === Categoria.AUTO_MOTO || a.autoMarca) {
      const hasAutoData = a.autoMarca || a.autoModelo || a.autoAnio || a.autoKilometros || a.autoCombustible;
      if (!hasAutoData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Caracteristici vehicul</h3>
          <div className="space-y-0">
            <Feature icon={Car} label="Marcă" value={a.autoMarca} color="red" />
            <Feature icon={Tag} label="Model" value={a.autoModelo} color="red" />
            <Feature icon={Calendar} label="An" value={a.autoAnio} color="blue" />
            <Feature icon={Gauge} label="Kilometri" value={a.autoKilometros ? `${a.autoKilometros.toLocaleString()} km` : null} color="amber" />
            <Feature icon={Fuel} label="Combustibil" value={a.autoCombustible} color="green" />
            <Feature icon={Settings} label="Transmisie" value={a.autoTransmision} color="purple" />
            <Feature icon={Zap} label="Putere" value={a.autoPotencia ? `${a.autoPotencia} CP` : null} color="amber" />
            <Feature icon={Palette} label="Culoare" value={a.autoColor} color="pink" />
          </div>
        </div>
      );
    }

    // INMOBILIARE
    if (anuncio.categoria === Categoria.IMOBILIARE || a.inmoTipo) {
      const hasInmoData = a.inmoTipo || a.inmoOperacion || a.inmoHabitaciones || a.inmoBanios || a.inmoMetros;
      if (!hasInmoData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Caracteristici imobil</h3>
          <div className="space-y-0">
            <Feature icon={Building} label="Tip" value={a.inmoTipo} color="purple" />
            <Feature icon={Tag} label="Operațiune" value={a.inmoOperacion} color="blue" />
            <Feature icon={Bed} label="Camere" value={a.inmoHabitaciones} color="amber" />
            <Feature icon={Bath} label="Băi" value={a.inmoBanios} color="cyan" />
            <Feature icon={Ruler} label="Suprafață" value={a.inmoMetros ? `${a.inmoMetros} m²` : null} color="green" />
            <BoolFeature label="Mobilat" value={a.inmoAmueblado} />
            <BoolFeature label="Lift" value={a.inmoAscensor} />
            <BoolFeature label="Parcare" value={a.inmoParking} />
            <BoolFeature label="Terasă" value={a.inmoTerraza} />
            <BoolFeature label="Piscină" value={a.inmoPiscina} />
          </div>
        </div>
      );
    }

    // ELECTRONICE
    if (anuncio.categoria === Categoria.ELECTRONICE || a.electroMarca) {
      const hasElectroData = a.electroMarca || a.electroModelo || a.electroAnio;
      if (!hasElectroData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Specificații</h3>
          <div className="space-y-0">
            <Feature icon={Tag} label="Marcă" value={a.electroMarca} color="cyan" />
            <Feature icon={Smartphone} label="Model" value={a.electroModelo} color="blue" />
            <Feature icon={Calendar} label="An" value={a.electroAnio} color="amber" />
            {a.electroGarantia !== undefined && <BoolFeature label="Garanție" value={a.electroGarantia} />}
          </div>
        </div>
      );
    }

    // LOCURI_DE_MUNCA (Empleo)
    if (anuncio.categoria === Categoria.LOCURI_DE_MUNCA || a.empleoTipo) {
      const hasEmpleoData = a.empleoTipo || a.empleoExperiencia || a.empleoSalario;
      if (!hasEmpleoData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii loc de muncă</h3>
          <div className="space-y-0">
            <Feature icon={Briefcase} label="Tip contract" value={a.empleoTipo} color="green" />
            <Feature icon={Star} label="Experiență" value={a.empleoExperiencia} color="amber" />
            <Feature icon={Tag} label="Salariu" value={a.empleoSalario} color="blue" />
            {a.empleoRemoto !== undefined && <BoolFeature label="Lucru de acasă" value={a.empleoRemoto} />}
          </div>
        </div>
      );
    }

    // ANIMALE
    if (anuncio.categoria === Categoria.ANIMALE || a.animalTipo) {
      const hasAnimalData = a.animalTipo || a.animalRaza || a.animalEdad;
      if (!hasAnimalData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Informații animal</h3>
          <div className="space-y-0">
            <Feature icon={PawPrint} label="Tip" value={a.animalTipo} color="orange" />
            <Feature icon={Tag} label="Rasă" value={a.animalRaza} color="amber" />
            <Feature icon={Calendar} label="Vârstă" value={a.animalEdad} color="blue" />
            <BoolFeature label="Vaccinat" value={a.animalVacunado} />
            <BoolFeature label="Deparazitat" value={a.animalDesparasitado} />
          </div>
        </div>
      );
    }

    // SERVICII
    if (anuncio.categoria === Categoria.SERVICII || a.servicioTipo) {
      const hasServicioData = a.servicioTipo || a.servicioDisponibilidad || a.servicioExperiencia;
      if (!hasServicioData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii serviciu</h3>
          <div className="space-y-0">
            <Feature icon={Wrench} label="Tip" value={a.servicioTipo} color="amber" />
            <Feature icon={Clock} label="Disponibilitate" value={a.servicioDisponibilidad} color="blue" />
            <Feature icon={Star} label="Experiență" value={a.servicioExperiencia} color="green" />
            {a.servicioDesplazamiento !== undefined && <BoolFeature label="Se deplasează" value={a.servicioDesplazamiento} />}
          </div>
        </div>
      );
    }

    // MODA_ACCESORII
    if (anuncio.categoria === Categoria.MODA_ACCESORII || a.modaTipo) {
      const hasModaData = a.modaTipo || a.modaGenero || a.modaTalla || a.modaMarca;
      if (!hasModaData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii articol</h3>
          <div className="space-y-0">
            <Feature icon={Shirt} label="Tip" value={a.modaTipo} color="pink" />
            <Feature icon={Users} label="Gen" value={a.modaGenero} color="purple" />
            <Feature icon={Ruler} label="Mărime" value={a.modaTalla} color="blue" />
            <Feature icon={Tag} label="Marcă" value={a.modaMarca} color="amber" />
            <Feature icon={Palette} label="Culoare" value={a.modaColor} color="cyan" />
          </div>
        </div>
      );
    }

    // CASA_GRADINA
    if (anuncio.categoria === Categoria.CASA_GRADINA || a.casaTipo) {
      const hasCasaData = a.casaTipo || a.casaMaterial || a.casaDimensiones;
      if (!hasCasaData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii articol</h3>
          <div className="space-y-0">
            <Feature icon={Sofa} label="Tip" value={a.casaTipo} color="green" />
            <Feature icon={Tag} label="Material" value={a.casaMaterial} color="amber" />
            <Feature icon={Ruler} label="Dimensiuni" value={a.casaDimensiones} color="blue" />
            {a.casaMontaje !== undefined && <BoolFeature label="Necesită montaj" value={a.casaMontaje} />}
          </div>
        </div>
      );
    }

    // TIMP_LIBER_SPORT
    if (anuncio.categoria === Categoria.TIMP_LIBER_SPORT || a.deporteTipo) {
      const hasDeporteData = a.deporteTipo || a.deporteMarca || a.deporteTalla;
      if (!hasDeporteData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii articol</h3>
          <div className="space-y-0">
            <Feature icon={Dumbbell} label="Tip" value={a.deporteTipo} color="blue" />
            <Feature icon={Tag} label="Marcă" value={a.deporteMarca} color="amber" />
            <Feature icon={Ruler} label="Mărime" value={a.deporteTalla} color="green" />
          </div>
        </div>
      );
    }

    // MAMA_COPIL
    if (anuncio.categoria === Categoria.MAMA_COPIL || a.mamaTipo) {
      const hasMamaData = a.mamaTipo || a.mamaEdadRecomendada || a.mamaMarca;
      if (!hasMamaData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii articol</h3>
          <div className="space-y-0">
            <Feature icon={Baby} label="Tip" value={a.mamaTipo} color="pink" />
            <Feature icon={Calendar} label="Vârstă recomandată" value={a.mamaEdadRecomendada} color="purple" />
            <Feature icon={Tag} label="Marcă" value={a.mamaMarca} color="amber" />
          </div>
        </div>
      );
    }

    // CAZARE_TURISM
    if (anuncio.categoria === Categoria.CAZARE_TURISM || a.alojamientoTipo) {
      const hasAlojamientoData = a.alojamientoTipo || a.alojamientoCapacidad || a.alojamientoPrecioNoche;
      if (!hasAlojamientoData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Detalii cazare</h3>
          <div className="space-y-0">
            <Feature icon={Building} label="Tip" value={a.alojamientoTipo} color="teal" />
            <Feature icon={Users} label="Capacitate" value={a.alojamientoCapacidad ? `${a.alojamientoCapacidad} persoane` : null} color="blue" />
            <Feature icon={Tag} label="Preț/noapte" value={a.alojamientoPrecioNoche ? `${a.alojamientoPrecioNoche}€` : null} color="green" />
          </div>
          {a.alojamientoServicios && a.alojamientoServicios.length > 0 && (
            <div className="mt-2">
              <span className="text-gray-500 text-sm">Servicii incluse: </span>
              <span className="text-gray-900 text-sm">{a.alojamientoServicios.join(', ')}</span>
            </div>
          )}
        </div>
      );
    }

    // MATRIMONIALE
    if (anuncio.categoria === Categoria.MATRIMONIALE || a.matrimonialEdad) {
      const hasMatrimonialData = a.matrimonialEdad || a.matrimonialBusco;
      if (!hasMatrimonialData) return null;
      
      return (
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3">Informații profil</h3>
          <div className="space-y-0">
            <Feature icon={Calendar} label="Vârstă" value={a.matrimonialEdad ? `${a.matrimonialEdad} ani` : null} color="pink" />
            <Feature icon={Heart} label="Caut" value={a.matrimonialBusco} color="purple" />
          </div>
        </div>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Tag className="w-6 h-6 text-blue-600 animate-pulse" />
          </div>
        </div>
        <p className="text-gray-500 animate-pulse">Se încarcă...</p>
      </div>
    );
  }

  if (!anuncio) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col items-center justify-center p-6">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('error.notFound')}</h2>
        <p className="text-gray-500 mb-6">{t('error.generic')}</p>
        <button 
          onClick={() => router.push('/')} 
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/25"
        >
          {t('nav.home')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header minimalista */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => {
                  router.back();
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'instant' }), 100);
                }} 
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="hidden sm:block h-5 w-px bg-gray-200" />
              <h1 
                onClick={() => router.push('/')}
                className="text-lg font-bold text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
              >
                VINDEL
              </h1>
            </div>
            <div className="flex items-center gap-1">
              <div className="relative">
                <button 
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Share2 className="w-5 h-5 text-gray-600" />
                </button>
                {showShareMenu && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-200 p-1.5 min-w-[180px] z-50">
                    <button onClick={() => handleShare('whatsapp')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.198.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.363.709.306 1.262.489 1.694.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
                      </div>
                      <span className="font-medium text-gray-700">WhatsApp</span>
                    </button>
                    <button onClick={() => handleShare('facebook')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white">
                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </div>
                      <span className="font-medium text-gray-700">Facebook</span>
                    </button>
                    <button onClick={() => handleShare('copy')} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-sm">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
                        <Copy className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-medium text-gray-700">{copied ? 'Copiat!' : 'Copiază link'}</span>
                    </button>
                  </div>
                )}
              </div>
              <button 
                onClick={handleToggleFavorito}
                className={`p-2.5 rounded-lg transition-colors ${
                  esFavorito ? 'bg-red-50 text-red-500' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <Heart className="w-5 h-5" fill={esFavorito ? 'currentColor' : 'none'} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <button onClick={() => router.push('/')} className="hover:text-blue-600 transition-colors">{t('nav.home')}</button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-400">{anuncio.categoria}</span>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 font-medium truncate max-w-[200px]">{anuncio.titulo}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Columna principal */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Galería de imágenes */}
            <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
              {/* Badge de promoción */}
              {promocion && (
                <div className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${
                  isVIP 
                    ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white'
                }`}>
                  {isVIP ? <Gem size={16} /> : <Crown size={16} />}
                  Anunț {promocion.tipo} • {promocion.diasRestantes} zile rămase
                </div>
              )}
              
              <div className="relative aspect-[16/9] bg-gray-100">
                <Image
                  src={anuncio.imagenes[imageIndex] || '/placeholder.jpg'}
                  alt={anuncio.titulo}
                  fill
                  className="object-cover"
                  priority
                />
                
                {anuncio.imagenes.length > 1 && (
                  <>
                    <button
                      onClick={() => setImageIndex(Math.max(0, imageIndex - 1))}
                      disabled={imageIndex === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all disabled:opacity-30"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setImageIndex(Math.min(anuncio.imagenes.length - 1, imageIndex + 1))}
                      disabled={imageIndex === anuncio.imagenes.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-all disabled:opacity-30"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {imageIndex + 1} / {anuncio.imagenes.length}
                    </div>
                  </>
                )}
              </div>

              {/* Miniaturas */}
              {anuncio.imagenes.length > 1 && (
                <div className="flex gap-1.5 p-2 bg-gray-50 border-t border-gray-100 overflow-x-auto">
                  {anuncio.imagenes.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setImageIndex(idx)}
                      onMouseEnter={() => setImageIndex(idx)}
                      className={`relative w-14 h-14 rounded-md overflow-hidden flex-shrink-0 transition-all border-2 ${
                        imageIndex === idx 
                          ? 'border-blue-500' 
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={img} alt={`Imagine ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Información del anuncio */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Header con título y precio */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                      {anuncio.titulo}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        <Tag size={12} />
                        {anuncio.categoria}
                      </span>
                      {anuncio.condicion && (
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                          anuncio.condicion === 'Nuevo' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {anuncio.condicion === 'Nuevo' ? 'Nou' : anuncio.condicion === 'Usado' ? 'Folosit' : anuncio.condicion}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-3xl font-black ${isVIP ? 'text-pink-600' : isPremium ? 'text-amber-600' : 'text-gray-900'}`}>
                      {anuncio.precio?.toLocaleString('ro-RO')} 
                      <span className="text-lg font-semibold text-gray-500 ml-1">{anuncio.moneda === 'LEI' ? 'Lei' : '€'}</span>
                    </p>
                    {(anuncio as any).negociable && (
                      <p className="text-xs text-gray-500 mt-0.5">Preț negociabil</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-600">
                {(anuncio.ubicacion || anuncio.provincia) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={15} className="text-gray-400" />
                    <span>{anuncio.ubicacion || anuncio.provincia}</span>
                  </div>
                )}
                {anuncio.fechaPublicacion && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={15} className="text-gray-400" />
                    <span>{new Date(anuncio.fechaPublicacion).toLocaleDateString('ro-RO', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Eye size={15} className="text-gray-400" />
                  <span>{anuncio.vistas || 0} vizualizări</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart size={15} className="text-gray-400" />
                  <span>{anuncio.favoritos || 0} favorite</span>
                </div>
              </div>

              {/* Descripción - Formato simple */}
              <div className="p-5">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Descriere</h3>
                <div className="space-y-2">
                  {anuncio.descripcion.split('\n').map((line, lineIndex) => {
                    const trimmedLine = line.trim();
                    if (!trimmedLine) return <br key={lineIndex} />;
                    return (
                      <p key={lineIndex} className="text-gray-600 leading-relaxed text-[15px]">{trimmedLine}</p>
                    );
                  })}
                </div>
              </div>

              {/* Características específicas por categoría */}
              {renderCategoryDetails(anuncio) && (
                <div className="px-5 pb-5">
                  {renderCategoryDetails(anuncio)}
                </div>
              )}

              {/* ID y estado */}
              <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span className="font-mono">ID: {anuncio.id}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  anuncio.estado === 'Activo' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {anuncio.estado === 'Activo' ? 'Activ' : anuncio.estado}
                </span>
              </div>
            </div>

            {/* Mai multe de la vânzător */}
            {anunciosVendedor.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Mai multe de la vânzător</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{anunciosVendedor.length} anunțuri</span>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                    {anunciosVendedor.map((otroAnuncio) => (
                      <UniversalCard key={otroAnuncio.id} anuncio={otroAnuncio} compact />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-4">
            {/* Tarjeta del vendedor */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                    isVIP 
                      ? 'bg-gradient-to-br from-rose-500 to-pink-600' 
                      : isPremium 
                        ? 'bg-gradient-to-br from-amber-500 to-orange-500'
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {vendedor?.nombre ? vendedor.nombre[0].toUpperCase() : 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-gray-900 truncate">{vendedor?.nombre || 'Utilizator'}</h3>
                      {(isVIP || isPremium) && (
                        <BadgeCheck className={`w-4 h-4 flex-shrink-0 ${isVIP ? 'text-pink-500' : 'text-amber-500'}`} />
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Vânzător particular</p>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                  {(() => {
                    const anuncioOwnerId = anuncio.vendedorId || (anuncio as any).usuarioId;
                    const isOwner = user && anuncioOwnerId && user.uid === anuncioOwnerId;
                    console.log('DEBUG Edit Button:', { userId: user?.uid, anuncioOwnerId, vendedorId: anuncio.vendedorId, usuarioId: (anuncio as any).usuarioId, isOwner });
                    return isOwner ? (
                      <button
                        onClick={() => router.push(`/ad/${anuncio.id}/edit`)}
                        className="w-full py-3.5 rounded-xl font-semibold bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800 transition-all shadow-lg shadow-gray-900/20 flex items-center justify-center gap-2"
                      >
                        <Edit3 size={18} />
                        Editează anunț
                      </button>
                    ) : null;
                  })()}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={handleEnviarMensaje}
                      disabled={enviandoMensaje}
                      className="flex-1 py-3.5 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 shadow-lg shadow-amber-600/25 hover:shadow-amber-500/40 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                    >
                      {enviandoMensaje ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Se trimite...
                        </>
                      ) : (
                        <>
                          <MessageCircle size={18} />
                          Mesaj
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => {
                        const telefono = (anuncio as any).telefono || vendedor?.telefono;
                        if (telefono) {
                          window.open(`tel:${telefono}`, '_self');
                        }
                      }}
                      className="flex-1 py-3.5 rounded-xl font-semibold bg-gradient-to-r from-emerald-500 to-green-600 text-white hover:from-emerald-400 hover:to-green-500 transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    >
                      <Phone size={18} />
                      {(anuncio as any).telefono || vendedor?.telefono || 'Sună'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Seguridad */}
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <div className="flex gap-3">
                <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-900 text-sm mb-1">Sfaturi de siguranță</h4>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Nu trimite niciodată bani în avans. Verifică produsul înainte de a plăti.
                  </p>
                </div>
              </div>
            </div>

            {/* Reportar */}
            <button 
              onClick={() => setShowReportModal(true)}
              className="w-full py-2.5 text-gray-500 hover:text-red-600 text-sm font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2 border border-gray-200"
            >
              <Flag size={14} />
              Raportează anunț
            </button>
          </div>
        </div>
      </div>

      {/* Modal de Reporte */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                  <Flag className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Raportează anunț</h3>
              </div>
              <button 
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivul raportului
                </label>
                <select
                  value={reportMotivo}
                  onChange={(e) => setReportMotivo(e.target.value as any)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="spam">Spam sau publicitate înșelătoare</option>
                  <option value="fraude">Posibilă fraudă sau înșelătorie</option>
                  <option value="contenido_inapropiado">Conținut inadecvat</option>
                  <option value="producto_ilegal">Produs ilegal</option>
                  <option value="duplicado">Anunț duplicat</option>
                  <option value="otro">Alt motiv</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descriere suplimentară (opțional)
                </label>
                <textarea
                  value={reportDescripcion}
                  onChange={(e) => setReportDescripcion(e.target.value)}
                  placeholder="Spune-ne mai multe detalii despre problemă..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleReportarAnuncio}
                  disabled={enviandoReporte}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {enviandoReporte ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    'Trimite raportul'
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-4 text-center">
              Rapoartele false pot duce la suspendarea contului tău.
            </p>
          </div>
        </div>
      )}

      {/* Modal de enviar mensaje */}
      {showMessageModal && anuncio && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-white" />
                <h3 className="text-lg font-bold text-white">Trimite mesaj</h3>
              </div>
              <button
                onClick={() => {
                  setShowMessageModal(false);
                  setMensajeTexto('');
                }}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Info del anuncio */}
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                {anuncio.imagenes?.[0] && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={anuncio.imagenes[0]}
                      alt={anuncio.titulo}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{anuncio.titulo}</p>
                  <p className="text-blue-600 font-bold">{anuncio.precio?.toLocaleString('ro-RO')} {anuncio.moneda === 'LEI' ? 'Lei' : '€'}</p>
                  <p className="text-sm text-gray-500">Vânzător: {vendedor?.nombre || 'Utilizator'}</p>
                </div>
              </div>
            </div>

            {/* Campo de mensaje */}
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesajul tău
                </label>
                <textarea
                  value={mensajeTexto}
                  onChange={(e) => setMensajeTexto(e.target.value)}
                  placeholder={`Bună, mă interesează anunțul tău "${anuncio.titulo}"...`}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                  rows={4}
                  autoFocus
                />
                <p className="text-xs text-gray-400 mt-2">
                  Scrie un mesaj personalizat pentru vânzător
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMensajeTexto('');
                  }}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  Anulează
                </button>
                <button
                  onClick={handleConfirmarEnvioMensaje}
                  disabled={enviandoMensaje || !mensajeTexto.trim()}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25"
                >
                  {enviandoMensaje ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Trimite mesaj
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
