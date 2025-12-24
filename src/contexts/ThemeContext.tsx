"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  // Marcar como montado ANTES de leer localStorage para evitar hidratación
  useEffect(() => {
    // Leer tema guardado - por defecto light si no hay preferencia
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('theme') as Theme | null : null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
    setMounted(true);
  }, []);

  // Resolver tema del sistema
  useEffect(() => {
    if (typeof window === 'undefined' || !mounted) return;
    
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const updateResolvedTheme = () => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light');
      } else {
        setResolvedTheme(theme);
      }
    };

    updateResolvedTheme();
    
    // Escuchar cambios en preferencia del sistema
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme, mounted]);

  // Aplicar tema al documento SOLO después de montaje completo
  // El script inline en layout.tsx ya aplicó el tema inicial
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Solo actualizar si el tema cambió después del montaje inicial
    if (resolvedTheme === 'dark') {
      if (!root.classList.contains('dark')) {
        root.classList.add('dark');
      }
      root.style.setProperty('--background', '#1a1d23');
      root.style.setProperty('--foreground', '#f1f5f9');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('--background', '#ffffff');
      root.style.setProperty('--foreground', '#171717');
    }
  }, [resolvedTheme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
