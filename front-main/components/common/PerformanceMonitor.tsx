import { useEffect } from 'react';

const PerformanceMonitor = () => {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Core Web Vitals monitoring
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // Send to analytics
          if (window.gtag) {
            window.gtag('event', 'web_vitals', {
              event_category: 'Web Vitals',
              event_label: entry.name,
              value: Math.round(entry.startTime + entry.duration),
              non_interaction: true,
            });
          }
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Page load time
      window.addEventListener('load', () => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        if (navigation && window.gtag) {
          window.gtag('event', 'timing_complete', {
            name: 'load',
            value: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
          });
        }
      });

      return () => observer.disconnect();
    }
  }, []);

  return null;
};

export default PerformanceMonitor;

