'use client';

import { ReactNode, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { DesignProvider } from '@/contexts/DesignContext';
import { FavoritosProvider } from '@/contexts/FavoritosContext';
import ClientCategoryProvider from '@/components/ClientCategoryProvider';

// Importar componentes dinámicamente sin SSR para evitar hidratación
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

  // Contenido base que se renderiza tanto en servidor como en cliente
  const content = (
    <ThemeProvider>
      <DesignProvider>
        <LanguageProvider>
          <AuthProvider>
            <FavoritosProvider>
              <ClientCategoryProvider>
                <div className="min-h-screen flex flex-col" suppressHydrationWarning>
                  {mounted && <AnalyticsTracker />}
                  {mounted && <MessageNotification />}
                  {mounted && <Header />}
                  {mounted && <GlobalCategoryBar />}
                  <main className="flex-1" suppressHydrationWarning>{children}</main>
                  {mounted && <Footer />}
                </div>
              </ClientCategoryProvider>
            </FavoritosProvider>
          </AuthProvider>
        </LanguageProvider>
      </DesignProvider>
    </ThemeProvider>
  );

  return content;
}
