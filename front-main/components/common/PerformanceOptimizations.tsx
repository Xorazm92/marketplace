import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiImage, FiLoader } from 'react-icons/fi';
import styles from './PerformanceOptimizations.module.scss';

// Lazy Loading Image Component
interface LazyImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholder?: string;
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  sizes?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc = '/img/placeholder-product.jpg',
  placeholder,
  className = '',
  width,
  height,
  quality = 75,
  priority = false,
  onLoad,
  onError,
  objectFit = 'cover',
  sizes
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : placeholder || fallbackSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (priority) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px 0px', // Start loading 50px before the image enters viewport
        threshold: 0.1
      }
    );

    if (imgRef.current) {
      observerRef.current.observe(imgRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority]);

  // Load actual image when in view
  useEffect(() => {
    if (isInView && !isLoaded && !hasError) {
      setCurrentSrc(src);
    }
  }, [isInView, isLoaded, hasError, src]);

  const handleImageLoad = useCallback(() => {
    setIsLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleImageError = useCallback(() => {
    setHasError(true);
    setCurrentSrc(fallbackSrc);
    onError?.();
  }, [fallbackSrc, onError]);

  // Generate optimized image URL
  const getOptimizedSrc = (src: string) => {
    if (src.startsWith('http') || src.startsWith('/img/')) {
      return src;
    }
    
    // Add optimization parameters for Next.js Image Optimization API
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    if (quality !== 75) params.append('q', quality.toString());
    
    return `${src}${params.toString() ? `?${params.toString()}` : ''}`;
  };

  return (
    <div 
      className={`${styles.lazyImageContainer} ${className}`}
      style={{ aspectRatio: width && height ? `${width}/${height}` : undefined }}
    >
      {!isLoaded && (
        <div className={styles.placeholder}>
          {placeholder ? (
            <img 
              src={placeholder} 
              alt=\"\" 
              className={styles.placeholderImage}
              style={{ objectFit }}
            />
          ) : (
            <div className={styles.placeholderIcon}>
              <FiImage />
            </div>
          )}
          {!isInView && (
            <div className={styles.loadingIndicator}>
              <FiLoader className={styles.spinner} />
            </div>
          )}
        </div>
      )}
      
      <img
        ref={imgRef}
        src={getOptimizedSrc(currentSrc)}
        alt={alt}
        className={`${styles.image} ${isLoaded ? styles.loaded : styles.loading}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading={priority ? 'eager' : 'lazy'}
        decoding=\"async\"
        style={{ objectFit }}
        sizes={sizes}
        width={width}
        height={height}
      />
    </div>
  );
};

// Optimized Animation Component
interface OptimizedAnimationProps {
  children: React.ReactNode;
  animation: 'fadeIn' | 'slideUp' | 'slideLeft' | 'slideRight' | 'scaleIn' | 'none';
  duration?: number;
  delay?: number;
  className?: string;
  trigger?: 'onMount' | 'onInView' | 'onClick';
  respectMotionPreference?: boolean;
}

export const OptimizedAnimation: React.FC<OptimizedAnimationProps> = ({
  children,
  animation,
  duration = 300,
  delay = 0,
  className = '',
  trigger = 'onMount',
  respectMotionPreference = true
}) => {
  const [isVisible, setIsVisible] = useState(trigger === 'onMount');
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Check for reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  useEffect(() => {
    if (respectMotionPreference) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      
      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };
      
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [respectMotionPreference]);

  // Intersection Observer for onInView trigger
  useEffect(() => {
    if (trigger !== 'onInView' || hasAnimated) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setIsVisible(true);
          setHasAnimated(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '20px 0px',
        threshold: 0.1
      }
    );

    if (elementRef.current) {
      observerRef.current.observe(elementRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [trigger, hasAnimated]);

  const handleClick = () => {
    if (trigger === 'onClick' && !hasAnimated) {
      setIsVisible(true);
      setHasAnimated(true);
    }
  };

  const getAnimationClass = () => {
    if (prefersReducedMotion || animation === 'none') {
      return styles.noAnimation;
    }
    
    if (!isVisible) {
      return styles.hidden;
    }
    
    return styles[animation] || styles.fadeIn;
  };

  return (
    <div
      ref={elementRef}
      className={`${styles.animationContainer} ${getAnimationClass()} ${className}`}
      style={{
        '--animation-duration': `${duration}ms`,
        '--animation-delay': `${delay}ms`
      } as React.CSSProperties}
      onClick={handleClick}
    >
      {children}
    </div>
  );
};

// Performance Monitor Component
interface PerformanceMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export const PerformanceMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<Partial<PerformanceMetrics>>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Web Vitals measurement
    const measurePerformance = () => {
      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEventTiming;
        setMetrics(prev => ({ ...prev, lcp: lastEntry.startTime }));
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FID - First Input Delay
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          const fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
          setMetrics(prev => ({ ...prev, fid }));
        });
      }).observe({ entryTypes: ['first-input'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        }
        setMetrics(prev => ({ ...prev, cls: clsValue }));
      }).observe({ entryTypes: ['layout-shift'] });

      // FCP - First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        });
      }).observe({ entryTypes: ['paint'] });

      // TTFB - Time to First Byte
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
      }
    };

    measurePerformance();
  }, []);

  const getScoreColor = (metric: keyof PerformanceMetrics, value: number) => {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fid: { good: 100, poor: 300 },
      cls: { good: 0.1, poor: 0.25 },
      fcp: { good: 1800, poor: 3000 },
      ttfb: { good: 800, poor: 1800 }
    };

    const threshold = thresholds[metric];
    if (value <= threshold.good) return styles.good;
    if (value <= threshold.poor) return styles.needs;
    return styles.poor;
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className={styles.performanceMonitor}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsVisible(!isVisible)}
      >
        ⚡ Performance
      </button>
      
      {isVisible && (
        <div className={styles.metricsPanel}>
          <h4>Web Vitals</h4>
          <div className={styles.metrics}>
            {Object.entries(metrics).map(([key, value]) => (
              <div 
                key={key} 
                className={`${styles.metric} ${getScoreColor(key as keyof PerformanceMetrics, value)}`}
              >
                <span className={styles.metricName}>{key.toUpperCase()}</span>
                <span className={styles.metricValue}>
                  {key === 'cls' ? value.toFixed(3) : `${Math.round(value)}ms`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Image Preloader Component
interface ImagePreloaderProps {
  images: string[];
  onProgress?: (loaded: number, total: number) => void;
  onComplete?: () => void;
}

export const ImagePreloader: React.FC<ImagePreloaderProps> = ({
  images,
  onProgress,
  onComplete
}) => {
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    if (images.length === 0) {
      onComplete?.();
      return;
    }

    let loaded = 0;
    const total = images.length;

    const loadImage = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          loaded++;
          setLoadedCount(loaded);
          onProgress?.(loaded, total);
          resolve();
        };
        img.onerror = () => {
          loaded++;
          setLoadedCount(loaded);
          onProgress?.(loaded, total);
          resolve(); // Still resolve to continue with other images
        };
        img.src = src;
      });
    };

    Promise.allSettled(images.map(loadImage)).then(() => {
      onComplete?.();
    });
  }, [images, onProgress, onComplete]);

  return null; // This component doesn't render anything
};

// Bundle Size Analyzer (Development only)
export const BundleSizeAnalyzer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [bundleInfo, setBundleInfo] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Analyze bundle size in development
      const analyzeBundle = () => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const styles = Array.from(document.querySelectorAll('link[rel=\"stylesheet\"]'));
        
        const info = {
          scripts: scripts.length,
          styles: styles.length,
          totalElements: document.querySelectorAll('*').length,
          memory: (performance as any).memory || null
        };
        
        setBundleInfo(info);
      };

      analyzeBundle();
    }
  }, []);

  if (process.env.NODE_ENV !== 'development' || !bundleInfo) return null;

  return (
    <div className={styles.bundleAnalyzer}>
      <button 
        className={styles.toggleButton}
        onClick={() => setIsVisible(!isVisible)}
      >
        📦 Bundle Info
      </button>
      
      {isVisible && (
        <div className={styles.bundlePanel}>
          <h4>Bundle Analysis</h4>
          <div className={styles.bundleStats}>
            <div>Scripts: {bundleInfo.scripts}</div>
            <div>Styles: {bundleInfo.styles}</div>
            <div>DOM Elements: {bundleInfo.totalElements}</div>
            {bundleInfo.memory && (
              <>
                <div>Used Memory: {Math.round(bundleInfo.memory.usedJSHeapSize / 1024 / 1024)}MB</div>
                <div>Total Memory: {Math.round(bundleInfo.memory.totalJSHeapSize / 1024 / 1024)}MB</div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default {
  LazyImage,
  OptimizedAnimation,
  PerformanceMonitor,
  ImagePreloader,
  BundleSizeAnalyzer
};