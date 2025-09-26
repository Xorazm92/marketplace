import { useState, useEffect, useCallback, useRef } from 'react';

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
  width?: number;
  height?: number;
  is360?: boolean;
}

interface UseImageGalleryProps {
  images: GalleryImage[];
  initialIndex?: number;
  enablePreloading?: boolean;
  enableLazyLoading?: boolean;
  preloadAdjacent?: number;
}

interface UseImageGalleryReturn {
  currentIndex: number;
  currentImage: GalleryImage | null;
  isLoading: boolean;
  loadedImages: Set<number>;
  setCurrentIndex: (index: number) => void;
  nextImage: () => void;
  previousImage: () => void;
  preloadImage: (index: number) => Promise<void>;
  getOptimizedUrl: (url: string, width?: number, quality?: number) => string;
  isImageLoaded: (index: number) => boolean;
}

export const useImageGallery = ({
  images,
  initialIndex = 0,
  enablePreloading = true,
  enableLazyLoading = true,
  preloadAdjacent = 2
}: UseImageGalleryProps): UseImageGalleryReturn => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const preloadQueueRef = useRef<Set<number>>(new Set());

  const currentImage = images[currentIndex] || null;

  // Preload image function
  const preloadImage = useCallback(async (index: number): Promise<void> => {
    if (!images[index] || loadedImages.has(index) || preloadQueueRef.current.has(index)) {
      return;
    }

    preloadQueueRef.current.add(index);

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(index));
        preloadQueueRef.current.delete(index);
        resolve();
      };
      
      img.onerror = () => {
        preloadQueueRef.current.delete(index);
        reject(new Error(`Failed to load image at index ${index}`));
      };
      
      img.src = getOptimizedUrl(images[index].url, 800);
    });
  }, [images, loadedImages]);

  // Get optimized image URL
  const getOptimizedUrl = useCallback((
    url: string, 
    width: number = 800, 
    quality: number = 80
  ): string => {
    // Cloudinary optimization
    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
    }
    
    // AWS S3 optimization
    if (url.includes('amazonaws.com')) {
      return `${url}?w=${width}&q=${quality}&fm=webp`;
    }
    
    // Next.js Image optimization (if using custom domain)
    if (url.startsWith('/') || url.includes(window.location.hostname)) {
      return `${url}?w=${width}&q=${quality}`;
    }
    
    return url;
  }, []);

  // Navigation functions
  const nextImage = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(newIndex);
  }, [currentIndex, images.length]);

  const previousImage = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setCurrentIndex(newIndex);
  }, [currentIndex, images.length]);

  // Check if image is loaded
  const isImageLoaded = useCallback((index: number): boolean => {
    return loadedImages.has(index);
  }, [loadedImages]);

  // Preload adjacent images when current index changes
  useEffect(() => {
    if (!enablePreloading || images.length === 0) return;

    const preloadPromises: Promise<void>[] = [];

    // Preload current image first
    preloadPromises.push(preloadImage(currentIndex));

    // Preload adjacent images
    for (let i = 1; i <= preloadAdjacent; i++) {
      // Next images
      const nextIndex = (currentIndex + i) % images.length;
      preloadPromises.push(preloadImage(nextIndex));

      // Previous images
      const prevIndex = (currentIndex - i + images.length) % images.length;
      preloadPromises.push(preloadImage(prevIndex));
    }

    // Handle loading state
    setIsLoading(!loadedImages.has(currentIndex));

    Promise.allSettled(preloadPromises).then(() => {
      setIsLoading(false);
    });
  }, [currentIndex, images.length, enablePreloading, preloadAdjacent, preloadImage, loadedImages]);

  // Initial preloading
  useEffect(() => {
    if (!enablePreloading || images.length === 0) return;

    // Preload first few images on mount
    const initialPreloadCount = Math.min(3, images.length);
    const preloadPromises = Array.from({ length: initialPreloadCount }, (_, i) => 
      preloadImage(i)
    );

    Promise.allSettled(preloadPromises).then(() => {
      setIsLoading(false);
    });
  }, [images, enablePreloading, preloadImage]);

  // Lazy loading with Intersection Observer
  useEffect(() => {
    if (!enableLazyLoading || typeof window === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0');
            preloadImage(index);
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe thumbnail elements (if they exist)
    const thumbnails = document.querySelectorAll('[data-gallery-thumbnail]');
    thumbnails.forEach((thumbnail) => observer.observe(thumbnail));

    return () => {
      observer.disconnect();
    };
  }, [enableLazyLoading, preloadImage]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousImage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextImage();
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(images.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextImage, previousImage, images.length]);

  return {
    currentIndex,
    currentImage,
    isLoading,
    loadedImages,
    setCurrentIndex,
    nextImage,
    previousImage,
    preloadImage,
    getOptimizedUrl,
    isImageLoaded
  };
};

// Image optimization utilities
export const imageOptimization = {
  // Generate responsive image sizes
  generateSizes: (breakpoints: number[] = [640, 768, 1024, 1280, 1536]) => {
    return breakpoints
      .map((bp, index) => {
        if (index === breakpoints.length - 1) {
          return `${bp}px`;
        }
        return `(max-width: ${bp}px) ${bp}px`;
      })
      .join(', ');
  },

  // Generate srcSet for responsive images
  generateSrcSet: (baseUrl: string, sizes: number[] = [400, 800, 1200, 1600]) => {
    return sizes
      .map(size => {
        const optimizedUrl = imageOptimization.getOptimizedUrl(baseUrl, size);
        return `${optimizedUrl} ${size}w`;
      })
      .join(', ');
  },

  // Get optimized URL (shared utility)
  getOptimizedUrl: (url: string, width?: number, quality: number = 80) => {
    if (!width) return url;

    if (url.includes('cloudinary.com')) {
      return url.replace('/upload/', `/upload/w_${width},q_${quality},f_auto/`);
    }
    
    if (url.includes('amazonaws.com')) {
      return `${url}?w=${width}&q=${quality}&fm=webp`;
    }
    
    return url;
  },

  // Check if WebP is supported
  supportsWebP: (): Promise<boolean> => {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  },

  // Get optimal format
  getOptimalFormat: async (originalFormat: string): Promise<string> => {
    const supportsWebP = await imageOptimization.supportsWebP();
    
    if (supportsWebP && ['image/jpeg', 'image/png'].includes(originalFormat)) {
      return 'webp';
    }
    
    return originalFormat.replace('image/', '');
  }
};

export default useImageGallery;
