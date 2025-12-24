"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTheme } from '@/contexts/ThemeContext';
import { onSnapshot, doc, collection, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  Plus, Mail, Bell, User, Menu, X, Sparkles, ChevronDown, 
  Sun, Moon, Shield, Heart, Home, Grid3X3, LogOut,
  Settings, Crown, Rocket
} from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { isAdmin } from '@/lib/admin.service';
import Image from 'next/image';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();
  const { setTheme, resolvedTheme } = useTheme();
  const { user, usuario, loading: authLoading, syncingFavoritos, signOut } = useAuth();
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const [notifNoLeidos, setNotifNoLeidos] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  // Verificar si el usuario es admin
  useEffect(() => {
    async function checkAdmin() {
      if (user?.uid) {
        const adminStatus = await isAdmin(user.uid);
        setIsUserAdmin(adminStatus);
      } else {
        setIsUserAdmin(false);
      }
    }
    checkAdmin();
  }, [user?.uid]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile menu on outside click
  useEffect(() => {
    if (!showProfileMenu) return;
    function onClick(e: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [showProfileMenu]);

  // Mensajes no leídos
  useEffect(() => {
    if (!user?.uid) { setMensajesNoLeidos(0); return; }
    const q = query(
      collection(db, 'conversaciones'),
      where('participantes', 'array-contains', user.uid)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let total = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        total += data[`noLeidos_${user.uid}`] || 0;
      });
      setMensajesNoLeidos(total);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  // Notificaciones no leídas
  useEffect(() => {
    if (!user?.uid) { setNotifNoLeidos(0); return; }
    const notifRef = doc(db, 'notifCounters', user.uid);
    const unsub = onSnapshot(notifRef, (snap) => {
      const data = snap.exists() ? snap.data() : null;
      setNotifNoLeidos(data?.totalNoLeidos || 0);
    });
    return () => unsub();
  }, [user?.uid]);

  // No mostrar header en la página de búsqueda
  if (pathname === '/search') return null;

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-700 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl shadow-[0_1px_0_0_rgba(0,0,0,0.05)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]' 
          : 'bg-white dark:bg-slate-950'
      }`}>
        <div className="max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between h-20 px-6 lg:px-10 gap-6">
            
            {/* Left: Logo + Brand - Diseño limpio y profesional */}
            <div 
              className="flex items-center gap-3 cursor-pointer group flex-shrink-0" 
              onClick={() => router.push('/')}
            >
              {/* Logo minimalista */}
              <div className={`w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 ${
                isScrolled ? 'scale-95' : 'scale-100'
              } group-hover:scale-105`}>
                <Rocket className="text-white w-5 h-5" />
              </div>
              
              {/* Brand Name - Tipografía limpia */}
              <div className="hidden sm:flex items-baseline gap-0.5">
                <span className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
                  Vindel
                </span>
                <span className="text-lg font-medium text-blue-600 dark:text-blue-400">10</span>
              </div>
            </div>

            {/* Center: Navigation Links - Rediseño ultra moderno */}
            <nav className="hidden lg:flex items-center gap-2 bg-gray-50/50 dark:bg-slate-900/50 rounded-2xl p-1.5 backdrop-blur-sm border border-gray-200/50 dark:border-slate-800/50">
              <NavLink href="/" icon={<Home size={18} />} label={t('nav.home')} active={pathname === '/'} router={router} />
              <NavLink href="/explore" icon={<Grid3X3 size={18} />} label={t('action.explore')} active={pathname === '/explore'} router={router} />
              <NavLink href="/vip" icon={<Crown size={18} />} label="VIP" active={pathname === '/vip'} premium router={router} />
            </nav>

            {/* Right: Actions - Diseño premium con espaciado perfecto */}
            <div className="flex items-center gap-2 ml-auto">
              {authLoading ? (
                <div className="flex items-center gap-3">
                  <div className="w-32 h-11 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl animate-pulse" />
                  <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl animate-pulse" />
                </div>
              ) : user ? (
                <>
                  {/* Publish Button - Diseño completamente nuevo y llamativo */}
                  <button
                    onClick={() => router.push('/publish')}
                    className="group relative overflow-hidden flex items-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 hover:from-violet-500 hover:via-violet-400 hover:to-blue-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-500"
                  >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    
                    <Plus className="w-5 h-5 relative z-10" />
                    <span className="hidden sm:inline relative z-10">{t('nav.publish')}</span>
                    <Sparkles className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:rotate-12 transition-all duration-500 relative z-10" />
                  </button>

                  {/* Messages */}
                  <IconButton
                    onClick={() => router.push('/messages')}
                    icon={<Mail className="w-[18px] h-[18px]" />}
                    badge={mensajesNoLeidos}
                    tooltip={t('nav.messages')}
                    color="blue"
                  />

                  {/* Notifications */}
                  <IconButton
                    onClick={() => router.push('/notificaciones')}
                    icon={<Bell className="w-[18px] h-[18px]" />}
                    badge={notifNoLeidos}
                    tooltip={t('nav.notifications')}
                    color="amber"
                  />

                  {/* Profile Dropdown - Diseño premium */}
                  <div className="relative" ref={profileMenuRef}>
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-900/50 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-800"
                    >
                      {/* Avatar con efecto mejorado */}
                      <div className="relative group/avatar">
                        {usuario?.avatar ? (
                          <Image
                            src={usuario.avatar}
                            alt="Avatar"
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-2xl object-cover ring-2 ring-gray-200 dark:ring-slate-800 group-hover/avatar:ring-violet-500 transition-all duration-300"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-violet-600 to-blue-600 rounded-2xl flex items-center justify-center ring-2 ring-gray-200 dark:ring-slate-800 group-hover/avatar:ring-violet-500 transition-all duration-300">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        )}
                        {syncingFavoritos && (
                          <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-950 animate-spin" />
                        )}
                      </div>
                      <ChevronDown className={`w-4 h-4 text-gray-400 hidden sm:block transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Profile Dropdown Menu - Ultra moderno */}
                    {showProfileMenu && (
                      <div className="absolute right-0 top-full mt-4 w-72 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-3xl shadow-2xl shadow-gray-300/20 dark:shadow-black/60 border border-gray-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
                        {/* User Info - Header ultra elegante */}
                        <div className="relative p-5 bg-gradient-to-br from-violet-50 via-blue-50 to-purple-50 dark:from-slate-800 dark:via-slate-900 dark:to-slate-900 border-b border-gray-200/50 dark:border-slate-700/50">
                          {/* Decoración de fondo */}
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjIwIiBoZWlnaHQ9IjIwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDIwIDAgTCAwIDAgMCAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDEwMCwxMDAsMTAwLDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30" />
                          
                          <div className="relative">
                            <p className="font-bold text-gray-900 dark:text-white truncate text-base">
                              {usuario?.nombre || 'Usuario'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                              {user?.email}
                            </p>
                            {usuario?.plan && usuario.plan !== 'Gratis' && (
                              <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-500/30">
                                <Crown size={14} />
                                <span>{usuario.plan}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Menu Items */}
                        <div className="p-2">
                          <MenuLink href="/profile" icon={<User size={18} />} label={t('profile.myProfile')} onClick={() => setShowProfileMenu(false)} router={router} />
                          <MenuLink href="/profile?panel=favoritos" icon={<Heart size={18} />} label={t('nav.favorites')} onClick={() => setShowProfileMenu(false)} router={router} />
                          <MenuLink href="/profile/settings" icon={<Settings size={18} />} label={t('nav.settings')} onClick={() => setShowProfileMenu(false)} router={router} />
                          
                          {isUserAdmin && (
                            <>
                              <div className="my-2 border-t border-gray-100 dark:border-slate-700" />
                              <MenuLink href="/admin" icon={<Shield size={18} />} label="Panel Admin" onClick={() => setShowProfileMenu(false)} admin router={router} />
                            </>
                          )}
                          
                          <div className="my-2 border-t border-gray-100 dark:border-slate-700" />
                          
                          <button
                            onClick={() => {
                              setShowProfileMenu(false);
                              signOut();
                            }}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                          >
                            <LogOut size={18} />
                            <span>{t('nav.logout')}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Theme Toggle */}
                  <IconButton
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    icon={resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    tooltip={resolvedTheme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
                    color="gray"
                  />
                  
                  {/* Language Selector */}
                  <div className="hidden sm:block">
                    <LanguageSelector variant="compact" />
                  </div>
                </>
              ) : (
                // Guest Actions - Diseño premium y llamativo
                <div className="flex items-center gap-3">
                  <IconButton
                    onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                    icon={resolvedTheme === 'dark' ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
                    tooltip={resolvedTheme === 'dark' ? t('settings.themeLight') : t('settings.themeDark')}
                    color="gray"
                  />
                  
                  <div className="hidden sm:block">
                    <LanguageSelector variant="compact" />
                  </div>
                  
                  <button 
                    onClick={() => router.push('/login')} 
                    className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-semibold text-sm rounded-2xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-300 border border-transparent hover:border-gray-200 dark:hover:border-slate-700"
                  >
                    {t('nav.login')}
                  </button>
                  <button 
                    onClick={() => router.push('/register')} 
                    className="group relative overflow-hidden px-5 py-2.5 bg-gradient-to-r from-violet-600 via-violet-500 to-blue-600 hover:from-violet-500 hover:via-violet-400 hover:to-blue-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">{t('nav.register')}</span>
                  </button>
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[67px] bg-white dark:bg-gray-950 z-40 overflow-auto">
          <div className="p-4 space-y-6">
            {/* Navigation */}
            <div className="space-y-1">
              <MobileNavLink href="/" icon={<Home size={20} />} label={t('nav.home')} onClick={() => setMobileMenuOpen(false)} active={pathname === '/'} router={router} />
              <MobileNavLink href="/explore" icon={<Grid3X3 size={20} />} label={t('action.explore')} onClick={() => setMobileMenuOpen(false)} active={pathname === '/explore'} router={router} />
              <MobileNavLink href="/vip" icon={<Crown size={20} />} label="VIP" onClick={() => setMobileMenuOpen(false)} active={pathname === '/vip'} router={router} />
            </div>

            {user && (
              <>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-4 space-y-1">
                  <MobileNavLink href="/messages" icon={<Mail size={20} />} label={t('nav.messages')} badge={mensajesNoLeidos} onClick={() => setMobileMenuOpen(false)} router={router} />
                  <MobileNavLink href="/notificaciones" icon={<Bell size={20} />} label={t('nav.notifications')} badge={notifNoLeidos} onClick={() => setMobileMenuOpen(false)} router={router} />
                  <MobileNavLink href="/profile?panel=favoritos" icon={<Heart size={20} />} label={t('nav.favorites')} onClick={() => setMobileMenuOpen(false)} router={router} />
                </div>

                {isUserAdmin && (
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
                    <MobileNavLink href="/admin" icon={<Shield size={20} />} label="Panel Admin" onClick={() => setMobileMenuOpen(false)} router={router} />
                  </div>
                )}

                <button
                  onClick={() => {
                    router.push('/publish');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold rounded-2xl shadow-lg shadow-violet-500/25"
                >
                  <Plus className="w-5 h-5" />
                  {t('nav.publish')}
                  <Sparkles className="w-4 h-4 opacity-70" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

// Component: Navigation Link - Diseño ultra moderno con pill effect
function NavLink({ href, icon, label, active, premium, router }: { href: string; icon: React.ReactNode; label: string; active?: boolean; premium?: boolean; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => router.push(href)}
      className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 ${
        active 
          ? 'bg-white dark:bg-slate-800 text-gray-900 dark:text-white shadow-lg shadow-gray-200/50 dark:shadow-black/50' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50'
      } ${premium ? 'text-amber-600 dark:text-amber-400' : ''}`}
    >
      {active && <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-xl" />}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10">{label}</span>
      {premium && <Crown size={14} className="text-amber-500 relative z-10" />}
    </button>
  );
}

// Component: Icon Button - Diseño premium con efectos
function IconButton({ onClick, icon, badge, tooltip, color }: { onClick: () => void; icon: React.ReactNode; badge?: number; tooltip?: string; color: 'blue' | 'amber' | 'gray' }) {
  const colorClasses = {
    blue: 'hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:shadow-lg hover:shadow-blue-500/20',
    amber: 'hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:shadow-lg hover:shadow-amber-500/20',
    gray: 'hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-gray-400/20',
  };

  const badgeColors = {
    blue: 'from-blue-500 via-blue-600 to-cyan-600 shadow-blue-500/40',
    amber: 'from-amber-500 via-orange-500 to-orange-600 shadow-amber-500/40',
    gray: 'from-gray-500 via-gray-600 to-gray-700 shadow-gray-500/40',
  };

  return (
    <button
      onClick={onClick}
      className={`relative p-2.5 text-gray-500 dark:text-gray-400 rounded-xl transition-all duration-300 ${colorClasses[color]}`}
      title={tooltip}
    >
      {icon}
      {badge && badge > 0 ? (
        <span className={`absolute -top-1 -right-1 min-w-5 h-5 bg-gradient-to-r ${badgeColors[color]} text-white text-[11px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg animate-pulse`}>
          {badge > 9 ? '9+' : badge}
        </span>
      ) : null}
    </button>
  );
}

// Component: Menu Link - Ultra elegante
function MenuLink({ href, icon, label, onClick, admin, router }: { href: string; icon: React.ReactNode; label: string; onClick: () => void; admin?: boolean; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => {
        onClick();
        router.push(href);
      }}
      className={`group w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
        admin 
          ? 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow-lg hover:shadow-emerald-500/10' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:shadow-lg hover:shadow-gray-400/10'
      }`}
    >
      <span className="transition-transform group-hover:scale-110 duration-300">{icon}</span>
      <span>{label}</span>
    </button>
  );
}

// Component: Mobile Nav Link - Moderno y elegante
function MobileNavLink({ href, icon, label, badge, onClick, active, router }: { href: string; icon: React.ReactNode; label: string; badge?: number; onClick: () => void; active?: boolean; router: ReturnType<typeof useRouter> }) {
  return (
    <button
      onClick={() => {
        onClick();
        router.push(href);
      }}
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
        active 
          ? 'bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 text-violet-600 dark:text-violet-400 shadow-lg shadow-violet-500/10' 
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge && badge > 0 && (
        <span className="min-w-6 h-6 bg-gradient-to-r from-violet-500 via-violet-600 to-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center px-2 shadow-lg shadow-violet-500/30">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}
