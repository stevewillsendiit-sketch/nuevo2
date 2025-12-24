'use client';

import { Facebook, Twitter, Instagram, Linkedin, Youtube, Shield } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const { t } = useLanguage();
  const pathname = usePathname();
  
  // No mostrar footer en páginas de admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }
  
  return (
    <footer className="bg-gray-900 text-white mt-12">
      {/* Main Footer Content - Compacto */}
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {/* Brand Section */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block">
              <h2 className="text-xl font-bold text-white mb-2">
                {t('footer.brand')}
              </h2>
            </Link>
            <p className="text-gray-400 text-sm mb-4 max-w-xs">
              {t('footer.brandDescription')}
            </p>
            
            {/* Social Links */}
            <div className="flex gap-2">
              {[
                { icon: Facebook, href: '#', label: 'Facebook' },
                { icon: Twitter, href: '#', label: 'Twitter' },
                { icon: Instagram, href: '#', label: 'Instagram' },
                { icon: Linkedin, href: '#', label: 'LinkedIn' },
                { icon: Youtube, href: '#', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white uppercase tracking-wider">{t('footer.categories')}</h3>
            <ul className="space-y-2">
              {[
                { key: 'category.motor', label: t('category.motor'), href: '/?categoria=Motor' },
                { key: 'category.realEstate', label: t('category.realEstate'), href: '/?categoria=Inmobiliaria' },
                { key: 'category.electronics', label: t('category.electronics'), href: '/?categoria=Electrónica' },
                { key: 'category.fashion', label: t('category.fashion'), href: '/?categoria=Moda' },
                { key: 'category.home', label: t('category.home'), href: '/?categoria=Hogar' },
              ].map((item) => (
                <li key={item.key}>
                  <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white uppercase tracking-wider">{t('nav.help')}</h3>
            <ul className="space-y-2">
              {[
                { name: t('footer.help'), href: '/ayuda' },
                { name: t('footer.howToSell'), href: '/como-vender' },
                { name: t('footer.howToBuy'), href: '/como-comprar' },
                { name: t('footer.security'), href: '/seguridad' },
                { name: t('footer.contact'), href: '/contacto' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold mb-3 text-white uppercase tracking-wider">{t('footer.legal')}</h3>
            <ul className="space-y-2">
              {[
                { name: t('footer.termsOfUse'), href: '/terminos' },
                { name: t('footer.privacy'), href: '/privacidad' },
                { name: t('footer.cookies'), href: '/cookies' },
                { name: t('footer.legalNotice'), href: '/aviso-legal' },
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-gray-400 hover:text-white text-sm transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Descargar App */}
          <div className="col-span-2 md:col-span-1">
            <h3 className="text-sm font-semibold mb-2 text-white uppercase tracking-wider">{t('footer.downloadApp')}</h3>
            <p className="text-gray-400 text-xs mb-3">{t('footer.downloadSubtitle')}</p>
            <div className="flex gap-2">
              <a href="#" className="flex items-center gap-2 bg-black hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors border border-gray-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <span className="text-xs font-medium">iOS</span>
              </a>
              <a href="#" className="flex items-center gap-2 bg-black hover:bg-gray-800 px-3 py-2 rounded-lg transition-colors border border-gray-700">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <span className="text-xs font-medium">Android</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Compacto */}
      <div className="border-t border-gray-800">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-500 text-xs">
              © 2025 Nuevo. {t('footer.rights')}.
            </p>
            <div className="flex items-center gap-3">
              {/* Métodos de pago */}
              <div className="flex items-center gap-1.5">
                <div className="bg-white px-2 py-1 rounded text-[10px] font-bold text-[#1A1F71] italic">VISA</div>
                <div className="bg-white px-1.5 py-1 rounded flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full -ml-1.5"></div>
                </div>
                <div className="bg-white px-2 py-1 rounded">
                  <span className="text-[#003087] font-bold text-[10px]">Pay</span>
                  <span className="text-[#009CDE] font-bold text-[10px]">Pal</span>
                </div>
              </div>
              <div className="flex items-center gap-1 text-gray-500 text-xs">
                <Shield className="w-3 h-3 text-green-500" />
                <span>{t('footer.secure')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
