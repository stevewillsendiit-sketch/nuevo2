'use client';

import Image, { ImageProps } from 'next/image';
import { useState, useCallback } from 'react';

interface OptimizedImageProps extends Omit<ImageProps, 'onError'> {
  fallback?: string;
}

/**
 * Componente de imagen optimizada con:
 * - Lazy loading automático
 * - Placeholder blur
 * - Manejo de errores con fallback
 * - Formato WebP/AVIF automático
 */
export default function OptimizedImage({
  src,
  alt,
  fallback = '/placeholder.jpg',
  className = '',
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = useCallback(() => {
    setImgSrc(fallback);
  }, [fallback]);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      className={`
        ${className}
        ${isLoading ? 'animate-pulse bg-gray-200' : ''}
        transition-opacity duration-300
      `}
      loading={priority ? 'eager' : 'lazy'}
      priority={priority}
      onError={handleError}
      onLoad={handleLoad}
      quality={85}
      {...props}
    />
  );
}

/**
 * Hook para precargar imágenes críticas
 */
export function usePreloadImages() {
  const preload = useCallback((urls: string[]) => {
    urls.forEach((url) => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = url;
      document.head.appendChild(link);
    });
  }, []);

  return { preload };
}
