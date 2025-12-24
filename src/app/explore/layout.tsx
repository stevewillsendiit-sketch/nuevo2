import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Explorează Anunțuri | Vindel10 - Cel mai mare site de anunțuri din România',
  description: 'Descoperă mii de anunțuri gratuite în România. Imobiliare, auto, electronice, locuri de muncă și multe altele. Găsește cele mai bune oferte pe Vindel10.',
  keywords: [
    'anunțuri gratuite',
    'anunțuri România',
    'vânzări online',
    'cumpărături online',
    'imobiliare',
    'auto moto',
    'electronice',
    'locuri de muncă',
    'servicii',
    'vindel10',
    'olx alternativă',
    'marketplace România'
  ],
  authors: [{ name: 'Vindel10' }],
  creator: 'Vindel10',
  publisher: 'Vindel10',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ro_RO',
    url: 'https://vindel10.com/explore',
    siteName: 'Vindel10',
    title: 'Explorează Anunțuri | Vindel10',
    description: 'Descoperă mii de anunțuri gratuite în România. Imobiliare, auto, electronice, locuri de muncă și multe altele.',
    images: [
      {
        url: '/og-explore.jpg',
        width: 1200,
        height: 630,
        alt: 'Vindel10 - Explorează anunțuri',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Explorează Anunțuri | Vindel10',
    description: 'Descoperă mii de anunțuri gratuite în România. Cele mai bune oferte te așteaptă!',
    images: ['/og-explore.jpg'],
    creator: '@vindel10',
  },
  alternates: {
    canonical: 'https://vindel10.com/explore',
    languages: {
      'ro-RO': 'https://vindel10.com/explore',
      'es-ES': 'https://vindel10.com/es/explore',
    },
  },
  category: 'marketplace',
  classification: 'Classified Ads',
};

// Schema.org JSON-LD para SEO estructurado
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Explorează Anunțuri pe Vindel10',
  description: 'Descoperă mii de anunțuri gratuite în România',
  url: 'https://vindel10.com/explore',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Vindel10',
    url: 'https://vindel10.com',
  },
  provider: {
    '@type': 'Organization',
    name: 'Vindel10',
    url: 'https://vindel10.com',
    logo: {
      '@type': 'ImageObject',
      url: 'https://vindel10.com/logo.png',
    },
  },
  mainEntity: {
    '@type': 'ItemList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Imobiliare',
        url: 'https://vindel10.com/explore?categoria=imobiliare',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Auto & Moto',
        url: 'https://vindel10.com/explore?categoria=auto-moto',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Electronice',
        url: 'https://vindel10.com/explore?categoria=electronice',
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: 'Locuri de muncă',
        url: 'https://vindel10.com/explore?categoria=locuri-de-munca',
      },
    ],
  },
};

export default function ExploreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
