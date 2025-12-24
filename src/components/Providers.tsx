'use client';

import { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DesignProvider } from '@/contexts/DesignContext';
import { FavoritosProvider } from '@/contexts/FavoritosContext';
import ClientCategoryProvider from '@/components/ClientCategoryProvider';

// Importar componentes dinámicamente sin SSR
const Header = dynamic(() => import('@/components/Header'), { ssr: false });
const GlobalCategoryBar = dynamic(() => import('@/components/GlobalCategoryBar'), { ssr: false });
const Footer = dynamic(() => import('@/components/Footer'), { ssr: false });
const AnalyticsTracker = dynamic(() => import('@/components/AnalyticsTracker'), { ssr: false });
const MessageNotification = dynamic(() => import('@/components/MessageNotification'), { ssr: false });

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // En el servidor, renderizar estructura mínima sin providers que acceden a browser APIs
  if (!mounted) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  // En el cliente, renderizar todo con los providers
  return (
    <ThemeProvider>
      <DesignProvider>
        <LanguageProvider>
          <AuthProvider>
            <FavoritosProvider>
              <ClientCategoryProvider>
                <div className="min-h-screen flex flex-col">
                  <AnalyticsTracker />
                  <MessageNotification />
                  <Header />
                  <GlobalCategoryBar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
              </ClientCategoryProvider>
            </FavoritosProvider>
          </AuthProvider>
        </LanguageProvider>
      </DesignProvider>
    </ThemeProvider>
  );
}
