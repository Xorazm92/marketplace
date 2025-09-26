// Gallery Components Import & Export
import ProductImageGallery from './ProductImageGallery';
import CartItemGallery from './CartItemGallery';
import ImageUploader from './ImageUploader';
import MobileGallery from './MobileGallery';

export { ProductImageGallery, CartItemGallery, ImageUploader, MobileGallery };

// Gallery Hook Import & Export
import { useImageGallery, imageOptimization } from '../../hooks/useImageGallery';
export { useImageGallery, imageOptimization };

// Gallery Types
export interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  is360?: boolean;
}

export interface CartImage {
  id: string;
  url: string;
  alt: string;
}

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  url?: string;
  isMain?: boolean;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  metadata?: {
    size: number;
    dimensions: { width: number; height: number };
    format: string;
  };
}

// Gallery Configuration
export const galleryConfig = {
  // Image optimization settings
  optimization: {
    quality: {
      thumbnail: 70,
      medium: 80,
      high: 90,
      original: 95
    },
    sizes: {
      thumbnail: 120,
      small: 240,
      medium: 480,
      large: 800,
      xlarge: 1200,
      xxlarge: 1600
    },
    formats: ['webp', 'jpg', 'png'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 10
  },

  // CDN settings
  cdn: {
    cloudinary: {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
    },
    aws: {
      bucket: process.env.NEXT_PUBLIC_AWS_S3_BUCKET,
      region: process.env.NEXT_PUBLIC_AWS_REGION,
      accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID
    }
  },

  // Gallery behavior
  behavior: {
    autoPlay: false,
    autoPlayInterval: 4000,
    enableZoom: true,
    enableLightbox: true,
    enable360: false,
    enablePinchZoom: true,
    enableFullscreen: true,
    preloadAdjacent: 2,
    swipeThreshold: 50,
    zoomLevels: [1, 1.5, 2, 3, 4, 5, 8]
  },

  // Mobile settings
  mobile: {
    enableSwipe: true,
    enablePinchZoom: true,
    enableFullscreen: true,
    thumbnailSize: 60,
    controlSize: 44
  }
};

// Utility functions
export const galleryUtils = {
  // Generate optimized image URL
  getOptimizedUrl: (
    url: string, 
    width?: number, 
    quality?: number,
    format?: string
  ): string => {
    const config = galleryConfig.optimization;
    const targetWidth = width || config.sizes.medium;
    const targetQuality = quality || config.quality.medium;
    const targetFormat = format || 'auto';

    // Cloudinary optimization
    if (url.includes('cloudinary.com')) {
      return url.replace(
        '/upload/', 
        `/upload/w_${targetWidth},q_${targetQuality},f_${targetFormat}/`
      );
    }
    
    // AWS S3 optimization
    if (url.includes('amazonaws.com')) {
      return `${url}?w=${targetWidth}&q=${targetQuality}&fm=${targetFormat}`;
    }
    
    // Local/custom optimization
    return `${url}?w=${targetWidth}&q=${targetQuality}`;
  },

  // Generate responsive sizes attribute
  generateSizes: (breakpoints?: number[]): string => {
    const defaultBreakpoints = [640, 768, 1024, 1280, 1536];
    const points = breakpoints || defaultBreakpoints;
    
    return points
      .map((bp, index) => {
        if (index === points.length - 1) {
          return `${bp}px`;
        }
        return `(max-width: ${bp}px) ${bp}px`;
      })
      .join(', ');
  },

  // Generate srcSet for responsive images
  generateSrcSet: (baseUrl: string, sizes?: number[]): string => {
    const defaultSizes = [400, 800, 1200, 1600];
    const targetSizes = sizes || defaultSizes;
    
    return targetSizes
      .map(size => {
        const optimizedUrl = galleryUtils.getOptimizedUrl(baseUrl, size);
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Validate image file
  validateImageFile: (file: File): { valid: boolean; error?: string } => {
    const config = galleryConfig.optimization;
    
    // Check file size
    if (file.size > config.maxFileSize) {
      return {
        valid: false,
        error: `Fayl hajmi ${galleryUtils.formatFileSize(config.maxFileSize)} dan oshmasligi kerak`
      };
    }
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Faqat JPG, PNG va WebP formatdagi rasmlar qabul qilinadi'
      };
    }
    
    return { valid: true };
  },

  // Get image dimensions
  getImageDimensions: (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({ width: img.width, height: img.height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Rasm o\'lchamlarini aniqlashda xatolik'));
      };
      
      img.src = url;
    });
  },

  // Compress image
  compressImage: (
    file: File, 
    maxWidth: number = 1200, 
    quality: number = 0.8
  ): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Rasmni siqishda xatolik'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Rasmni yuklashda xatolik'));
      img.src = URL.createObjectURL(file);
    });
  },

  // Check device capabilities
  getDeviceCapabilities: () => {
    return {
      isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isTouchDevice: 'ontouchstart' in window || navigator.maxTouchPoints > 0,
      supportsWebP: (() => {
        const canvas = document.createElement('canvas');
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      })(),
      supportsFullscreen: !!(
        document.fullscreenEnabled ||
        (document as any).webkitFullscreenEnabled ||
        (document as any).mozFullScreenEnabled ||
        (document as any).msFullscreenEnabled
      ),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio || 1
    };
  }
};

// SEO and Accessibility helpers
export const gallerySEO = {
  // Generate structured data for product images
  generateProductImageSchema: (images: GalleryImage[], productName: string) => {
    return {
      '@context': 'https://schema.org/',
      '@type': 'Product',
      name: productName,
      image: images.map(img => ({
        '@type': 'ImageObject',
        url: img.url,
        description: img.alt,
        width: img.width,
        height: img.height
      }))
    };
  },

  // Generate alt text for accessibility
  generateAltText: (productName: string, imageIndex: number, totalImages: number) => {
    if (totalImages === 1) {
      return `${productName} mahsuloti rasmi`;
    }
    return `${productName} mahsuloti - ${imageIndex + 1}-rasm ${totalImages} tadan`;
  },

  // Generate ARIA labels
  generateAriaLabel: (action: string, context: string) => {
    const labels = {
      next: `Keyingi ${context} rasmi`,
      previous: `Oldingi ${context} rasmi`,
      close: `${context} gallery'ni yopish`,
      zoom: `${context} rasmini kattalashtirish`,
      fullscreen: `${context} rasmini to'liq ekranda ko'rish`,
      thumbnail: `${context} thumbnail rasmi`
    };
    return labels[action as keyof typeof labels] || action;
  }
};

// Default export object
const GalleryComponents = {
  ProductImageGallery,
  CartItemGallery,
  ImageUploader,
  MobileGallery,
  useImageGallery,
  imageOptimization,
  galleryConfig,
  galleryUtils,
  gallerySEO
};

export default GalleryComponents;
