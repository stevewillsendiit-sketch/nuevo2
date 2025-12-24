import ClientDetail from './ClientDetail';
import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Generar metadata dinámica para SEO de cada anuncio
export async function generateMetadata({ params }: { params: { id: string } | Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const baseUrl = 'https://vindel10.com';
  
  try {
    const docRef = doc(db, 'anuncios', resolvedParams.id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return {
        title: 'Anunț negăsit',
        description: 'Acest anunț nu mai este disponibil.',
      };
    }
    
    const anuncio = docSnap.data();
    const titulo = anuncio.titulo || 'Anunț';
    const descripcion = anuncio.descripcion?.substring(0, 160) || 'Descoperă acest anunț pe Vindel10';
    const precio = anuncio.precio ? `${anuncio.precio} ${anuncio.moneda || 'Lei'}` : 'Preț negociabil';
    const ubicacion = anuncio.ubicacion || anuncio.provincia || 'România';
    const categoria = anuncio.categoria || 'General';
    const imagen = anuncio.imagenes?.[0] || '/og-image.jpg';
    
    return {
      title: `${titulo} - ${precio} | ${ubicacion}`,
      description: `${descripcion} - ${precio} în ${ubicacion}. Categoria: ${categoria}. Cumpără acum pe Vindel10!`,
      keywords: [
        titulo,
        categoria,
        ubicacion,
        'anunț',
        'vânzare',
        'cumpărare',
        'vindel10',
        anuncio.subcategoria || '',
      ].filter(Boolean),
      openGraph: {
        type: 'website',
        locale: 'ro_RO',
        url: `${baseUrl}/ad/${resolvedParams.id}`,
        siteName: 'Vindel10',
        title: `${titulo} - ${precio}`,
        description: descripcion,
        images: [
          {
            url: imagen,
            width: 800,
            height: 600,
            alt: titulo,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${titulo} - ${precio}`,
        description: descripcion,
        images: [imagen],
      },
      alternates: {
        canonical: `${baseUrl}/ad/${resolvedParams.id}`,
      },
      other: {
        'product:price:amount': anuncio.precio?.toString() || '',
        'product:price:currency': anuncio.moneda || 'RON',
        'product:availability': anuncio.estado === 'Activo' ? 'in stock' : 'out of stock',
        'product:condition': anuncio.condicion || 'used',
        'og:price:amount': anuncio.precio?.toString() || '',
        'og:price:currency': anuncio.moneda || 'RON',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Anunț | Vindel10',
      description: 'Descoperă anunțuri pe Vindel10',
    };
  }
}

// SSR compatible for Vercel
export default async function Page({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
	const resolvedParams = await params;
	return <ClientDetail id={resolvedParams.id} />;
}
