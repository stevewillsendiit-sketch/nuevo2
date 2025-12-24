"use client";

import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X, Gift, Coins, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'points' | 'gift';

interface ToastProps {
  message: string;
  description?: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  isVisible: boolean;
}

const toastStyles = {
  success: {
    bg: 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600',
    icon: CheckCircle,
    iconBg: 'bg-white/25',
    border: 'border-emerald-300/40',
    glow: 'shadow-emerald-500/30',
  },
  error: {
    bg: 'bg-gradient-to-br from-red-500 via-rose-500 to-pink-600',
    icon: XCircle,
    iconBg: 'bg-white/25',
    border: 'border-red-300/40',
    glow: 'shadow-red-500/30',
  },
  warning: {
    bg: 'bg-gradient-to-br from-amber-500 via-orange-500 to-yellow-500',
    icon: AlertCircle,
    iconBg: 'bg-white/25',
    border: 'border-amber-300/40',
    glow: 'shadow-amber-500/30',
  },
  info: {
    bg: 'bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600',
    icon: Info,
    iconBg: 'bg-white/25',
    border: 'border-blue-300/40',
    glow: 'shadow-blue-500/30',
  },
  points: {
    bg: 'bg-gradient-to-br from-amber-400 via-orange-500 to-yellow-500',
    icon: Coins,
    iconBg: 'bg-white/25',
    border: 'border-yellow-300/40',
    glow: 'shadow-yellow-500/40',
  },
  gift: {
    bg: 'bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500',
    icon: Gift,
    iconBg: 'bg-white/25',
    border: 'border-purple-300/40',
    glow: 'shadow-purple-500/30',
  },
};

export function Toast({ message, description, type = 'info', duration = 4000, onClose, isVisible }: ToastProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isEntering, setIsEntering] = useState(true);
  const style = toastStyles[type];
  const Icon = style.icon;

  useEffect(() => {
    if (isVisible) {
      // Animación de entrada
      const enterTimer = setTimeout(() => setIsEntering(false), 50);
      
      // Auto-cerrar
      if (duration > 0) {
        const closeTimer = setTimeout(() => {
          setIsLeaving(true);
          setTimeout(onClose, 400);
        }, duration);
        return () => {
          clearTimeout(enterTimer);
          clearTimeout(closeTimer);
        };
      }
      return () => clearTimeout(enterTimer);
    }
  }, [isVisible, duration, onClose]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onClose, 400);
  };

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-6 right-6 z-[9999] max-w-sm w-full transform transition-all duration-500 ease-out
        ${isEntering ? 'translate-x-full opacity-0 scale-95' : ''}
        ${isLeaving ? 'translate-x-full opacity-0 scale-90' : 'translate-x-0 opacity-100 scale-100'}
      `}
    >
      <div className={`${style.bg} rounded-2xl shadow-2xl ${style.glow} shadow-xl border ${style.border} backdrop-blur-xl overflow-hidden`}>
        {/* Efecto de brillo animado */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine" />
        </div>
        
        {/* Partículas decorativas para points y gift */}
        {(type === 'points' || type === 'gift') && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <Sparkles className="absolute top-2 right-8 w-4 h-4 text-white/40 animate-pulse" />
            <Sparkles className="absolute bottom-3 left-12 w-3 h-3 text-white/30 animate-pulse delay-150" />
          </div>
        )}
        
        <div className="relative p-4 flex items-start gap-4">
          {/* Icono con animación */}
          <div className={`${style.iconBg} p-3 rounded-xl flex-shrink-0 backdrop-blur-sm transform transition-transform hover:scale-110`}>
            <Icon className="w-6 h-6 text-white drop-shadow-lg" />
          </div>
          
          {/* Contenido */}
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-white font-bold text-base leading-tight drop-shadow-sm">
              {message}
            </p>
            {description && (
              <p className="text-white/90 text-sm mt-1.5 leading-relaxed font-medium">
                {description}
              </p>
            )}
          </div>
          
          {/* Botón cerrar mejorado */}
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-2 rounded-xl hover:bg-white/20 active:bg-white/30 transition-all transform hover:scale-110 active:scale-95"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        
        {/* Barra de progreso mejorada */}
        {duration > 0 && (
          <div className="h-1.5 bg-black/20 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-white/60 via-white/80 to-white/60 rounded-full"
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50%, 100% { transform: translateX(200%); }
        }
        .animate-shine {
          animation: shine 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

// Hook para usar el sistema de toasts
interface ToastState {
  isVisible: boolean;
  message: string;
  description?: string;
  type: ToastType;
  duration: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastState>({
    isVisible: false,
    message: '',
    description: undefined,
    type: 'info',
    duration: 4000,
  });

  const showToast = (
    message: string, 
    type: ToastType = 'info', 
    description?: string, 
    duration: number = 4000
  ) => {
    setToast({
      isVisible: true,
      message,
      description,
      type,
      duration,
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const success = (message: string, description?: string) => showToast(message, 'success', description);
  const error = (message: string, description?: string) => showToast(message, 'error', description);
  const warning = (message: string, description?: string) => showToast(message, 'warning', description);
  const info = (message: string, description?: string) => showToast(message, 'info', description);
  const points = (message: string, description?: string) => showToast(message, 'points', description, 5000);
  const gift = (message: string, description?: string) => showToast(message, 'gift', description, 5000);

  return {
    toast,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
    points,
    gift,
  };
}

// Componente contenedor para el Toast
export function ToastContainer({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  return (
    <Toast
      isVisible={toast.isVisible}
      message={toast.message}
      description={toast.description}
      type={toast.type}
      duration={toast.duration}
      onClose={onClose}
    />
  );
}
