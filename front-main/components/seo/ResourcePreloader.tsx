import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface ResourcePreloaderProps {
  preloadFonts?: boolean;
  preloadImages?: boolean;
  preloadNextPages?: boolean;
  preloadAPIData?: boolean;
}

const ResourcePreloader: React.FC<ResourcePreloaderProps> = ({
  preloadFonts = true,
  preloadImages = true,
  preloadNextPages = true,
  preloadAPIData = true
}) => {
  const router = useRouter();

  useEffect(() => {
    if (preloadFonts) {
      preloadCriticalFonts();
    }
    
    if (preloadImages) {
      preloadCriticalImages();
    }
    
    if (preloadNextPages) {
      preloadLikelyNextPages();
    }
    
    if (preloadAPIData) {
      preloadCriticalAPIData();
    }

    // Preload on interaction
    setupInteractionPreloading();
    
    // Preload on idle
    setupIdlePreloading();

  }, [preloadFonts, preloadImages, preloadNextPages, preloadAPIData]);

  const preloadCriticalFonts = () => {
    const fonts = [
      {
        family: 'Inter',
        weight: '400',
        style: 'normal',
        src: '/fonts/Inter-Regular.woff2',
        format: 'woff2'
      },
      {
        family: 'Inter',
        weight: '500',
        style: 'normal',
        src: '/fonts/Inter-Medium.woff2',
        format: 'woff2'
      },
      {
        family: 'Inter',
        weight: '600',
        style: 'normal',
        src: '/fonts/Inter-SemiBold.woff2',
        format: 'woff2'
      },
      {
        family: 'Inter',
        weight: '700',
        style: 'normal',
        src: '/fonts/Inter-Bold.woff2',
        format: 'woff2'
      }
    ];

    fonts.forEach(font => {
      // Create font face
      const fontFace = new FontFace(font.family, `url(${font.src})`, {
        weight: font.weight,
        style: font.style,
        display: 'swap'
      });

      // Load font
      fontFace.load().then(loadedFont => {
        (document as any).fonts.add(loadedFont);
      }).catch(error => {
        console.warn('Font preload failed:', font.family, error);
      });

      // Also create preload link
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = `font/${font.format}`;
      link.crossOrigin = 'anonymous';
      link.href = font.src;
      document.head.appendChild(link);
    });
  };

  const preloadCriticalImages = () => {
    const criticalImages = [
      // Logo and branding
      '/img/logo-inbola.png',
      '/img/logo-inbola-white.png',
      '/icons/favicon-32x32.png',
      '/icons/apple-touch-icon.png',
      
      // Hero images
      '/img/hero-kids.jpg',
      '/img/hero-toys.jpg',
      '/img/hero-education.jpg',
      
      // Category images
      '/img/categories/toys.jpg',
      '/img/categories/books.jpg',
      '/img/categories/clothes.jpg',
      '/img/categories/education.jpg',
      
      // Trust badges
      '/img/badges/ssl-secure.png',
      '/img/badges/parent-approved.png',
      '/img/badges/kids-safe.png',
      
      // Payment icons
      '/img/payments/uzcard.png',
      '/img/payments/humo.png',
      '/img/payments/payme.png',
      '/img/payments/click.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.addEventListener('load', () => {
        console.log('Preloaded image:', src);
      });
      link.addEventListener('error', () => {
        console.warn('Failed to preload image:', src);
      });
      document.head.appendChild(link);
    });

    // Preload WebP versions if supported
    if (supportsWebP()) {
      const webpImages = criticalImages.map(src => 
        src.replace(/\\.(jpg|jpeg|png)$/, '.webp')
      );
      
      webpImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
      });
    }
  };

  const preloadLikelyNextPages = () => {
    const currentPath = router.pathname;
    let pagesToPreload: string[] = [];

    // Define likely navigation patterns
    const navigationPatterns = {
      '/': ['/products', '/categories', '/search'],
      '/products': ['/cart', '/favorites', '/checkout'],
      '/categories': ['/products'],
      '/search': ['/products'],
      '/cart': ['/checkout', '/products'],
      '/checkout': ['/payment', '/orders'],
      '/product/[id]': ['/cart', '/checkout', '/products'],
      '/seller/[id]': ['/products'],
      '/blog': ['/blog/[slug]'],
      '/profile': ['/orders', '/favorites', '/settings']
    };

    // Get pages to preload based on current route
    Object.entries(navigationPatterns).forEach(([pattern, pages]) => {
      if (matchesPattern(currentPath, pattern)) {
        pagesToPreload.push(...pages);
      }
    });

    // Remove duplicates and current page
    pagesToPreload = [...new Set(pagesToPreload)].filter(page => page !== currentPath);

    // Preload pages
    pagesToPreload.forEach(page => {
      router.prefetch(page).catch(error => {
        console.warn('Failed to prefetch page:', page, error);
      });
    });

    console.log('Preloading pages:', pagesToPreload);
  };

  const preloadCriticalAPIData = () => {
    const apiEndpoints = [
      // Categories for navigation
      '/api/categories',
      
      // Featured products for homepage
      '/api/products/featured',
      
      // User data if logged in
      '/api/user/profile',
      
      // Cart data
      '/api/cart',
      
      // Search suggestions
      '/api/search/suggestions'
    ];

    apiEndpoints.forEach(endpoint => {
      // Use low priority fetch to preload data
      if ('scheduler' in window && 'postTask' in (window as any).scheduler) {
        (window as any).scheduler.postTask(() => {
          fetch(endpoint, {
            method: 'GET',
            headers: {
              'X-Preload': 'true'
            }
          }).catch(error => {
            console.warn('Failed to preload API data:', endpoint, error);
          });
        }, { priority: 'background' });
      } else {
        // Fallback for browsers without scheduler API
        setTimeout(() => {
          fetch(endpoint, {
            method: 'GET',
            headers: {
              'X-Preload': 'true'
            }
          }).catch(error => {
            console.warn('Failed to preload API data:', endpoint, error);
          });
        }, 1000);
      }
    });
  };

  const setupInteractionPreloading = () => {
    // Preload on hover
    document.addEventListener('mouseover', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        router.prefetch(path).catch(() => {});
      }
    }, { passive: true });

    // Preload on focus (for keyboard navigation)
    document.addEventListener('focusin', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        router.prefetch(path).catch(() => {});
      }
    }, { passive: true });

    // Preload on touch start (for mobile)
    document.addEventListener('touchstart', (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href.startsWith(window.location.origin)) {
        const path = new URL(link.href).pathname;
        router.prefetch(path).catch(() => {});
      }
    }, { passive: true });
  };

  const setupIdlePreloading = () => {
    // Use requestIdleCallback for low-priority preloading
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        // Preload additional resources during idle time
        preloadNonCriticalResources();
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        preloadNonCriticalResources();
      }, 2000);
    }
  };

  const preloadNonCriticalResources = () => {
    const nonCriticalImages = [
      '/img/placeholder-product.jpg',
      '/img/avatars/default-user.png',
      '/img/backgrounds/pattern-1.svg',
      '/img/backgrounds/pattern-2.svg'
    ];

    nonCriticalImages.forEach(src => {
      const img = new Image();
      img.src = src;
    });

    // Preload analytics scripts
    const scripts = [
      'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
      'https://mc.yandex.ru/metrika/tag.js'
    ];

    scripts.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'script';
      link.href = src;
      document.head.appendChild(link);
    });
  };

  const supportsWebP = (): boolean => {
    if (typeof window === 'undefined') return false;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    return canvas.toDataURL('image/webp').startsWith('data:image/webp');
  };

  const matchesPattern = (path: string, pattern: string): boolean => {
    if (pattern === path) return true;
    
    // Handle dynamic routes like /product/[id]
    const patternRegex = pattern.replace(/\\[.*?\\]/g, '[^/]+');
    const regex = new RegExp(`^${patternRegex}$`);
    
    return regex.test(path);
  };

  return null;
};

export default ResourcePreloader;