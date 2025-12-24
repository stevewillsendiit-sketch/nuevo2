/**
 * Utilidad para optimizar imágenes antes de subirlas
 * Convierte a WebP y comprime para mejor rendimiento
 */

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'jpeg';
}

const defaultOptions: OptimizeOptions = {
  maxWidth: 1920,
  maxHeight: 1080,
  quality: 0.85,
  format: 'webp'
};

/**
 * Comprime y convierte una imagen a WebP
 */
export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<File> {
  const opts = { ...defaultOptions, ...options };
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > opts.maxWidth! || height > opts.maxHeight!) {
        const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      canvas.width = width;
      canvas.height = height;
      
      if (!ctx) {
        reject(new Error('No se pudo crear el contexto del canvas'));
        return;
      }
      
      // Dibujar imagen redimensionada
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convertir a WebP o JPEG
      const mimeType = opts.format === 'webp' ? 'image/webp' : 'image/jpeg';
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Error al comprimir la imagen'));
            return;
          }
          
          // Crear nuevo archivo con extensión correcta
          const extension = opts.format === 'webp' ? '.webp' : '.jpg';
          const newFileName = file.name.replace(/\.[^/.]+$/, '') + extension;
          const optimizedFile = new File([blob], newFileName, { type: mimeType });
          
          console.log(`📸 Imagen optimizada: ${file.name} (${formatBytes(file.size)}) → ${newFileName} (${formatBytes(optimizedFile.size)})`);
          
          resolve(optimizedFile);
        },
        mimeType,
        opts.quality
      );
    };
    
    img.onerror = () => {
      reject(new Error('Error al cargar la imagen'));
    };
    
    // Leer archivo como Data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Optimiza múltiples imágenes en paralelo
 */
export async function optimizeImages(
  files: File[],
  options: OptimizeOptions = {}
): Promise<File[]> {
  const optimizedFiles = await Promise.all(
    files.map(file => optimizeImage(file, options))
  );
  
  const originalSize = files.reduce((acc, f) => acc + f.size, 0);
  const optimizedSize = optimizedFiles.reduce((acc, f) => acc + f.size, 0);
  const savings = ((1 - optimizedSize / originalSize) * 100).toFixed(1);
  
  console.log(`🚀 Total optimizado: ${formatBytes(originalSize)} → ${formatBytes(optimizedSize)} (${savings}% ahorro)`);
  
  return optimizedFiles;
}

/**
 * Genera un thumbnail de la imagen
 */
export async function generateThumbnail(
  file: File,
  size: number = 200
): Promise<File> {
  return optimizeImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'webp'
  });
}

/**
 * Formatea bytes a una cadena legible
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Verifica si el navegador soporta WebP
 */
export function supportsWebP(): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.width === 1);
    img.onerror = () => resolve(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  });
}

/**
 * Precarga una imagen
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Precarga múltiples imágenes
 */
export async function preloadImages(srcs: string[]): Promise<void> {
  await Promise.all(srcs.map(preloadImage));
}
