import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#3b82f6',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://vindel10.com'),
  title: {
    default: 'Vindel10 - Anunțuri Gratuite în România | Cumpără și Vinde Online',
    template: '%s | Vindel10',
  },
  description: 'Cel mai mare site de anunțuri gratuite din România. Publică și găsește anunțuri: imobiliare, auto, electronice, locuri de muncă, servicii și multe altele. Înregistrare gratuită!',
  keywords: [
    'anunțuri gratuite',
    'anunțuri România',
    'vânzări online',
    'cumpărături online',
    'second hand',
    'marketplace România',
    'imobiliare România',
    'mașini second hand',
    'electronice ieftine',
    'locuri de muncă România',
    'servicii profesionale',
    'vindel10',
    'olx alternativă',
    'publicitate gratuită',
    'anunțuri online',
  ],
  authors: [{ name: 'Vindel10', url: 'https://vindel10.com' }],
  creator: 'Vindel10',
  publisher: 'Vindel10',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://vindel10.com',
    siteName: 'Vindel10',
    title: 'Vindel10 - Anunțuri Gratuite în România',
    description: 'Cel mai mare site de anunțuri gratuite din România. Publică și găsește cele mai bune oferte!',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Vindel10 - Marketplace România',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vindel10 - Anunțuri Gratuite în România',
    description: 'Cel mai mare site de anunțuri gratuite din România. Publică și găsește cele mai bune oferte!',
    images: ['/og-image.jpg'],
    creator: '@vindel10',
    site: '@vindel10',
  },
  alternates: {
    canonical: 'https://vindel10.com',
    languages: {
      'ro-RO': 'https://vindel10.com',
      'x-default': 'https://vindel10.com',
    },
  },
  verification: {
    google: 'TU_CODIGO_DE_VERIFICACION_GOOGLE',
    yandex: 'TU_CODIGO_YANDEX',
  },
  category: 'marketplace',
  classification: 'Classified Ads, Marketplace',
  other: {
    'fb:app_id': 'TU_FB_APP_ID',
    'og:email': 'contact@vindel10.com',
    'og:phone_number': '+40 XXX XXX XXX',
    'og:country_name': 'Romania',
    'og:region': 'RO',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#3b82f6' },
    ],
  },
  manifest: '/manifest.json',
};

// Schema.org JSON-LD para SEO estructurado global
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://vindel10.com/#website',
      url: 'https://vindel10.com',
      name: 'Vindel10',
      description: 'Cel mai mare site de anunțuri gratuite din România',
      publisher: {
        '@id': 'https://vindel10.com/#organization',
      },
      potentialAction: [
        {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://vindel10.com/search?q={search_term_string}',
          },
          'query-input': 'required name=search_term_string',
        },
      ],
      inLanguage: 'ro-RO',
    },
    {
      '@type': 'Organization',
      '@id': 'https://vindel10.com/#organization',
      name: 'Vindel10',
      url: 'https://vindel10.com',
      logo: {
        '@type': 'ImageObject',
        '@id': 'https://vindel10.com/#logo',
        url: 'https://vindel10.com/logo.png',
        contentUrl: 'https://vindel10.com/logo.png',
        width: 512,
        height: 512,
        caption: 'Vindel10',
      },
      image: {
        '@id': 'https://vindel10.com/#logo',
      },
      sameAs: [
        'https://www.facebook.com/vindel10',
        'https://www.instagram.com/vindel10',
        'https://twitter.com/vindel10',
        'https://www.linkedin.com/company/vindel10',
      ],
      contactPoint: [
        {
          '@type': 'ContactPoint',
          telephone: '+40-XXX-XXX-XXX',
          contactType: 'customer service',
          areaServed: 'RO',
          availableLanguage: ['Romanian', 'English'],
        },
      ],
    },
    {
      '@type': 'BreadcrumbList',
      '@id': 'https://vindel10.com/#breadcrumb',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Acasă',
          item: 'https://vindel10.com',
        },
      ],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        {/* Schema.org JSON-LD para SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Preconnect a servicios externos para cargar más rápido */}
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="https://firebasestorage.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={poppins.className} suppressHydrationWarning>
        {/* Google AdSense - cargado después de la hidratación */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3745938390712923"
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
        <div id="app-root" suppressHydrationWarning>
          <Providers>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
