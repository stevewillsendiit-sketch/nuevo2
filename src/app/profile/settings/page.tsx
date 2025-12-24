"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useDesign, designStyles, cardVariants } from '@/contexts/DesignContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Shield, 
  Lock, 
  Smartphone,
  Globe,
  Moon,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Phone,
  Building2,
  FileText,
  Clock,
  Save,
  Check,
  X,
  ChevronRight,
  Trash2,
  AlertTriangle,
  LogOut,
  CreditCard,
  HelpCircle,
  MessageSquare,
  Palette,
  Volume2,
  Download,
  Upload,
  Key,
  Brush
} from 'lucide-react';

type SettingsTab = 'cuenta' | 'notificaciones' | 'privacidad' | 'seguridad' | 'apariencia' | 'ayuda';

const languages: { code: Language; name: string; flag: string; nativeName: string }[] = [
  { code: 'es', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'ro', name: 'Romanian', flag: '🇷🇴', nativeName: 'Română' },
];

export default function ProfileSettingsPage() {
  const router = useRouter();
  const { user, usuario, loading, signOut } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { design, setDesign, cardVariant, setCardVariant } = useDesign();
  const [activeTab, setActiveTab] = useState<SettingsTab>('cuenta');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Formulario de cuenta
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    ubicacion: '',
    // Empresa
    nombreComercial: '',
    cif: '',
    direccionFiscal: '',
    web: '',
    horarioAtencion: '',
    descripcionEmpresa: ''
  });
  
  // Notificaciones
  const [notifications, setNotifications] = useState({
    emailMensajes: true,
    emailFavoritos: true,
    emailPromociones: false,
    pushMensajes: true,
    pushFavoritos: false,
    sonido: true
  });
  
  // Privacidad
  const [privacy, setPrivacy] = useState({
    mostrarTelefono: true,
    mostrarUbicacion: true,
    mostrarEstadisticas: false,
    perfilPublico: true
  });
  
  // Cambio de contraseña
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [loading, user, router]);
  
  useEffect(() => {
    if (usuario) {
      setFormData({
        nombre: usuario.nombre || '',
        telefono: usuario.telefono?.toString() || '',
        ubicacion: usuario.ubicacion || '',
        nombreComercial: usuario.nombreComercial || '',
        cif: usuario.cif || '',
        direccionFiscal: usuario.direccionFiscal || '',
        web: usuario.web || '',
        horarioAtencion: usuario.horarioAtencion || '',
        descripcionEmpresa: usuario.descripcionEmpresa || ''
      });
    }
  }, [usuario]);

  const handleSaveAccount = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        nombre: formData.nombre,
        ubicacion: formData.ubicacion,
        telefono: formData.telefono ? parseInt(formData.telefono) : null,
      };
      
      if (usuario?.tipoUsuario === 'empresa') {
        updateData.nombreComercial = formData.nombreComercial;
        updateData.cif = formData.cif;
        updateData.direccionFiscal = formData.direccionFiscal;
        updateData.web = formData.web;
        updateData.horarioAtencion = formData.horarioAtencion;
        updateData.descripcionEmpresa = formData.descripcionEmpresa;
      }
      
      await updateDoc(doc(db, 'usuarios', user.uid), updateData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
      alert('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
  };
  
  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    setPasswordError('');
    setPasswordSuccess(false);
    
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    
    try {
      const credential = EmailAuthProvider.credential(user.email, passwordForm.currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwordForm.newPassword);
      setPasswordSuccess(true);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (error: unknown) {
      console.error('Error cambiando contraseña:', error);
      if ((error as { code?: string }).code === 'auth/wrong-password') {
        setPasswordError('La contraseña actual es incorrecta');
      } else {
        setPasswordError('Error al cambiar la contraseña');
      }
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">{t('settings.loadingSettings')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">{t('settings.redirectingLogin')}</p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'cuenta', label: t('settings.account'), icon: User },
    { id: 'notificaciones', label: t('settings.notifications'), icon: Bell },
    { id: 'privacidad', label: t('settings.privacy'), icon: Eye },
    { id: 'seguridad', label: t('settings.security'), icon: Shield },
    { id: 'apariencia', label: t('settings.appearance'), icon: Palette },
    { id: 'ayuda', label: t('settings.help'), icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-blue-50/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => router.push('/profile')}
                className="p-2 -ml-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <ArrowLeft size={20} className="text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{t('settings.title')}</h1>
                <p className="text-sm text-gray-500 hidden sm:block">{t('settings.manageAccount')}</p>
              </div>
            </div>
            
            {activeTab === 'cuenta' && (
              <button
                onClick={handleSaveAccount}
                disabled={saving}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  saveSuccess 
                    ? 'bg-green-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } disabled:opacity-50`}
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <Check size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span className="hidden sm:inline">{saveSuccess ? t('settings.saved') : t('settings.save')}</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar de navegación */}
          <aside className="lg:w-64 flex-shrink-0">
            <nav className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {usuario?.nombre?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{usuario?.nombre}</p>
                    <p className="text-sm text-gray-500 truncate">{usuario?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as SettingsTab)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                        activeTab === tab.id
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} />
                      <span className="font-medium">{tab.label}</span>
                      <ChevronRight size={16} className={`ml-auto transition-transform ${activeTab === tab.id ? 'rotate-90' : ''}`} />
                    </button>
                  );
                })}
              </div>
              
              <div className="p-4 border-t border-gray-100">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-all"
                >
                  <LogOut size={20} />
                  <span className="font-medium">{t('settings.logout')}</span>
                </button>
              </div>
            </nav>
          </aside>

          {/* Contenido principal */}
          <main className="flex-1 min-w-0">
            {/* Tab: Cuenta */}
            {activeTab === 'cuenta' && (
              <div className="space-y-6">
                {/* Información personal */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <User size={20} className="text-blue-500" />
                      {t('settings.personalInfo')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.updateInfo')}</p>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.fullName')}</label>
                        <div className="relative">
                          <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={t('settings.yourName')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.email')}</label>
                        <div className="relative">
                          <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="email"
                            value={usuario?.email || ''}
                            disabled
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{t('settings.emailNotChange')}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.phone')}</label>
                        <div className="relative">
                          <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.telefono}
                            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={t('settings.yourPhone')}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.location')}</label>
                        <div className="relative">
                          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={formData.ubicacion}
                            onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder={t('settings.yourCity')}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
                
                {/* Datos de empresa (solo para empresas) */}
                {usuario?.tipoUsuario === 'empresa' && (
                  <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-white">
                      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Building2 size={20} className="text-amber-500" />
                        {t('settings.companyData')}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">{t('settings.businessInfo')}</p>
                    </div>
                    
                    <div className="p-6 space-y-5">
                      <div className="grid sm:grid-cols-2 gap-5">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.commercialName')}</label>
                          <input
                            type="text"
                            value={formData.nombreComercial}
                            onChange={(e) => setFormData({ ...formData, nombreComercial: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder={t('settings.companyName')}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.cif')}</label>
                          <div className="relative">
                            <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={formData.cif}
                              onChange={(e) => setFormData({ ...formData, cif: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                              placeholder="B12345678"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.fiscalAddress')}</label>
                          <input
                            type="text"
                            value={formData.direccionFiscal}
                            onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                            placeholder={t('settings.fiscalAddress')}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.website')}</label>
                          <div className="relative">
                            <Globe size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="url"
                              value={formData.web}
                              onChange={(e) => setFormData({ ...formData, web: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                              placeholder="https://company.com"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.schedule')}</label>
                          <div className="relative">
                            <Clock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={formData.horarioAtencion}
                              onChange={(e) => setFormData({ ...formData, horarioAtencion: e.target.value })}
                              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                              placeholder="Lun-Vin 9:00-18:00"
                            />
                          </div>
                        </div>
                        
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.companyDescription')}</label>
                          <textarea
                            value={formData.descripcionEmpresa}
                            onChange={(e) => setFormData({ ...formData, descripcionEmpresa: e.target.value })}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                            placeholder="Describe tu empresa, servicios, especialidades..."
                          />
                        </div>
                      </div>
                    </div>
                  </section>
                )}
                
                {/* Zona de peligro */}
                <section className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-red-100 bg-gradient-to-r from-red-50 to-white">
                    <h2 className="text-lg font-semibold text-red-600 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      {t('settings.dangerZone')}
                    </h2>
                    <p className="text-sm text-red-400 mt-1">{t('settings.irreversibleActions')}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-red-50/50 rounded-xl border border-red-100">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.deleteAccount')}</h3>
                        <p className="text-sm text-gray-500">{t('settings.deleteWarning')}</p>
                      </div>
                      <button 
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        <Trash2 size={16} />
                        {t('settings.delete')}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Tab: Notificaciones */}
            {activeTab === 'notificaciones' && (
              <div className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Mail size={20} className="text-blue-500" />
                      {t('settings.emailNotifications')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.chooseEmails')}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <ToggleOption
                      title={t('settings.newMessages')}
                      description={t('settings.newMessagesDesc')}
                      checked={notifications.emailMensajes}
                      onChange={(v) => setNotifications({ ...notifications, emailMensajes: v })}
                    />
                    <ToggleOption
                      title={t('settings.favoritesNotif')}
                      description={t('settings.favoritesNotifDesc')}
                      checked={notifications.emailFavoritos}
                      onChange={(v) => setNotifications({ ...notifications, emailFavoritos: v })}
                    />
                    <ToggleOption
                      title={t('settings.promotionsNews')}
                      description={t('settings.promotionsNewsDesc')}
                      checked={notifications.emailPromociones}
                      onChange={(v) => setNotifications({ ...notifications, emailPromociones: v })}
                    />
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Smartphone size={20} className="text-green-500" />
                      {t('settings.pushNotifications')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.pushDesc')}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <ToggleOption
                      title={t('settings.messages')}
                      description={t('settings.instantNotif')}
                      checked={notifications.pushMensajes}
                      onChange={(v) => setNotifications({ ...notifications, pushMensajes: v })}
                    />
                    <ToggleOption
                      title={t('settings.favoritesActivity')}
                      description={t('settings.priceAlerts')}
                      checked={notifications.pushFavoritos}
                      onChange={(v) => setNotifications({ ...notifications, pushFavoritos: v })}
                    />
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Volume2 size={20} className="text-purple-500" />
                      {t('settings.sounds')}
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <ToggleOption
                      title={t('settings.soundsNotif')}
                      description={t('settings.soundsNotifDesc')}
                      checked={notifications.sonido}
                      onChange={(v) => setNotifications({ ...notifications, sonido: v })}
                    />
                  </div>
                </section>
              </div>
            )}

            {/* Tab: Privacidad */}
            {activeTab === 'privacidad' && (
              <div className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Eye size={20} className="text-blue-500" />
                      {t('settings.profileVisibility')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.controlInfo')}</p>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <ToggleOption
                      title={t('settings.publicProfile')}
                      description={t('settings.publicProfileDesc')}
                      checked={privacy.perfilPublico}
                      onChange={(v) => setPrivacy({ ...privacy, perfilPublico: v })}
                    />
                    <ToggleOption
                      title={t('settings.showPhone')}
                      description={t('settings.showPhoneDesc')}
                      checked={privacy.mostrarTelefono}
                      onChange={(v) => setPrivacy({ ...privacy, mostrarTelefono: v })}
                    />
                    <ToggleOption
                      title={t('settings.showLocation')}
                      description={t('settings.showLocationDesc')}
                      checked={privacy.mostrarUbicacion}
                      onChange={(v) => setPrivacy({ ...privacy, mostrarUbicacion: v })}
                    />
                    <ToggleOption
                      title={t('settings.showStats')}
                      description={t('settings.showStatsDesc')}
                      checked={privacy.mostrarEstadisticas}
                      onChange={(v) => setPrivacy({ ...privacy, mostrarEstadisticas: v })}
                    />
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Download size={20} className="text-green-500" />
                      {t('settings.yourData')}
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.downloadData')}</h3>
                        <p className="text-sm text-gray-500">{t('settings.downloadDataDesc')}</p>
                      </div>
                      <button className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-medium transition-colors flex items-center gap-2">
                        <Download size={16} />
                        {t('settings.download')}
                      </button>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Tab: Seguridad */}
            {activeTab === 'seguridad' && (
              <div className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Lock size={20} className="text-blue-500" />
                      {t('settings.password')}
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.changePassword')}</h3>
                        <p className="text-sm text-gray-500">{t('settings.changePasswordDesc')}</p>
                      </div>
                      <button 
                        onClick={() => setShowPasswordModal(true)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors flex items-center gap-2"
                      >
                        <Key size={16} />
                        {t('settings.change')}
                      </button>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Shield size={20} className="text-green-500" />
                      {t('settings.twoFactor')}
                    </h2>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-green-50 rounded-xl border border-green-100">
                      <div>
                        <h3 className="font-medium text-gray-900">{t('settings.twoFactorAuth')}</h3>
                        <p className="text-sm text-gray-500">{t('settings.twoFactorDesc')}</p>
                      </div>
                      <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium transition-colors">
                        {t('settings.activate')}
                      </button>
                    </div>
                  </div>
                </section>


                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Smartphone size={20} className="text-purple-500" />
                      {t('settings.activeSessions')}
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Globe size={20} className="text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{t('settings.thisDevice')}</p>
                          <p className="text-sm text-gray-500">{t('settings.lastActivity')}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">{t('settings.active')}</span>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Tab: Apariencia */}
            {activeTab === 'apariencia' && (
              <div className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Moon size={20} className="text-indigo-500" />
                      {t('settings.themeTitle')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.themeDesc')}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-3 gap-4">
                      <button 
                        onClick={() => setTheme('light')}
                        className={`group p-4 rounded-xl border-2 transition-all ${
                          theme === 'light' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-video bg-white rounded-lg mb-3 shadow-sm border flex items-center justify-center">
                          <div className="w-8 h-8 bg-yellow-400 rounded-full shadow-lg"></div>
                        </div>
                        <p className={`text-sm font-medium ${theme === 'light' ? 'text-blue-600' : 'text-gray-600'}`}>{t('settings.light')}</p>
                        {theme === 'light' && (
                          <div className="mt-2 flex justify-center">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={() => setTheme('dark')}
                        className={`group p-4 rounded-xl border-2 transition-all ${
                          theme === 'dark' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-video bg-gray-800 rounded-lg mb-3 shadow-sm flex items-center justify-center">
                          <div className="w-6 h-6 bg-gray-600 rounded-full border-2 border-gray-400"></div>
                        </div>
                        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-blue-600' : 'text-gray-600'}`}>{t('settings.dark')}</p>
                        {theme === 'dark' && (
                          <div className="mt-2 flex justify-center">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                      <button 
                        onClick={() => setTheme('system')}
                        className={`group p-4 rounded-xl border-2 transition-all ${
                          theme === 'system' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-full aspect-video bg-gradient-to-b from-white to-gray-800 rounded-lg mb-3 shadow-sm flex items-center justify-center">
                          <Smartphone size={20} className="text-gray-500" />
                        </div>
                        <p className={`text-sm font-medium ${theme === 'system' ? 'text-blue-600' : 'text-gray-600'}`}>{t('settings.system')}</p>
                        {theme === 'system' && (
                          <div className="mt-2 flex justify-center">
                            <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check size={12} className="text-white" />
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </section>

                {/* Selector de Estilo de Diseño */}
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Brush size={20} className="text-purple-500" />
                      {t('settings.designStyle')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.designStyleDesc')}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid gap-4">
                      {designStyles.map((style) => (
                        <button
                          key={style.id}
                          onClick={() => setDesign(style.id)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                            design === style.id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                        >
                          {/* Preview del diseño */}
                          <div 
                            className="w-16 h-16 rounded-xl flex-shrink-0 shadow-inner overflow-hidden"
                            style={{ background: style.preview }}
                          >
                            <div className="w-full h-full flex items-center justify-center">
                              <div className="w-8 h-6 bg-white/90 rounded-sm shadow-sm" />
                            </div>
                          </div>
                          
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">{style.name}</p>
                            <p className="text-sm text-gray-500">{style.description}</p>
                            {/* Muestra de colores */}
                            <div className="flex gap-1 mt-2">
                              {style.colors.map((color, idx) => (
                                <div 
                                  key={idx}
                                  className="w-5 h-5 rounded-full shadow-sm border border-white/50"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                          </div>
                          
                          {design === style.id && (
                            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                    
                    {/* Selector de variante de tarjeta - Solo si hay un diseño seleccionado */}
                    {design !== 'default' && (
                      <div className="mt-6 pt-6 border-t border-purple-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Palette size={16} className="text-purple-500" />
                          {t('settings.cardStyle')}
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {cardVariants
                            .filter(v => v.forDesign.includes(design))
                            .map((variant) => (
                              <button
                                key={variant.id}
                                onClick={() => setCardVariant(variant.id)}
                                className={`p-3 rounded-xl border-2 transition-all text-left ${
                                  cardVariant === variant.id
                                    ? 'border-purple-500 bg-purple-50'
                                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                                }`}
                              >
                                <p className="font-medium text-sm text-gray-900">{variant.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{variant.description}</p>
                                {cardVariant === variant.id && (
                                  <div className="mt-2 flex justify-end">
                                    <div className="w-4 h-4 bg-purple-600 rounded-full flex items-center justify-center">
                                      <Check size={10} className="text-white" />
                                    </div>
                                  </div>
                                )}
                              </button>
                            ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Nota informativa */}
                    <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
                      <p className="text-sm text-purple-700">
                        <strong>💡 Consejo:</strong> {t('settings.designTip')}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Globe size={20} className="text-green-500" />
                      {t('settings.language')}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">{t('settings.languageDesc')}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid gap-3">
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => setLanguage(lang.code)}
                          className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${
                            language === lang.code
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <span className="text-3xl">{lang.flag}</span>
                          <div className="flex-1 text-left">
                            <p className="font-semibold text-gray-900">{lang.nativeName}</p>
                            <p className="text-sm text-gray-500">{lang.name}</p>
                          </div>
                          {language === lang.code && (
                            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <Check size={14} className="text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Tab: Ayuda */}
            {activeTab === 'ayuda' && (
              <div className="space-y-6">
                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <HelpCircle size={20} className="text-blue-500" />
                      {t('settings.helpCenter')}
                    </h2>
                  </div>
                  
                  <div className="p-6 space-y-3">
                    <HelpLink icon={<MessageSquare size={20} />} title={t('settings.faq')} description={t('settings.faqDesc')} />
                    <HelpLink icon={<FileText size={20} />} title={t('settings.guides')} description={t('settings.guidesDesc')} />
                    <HelpLink icon={<Mail size={20} />} title={t('settings.contactSupport')} description={t('settings.contactSupportDesc')} />
                    <HelpLink icon={<Shield size={20} />} title={t('settings.privacyPolicy')} description={t('settings.privacyPolicyDesc')} />
                    <HelpLink icon={<FileText size={20} />} title={t('settings.terms')} description={t('settings.termsDesc')} />
                  </div>
                </section>

                <section className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-sm overflow-hidden text-white p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                      <MessageSquare size={32} />
                    </div>
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="text-xl font-bold">{t('settings.needHelp')}</h3>
                      <p className="text-white/80 mt-1">{t('settings.teamAvailable')}</p>
                    </div>
                    <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-colors">
                      {t('settings.chatNow')}
                    </button>
                  </div>
                </section>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modal: Eliminar cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{t('settings.deleteAccountQuestion')}</h3>
              <p className="text-gray-500 mb-6">{t('settings.deleteAccountWarning')}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  {t('settings.cancel')}
                </button>
                <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors">
                  {t('settings.deleteAccount')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Cambiar contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowPasswordModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <button 
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
            
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-900">{t('settings.changePasswordTitle')}</h3>
              <p className="text-gray-500 text-sm mt-1">{t('settings.changePasswordSubtitle')}</p>
            </div>
            
            {passwordSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check size={32} className="text-green-600" />
                </div>
                <p className="text-lg font-medium text-gray-900">{t('settings.passwordUpdated')}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.currentPassword')}</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.newPassword')}</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button 
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t('settings.confirmPassword')}</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {passwordError && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{passwordError}</p>
                )}
                
                <button
                  onClick={handleChangePassword}
                  className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                >
                  {t('settings.updatePassword')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Toggle
function ToggleOption({ title, description, checked, onChange }: { 
  title: string; 
  description: string; 
  checked: boolean; 
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${checked ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}

// Componente HelpLink
function HelpLink({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <button className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors text-left">
      <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{title}</h3>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <ChevronRight size={20} className="text-gray-400" />
    </button>
  );
}
