"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type DesignStyle = 'default' | 'minimalista-noir' | 'clasico-profesional' | 'elegante-azul';
export type CardVariant = 'default' | 'elegante' | 'minimal' | 'soft' | 'nordic';

interface DesignContextType {
  design: DesignStyle;
  setDesign: (design: DesignStyle) => void;
  cardVariant: CardVariant;
  setCardVariant: (variant: CardVariant) => void;
}

const DesignContext = createContext<DesignContextType | undefined>(undefined);

export const designStyles: { 
  id: DesignStyle; 
  name: string; 
  description: string; 
  colors: string[];
  preview: string;
}[] = [
  { 
    id: 'default', 
    name: 'Clásico', 
    description: 'El diseño original de VINDEL',
    colors: ['#3b82f6', '#f59e0b', '#10b981'],
    preview: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)'
  },
  { 
    id: 'minimalista-noir', 
    name: 'Minimalista Noir', 
    description: 'Diseño sofisticado en blanco, gris y negro',
    colors: ['#18181b', '#3f3f46', '#71717a'],
    preview: 'linear-gradient(135deg, #18181b 0%, #3f3f46 50%, #71717a 100%)'
  },
  { 
    id: 'clasico-profesional', 
    name: 'Clásico Profesional', 
    description: 'Elegancia atemporal con acabados premium dorados',
    colors: ['#78350f', '#d97706', '#fbbf24'],
    preview: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)'
  }
];

export const cardVariants: {
  id: CardVariant;
  name: string;
  description: string;
  forDesign: DesignStyle[];
}[] = [
  { id: 'default', name: 'Estándar', description: 'Tarjeta clásica con borde', forDesign: ['minimalista-noir', 'clasico-profesional'] },
  { id: 'elegante', name: 'Elegante', description: 'Sofisticado con sombras suaves', forDesign: ['clasico-profesional'] },
  { id: 'minimal', name: 'Minimal', description: 'Minimalista contemporáneo y limpio', forDesign: ['clasico-profesional'] },
  { id: 'soft', name: 'Soft', description: 'Suave con colores pastel', forDesign: ['clasico-profesional'] },
  { id: 'nordic', name: 'Nordic', description: 'Estilo nórdico limpio y sereno', forDesign: ['clasico-profesional'] },
];

export function DesignProvider({ children }: { children: ReactNode }) {
  // Por defecto: Clásico Profesional con variante Minimal
  const [design, setDesignState] = useState<DesignStyle>('clasico-profesional');
  const [cardVariant, setCardVariantState] = useState<CardVariant>('minimal');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedDesign = localStorage.getItem('designStyle') as DesignStyle | null;
      if (savedDesign && ['default', 'minimalista-noir', 'clasico-profesional'].includes(savedDesign)) {
        setDesignState(savedDesign);
      }
      const savedVariant = localStorage.getItem('cardVariant') as CardVariant | null;
      if (savedVariant) {
        setCardVariantState(savedVariant);
      }
    }
  }, []);

  const setCardVariant = (variant: CardVariant) => {
    setCardVariantState(variant);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardVariant', variant);
    }
  };

  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const root = document.documentElement;
    
    // Remove all design classes
    root.classList.remove('design-default', 'design-elegante-azul', 'design-minimalista-noir', 'design-clasico-profesional');
    
    // Add current design class
    root.classList.add(`design-${design}`);
    
    // Set CSS variables based on design
    if (design === 'elegante-azul') {
      root.style.setProperty('--design-primary', '#1e40af');
      root.style.setProperty('--design-primary-light', '#3b82f6');
      root.style.setProperty('--design-accent', '#0ea5e9');
      root.style.setProperty('--design-card-bg', '#f8fafc');
      root.style.setProperty('--design-card-border', '#e2e8f0');
      root.style.setProperty('--design-card-shadow', '0 4px 20px rgba(30, 64, 175, 0.08)');
      root.style.setProperty('--design-radius', '1rem');
      root.style.setProperty('--design-badge-vip', 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)');
      root.style.setProperty('--design-badge-premium', 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)');
      root.style.setProperty('--design-badge-destacado', 'linear-gradient(135deg, #64748b 0%, #94a3b8 100%)');
    } else if (design === 'minimalista-noir') {
      root.style.setProperty('--design-primary', '#18181b');
      root.style.setProperty('--design-primary-light', '#3f3f46');
      root.style.setProperty('--design-accent', '#a1a1aa');
      root.style.setProperty('--design-card-bg', '#fafafa');
      root.style.setProperty('--design-card-border', '#e4e4e7');
      root.style.setProperty('--design-card-shadow', '0 1px 3px rgba(0, 0, 0, 0.08)');
      root.style.setProperty('--design-radius', '0.5rem');
      root.style.setProperty('--design-badge-vip', 'linear-gradient(135deg, #18181b 0%, #3f3f46 100%)');
      root.style.setProperty('--design-badge-premium', 'linear-gradient(135deg, #52525b 0%, #71717a 100%)');
      root.style.setProperty('--design-badge-destacado', 'linear-gradient(135deg, #a1a1aa 0%, #d4d4d8 100%)');
    } else if (design === 'clasico-profesional') {
      root.style.setProperty('--design-primary', '#78350f');
      root.style.setProperty('--design-primary-light', '#d97706');
      root.style.setProperty('--design-accent', '#fbbf24');
      root.style.setProperty('--design-card-bg', '#fffbeb');
      root.style.setProperty('--design-card-border', '#fde68a');
      root.style.setProperty('--design-card-shadow', '0 4px 25px rgba(217, 119, 6, 0.15)');
      root.style.setProperty('--design-radius', '0.75rem');
      root.style.setProperty('--design-badge-vip', 'linear-gradient(135deg, #78350f 0%, #d97706 100%)');
      root.style.setProperty('--design-badge-premium', 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)');
      root.style.setProperty('--design-badge-destacado', 'linear-gradient(135deg, #fbbf24 0%, #fef3c7 100%)');
    } else {
      // Default design
      root.style.setProperty('--design-primary', '#3b82f6');
      root.style.setProperty('--design-primary-light', '#60a5fa');
      root.style.setProperty('--design-accent', '#f59e0b');
      root.style.setProperty('--design-card-bg', '#ffffff');
      root.style.setProperty('--design-card-border', '#e5e7eb');
      root.style.setProperty('--design-card-shadow', '0 4px 12px rgba(0, 0, 0, 0.05)');
      root.style.setProperty('--design-radius', '1rem');
      root.style.setProperty('--design-badge-vip', 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)');
      root.style.setProperty('--design-badge-premium', 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)');
      root.style.setProperty('--design-badge-destacado', 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)');
    }
  }, [design, mounted]);

  const setDesign = (newDesign: DesignStyle) => {
    setDesignState(newDesign);
    if (typeof window !== 'undefined') {
      localStorage.setItem('designStyle', newDesign);
    }
    // Reset card variant when changing design
    setCardVariantState('default');
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardVariant', 'default');
    }
  };

  if (!mounted) {
    return (
      <DesignContext.Provider value={{ design: 'default', setDesign: () => {}, cardVariant: 'default', setCardVariant: () => {} }}>
        {children}
      </DesignContext.Provider>
    );
  }

  return (
    <DesignContext.Provider value={{ design, setDesign, cardVariant, setCardVariant }}>
      {children}
    </DesignContext.Provider>
  );
}

export function useDesign() {
  const context = useContext(DesignContext);
  if (context === undefined) {
    throw new Error('useDesign must be used within a DesignProvider');
  }
  return context;
}
