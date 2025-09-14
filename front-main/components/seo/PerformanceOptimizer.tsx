import { useEffect } from 'react';
import { useRouter } from 'next/router';

interface PerformanceOptimizerProps {
  enableLazyLoading?: boolean;
  enableServiceWorker?: boolean;
  preloadCriticalResources?: boolean;
  optimizeScrolling?: boolean;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  enableLazyLoading = true,
  enableServiceWorker = true,
  preloadCriticalResources = true,
  optimizeScrolling = true
}) => {
  const router = useRouter();

  useEffect(() => {
    // Register Service Worker for performance
    if (enableServiceWorker && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('SW registered: ', registration);
          })
          .catch((registrationError) => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Preload critical resources
    if (preloadCriticalResources) {
      preloadCriticalAssets();
    }

    // Optimize scrolling performance
    if (optimizeScrolling) {
      optimizeScrollPerformance();
    }

    // Lazy load images
    if (enableLazyLoading) {
      implementLazyLoading();
    }

    // Preload next pages
    preloadNextPages();

    // Optimize fonts loading
    optimizeFontsLoading();

    // Monitor performance
    monitorPerformance();

  }, [enableLazyLoading, enableServiceWorker, preloadCriticalResources, optimizeScrolling]);

  // Route change optimization
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Track page views
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
          page_path: url,
        });
      }

      // Optimize route transition
      optimizeRouteTransition();
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

  const preloadCriticalAssets = () => {
    if (typeof window === 'undefined') return;

    // Preload critical CSS
    const criticalCSS = [
      '/styles/globals.css',
      '/styles/variables.css'
    ];

    criticalCSS.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'style';
      link.href = href;
      document.head.appendChild(link);
    });

    // Preload critical images
    const criticalImages = [
      '/img/logo-inbola.png',
      '/img/hero-kids.jpg',
      '/icons/favicon-32x32.png'
    ];

    criticalImages.forEach(src => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);
    });

    // Preload fonts
    const fonts = [
      '/fonts/Inter-Regular.woff2',
      '/fonts/Inter-Medium.woff2',
      '/fonts/Inter-SemiBold.woff2'
    ];

    fonts.forEach(href => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = href;
      document.head.appendChild(link);
    });
  };

  const implementLazyLoading = () => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;

    // Lazy load images
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            observer.unobserve(img);
          }
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });

    // Observer for existing lazy images
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });

    // Lazy load iframes (for videos, maps, etc.)
    const iframeObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const iframe = entry.target as HTMLIFrameElement;
          if (iframe.dataset.src) {
            iframe.src = iframe.dataset.src;
            observer.unobserve(iframe);
          }
        }
      });
    }, {
      rootMargin: '100px 0px'
    });

    document.querySelectorAll('iframe[data-src]').forEach(iframe => {
      iframeObserver.observe(iframe);
    });
  };

  const optimizeScrollPerformance = () => {
    if (typeof window === 'undefined') return;

    // Use passive event listeners for better performance
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Update scroll-dependent elements
          updateScrollDependentElements();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    // Smooth scrolling polyfill for better UX
    if (!CSS.supports('scroll-behavior', 'smooth')) {
      import('smoothscroll-polyfill').then(smoothscroll => {
        smoothscroll.polyfill();
      });
    }
  };

  const updateScrollDependentElements = () => {
    // Update header background on scroll
    const header = document.querySelector('nav');
    if (header) {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    }

    // Update progress bar if exists
    const progressBar = document.querySelector('.reading-progress');
    if (progressBar) {
      const scrollPercent = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      (progressBar as HTMLElement).style.width = `${Math.min(scrollPercent, 100)}%`;
    }
  };

  const preloadNextPages = () => {
    if (typeof window === 'undefined') return;

    // Preload likely next pages based on current route
    const currentPath = router.pathname;
    let pagesToPreload: string[] = [];

    switch (currentPath) {
      case '/':
        pagesToPreload = ['/products', '/categories', '/about'];
        break;
      case '/products':
        pagesToPreload = ['/cart', '/favorites'];
        break;
      case '/cart':
        pagesToPreload = ['/checkout'];
        break;
      default:
        pagesToPreload = ['/'];
    }

    // Preload on hover for better perceived performance
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      link.addEventListener('mouseenter', () => {
        const href = (link as HTMLAnchorElement).href;
        if (href && href.startsWith(window.location.origin)) {
          router.prefetch(href);
        }
      }, { once: true });
    });

    // Preload critical pages immediately
    pagesToPreload.forEach(page => {
      router.prefetch(page);
    });
  };

  const optimizeFontsLoading = () => {
    if (typeof window === 'undefined') return;

    // Use font-display: swap for better FCP
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 400;
        font-display: swap;
        src: url('/fonts/Inter-Regular.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 500;
        font-display: swap;
        src: url('/fonts/Inter-Medium.woff2') format('woff2');
      }
      @font-face {
        font-family: 'Inter';
        font-style: normal;
        font-weight: 600;
        font-display: swap;
        src: url('/fonts/Inter-SemiBold.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);
  };

  const optimizeRouteTransition = () => {
    // Add loading indicator for route changes
    const loader = document.querySelector('.route-loader');
    if (loader) {
      loader.classList.add('active');
      setTimeout(() => {
        loader.classList.remove('active');
      }, 300);
    }
  };

  const monitorPerformance = () => {
    if (typeof window === 'undefined') return;

    // Monitor long tasks that could affect performance
    if ('PerformanceObserver' in window) {
      try {
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.duration > 50) {
              console.warn('Long task detected:', entry);
              
              // Send to analytics in production
              if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
                (window as any).gtag('event', 'long_task', {
                  event_category: 'Performance',
                  event_label: `${entry.duration}ms`,
                  value: Math.round(entry.duration)
                });
              }
            }
          }
        });
        
        observer.observe({ entryTypes: ['longtask'] });
      } catch (e) {
        // PerformanceObserver might not be supported
        console.warn('PerformanceObserver not supported');
      }
    }

    // Monitor memory usage
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize / memory.jsHeapSizeLimit > 0.9) {
          console.warn('High memory usage detected');
          
          // Trigger garbage collection if possible
          if ('gc' in window) {
            (window as any).gc();
          }
        }
      }, 30000);
    }

    // Monitor network conditions
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
        // Reduce quality for slow connections
        document.body.classList.add('slow-connection');
      }
    }
  };

  return null;
};

export default PerformanceOptimizer;