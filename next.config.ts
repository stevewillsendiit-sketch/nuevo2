import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Desactivar React Compiler temporalmente para diagnosticar hidratación
  // reactCompiler: true,
  
  // Enable static export mode
  // output: 'export',
  // trailingSlash: true,
  
  // Optimización de imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Formatos de imagen optimizados
    formats: ['image/avif', 'image/webp'],
    // Tamaños de dispositivo para responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimizar tiempo de carga
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 días
  },
  
  // Optimizaciones de compilación
  compiler: {
    // Eliminar console.log en producción
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // ============================================
  // HEADERS DE SEGURIDAD COMPLETOS
  // ============================================
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|gif|ico)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          // Prevenir DNS prefetch abuse
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          // Prevenir MIME type sniffing
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Prevenir clickjacking - no permitir iframes externos
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          // Activar protección XSS del navegador
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Controlar información del Referrer
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Forzar HTTPS
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Controlar permisos del navegador
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
          },
          // Content Security Policy - Protección contra XSS e inyección
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://*.googlesyndication.com https://adservice.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' https://fonts.gstatic.com",
              "connect-src 'self' https://*.stripe.com https://*.firebase.googleapis.com https://*.firebaseio.com https://firebasestorage.googleapis.com https://firestore.googleapis.com wss://*.firebaseio.com https://www.google-analytics.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://pagead2.googlesyndication.com https://*.googlesyndication.com",
              "frame-src 'self' https://js.stripe.com https://*.stripe.com https://*.firebaseapp.com https://googleads.g.doubleclick.net https://*.googlesyndication.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self' https://*.stripe.com https://*.paypal.com",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
};

export default nextConfig;
