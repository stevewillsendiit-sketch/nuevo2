import { MetadataRoute } from 'next';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://vindel10.com';
  
  // Páginas estáticas principales
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/publish`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/como-comprar`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/como-vender`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/ayuda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contacto`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terminos`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${baseUrl}/vip`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ];

  // Categorías
  const categorias = [
    'imobiliare',
    'auto-moto',
    'locuri-de-munca',
    'electronice',
    'moda-accesorii',
    'casa-gradina',
    'timp-liber-sport',
    'animale',
    'mama-copil',
    'servicii',
    'cazare-turism',
    'matrimoniale',
    'videojocuri',
  ];

  const categoryPages: MetadataRoute.Sitemap = categorias.map((cat) => ({
    url: `${baseUrl}/search?categoria=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  // Obtener anuncios activos de Firestore
  let anuncioPages: MetadataRoute.Sitemap = [];
  
  try {
    const anunciosRef = collection(db, 'anuncios');
    const q = query(
      anunciosRef,
      where('estado', '==', 'Activo'),
      orderBy('fechaPublicacion', 'desc'),
      limit(1000) // Limitar a los 1000 más recientes
    );
    
    const snapshot = await getDocs(q);
    
    anuncioPages = snapshot.docs.map((doc) => {
      const data = doc.data();
      const fechaPublicacion = data.fechaPublicacion?.toDate?.() || new Date();
      
      return {
        url: `${baseUrl}/ad/${doc.id}`,
        lastModified: fechaPublicacion,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      };
    });
  } catch (error) {
    console.error('Error fetching anuncios for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...anuncioPages];
}
