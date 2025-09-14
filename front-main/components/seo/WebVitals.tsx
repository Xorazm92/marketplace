import { useEffect } from 'react';
import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

interface WebVitalsProps {
  analyticsId?: string;
  debug?: boolean;
}

const WebVitals: React.FC<WebVitalsProps> = ({ analyticsId, debug = false }) => {
  useEffect(() => {
    const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals';

    function sendToAnalytics(metric: Metric) {
      const body = JSON.stringify(metric);
      
      // Send to Vercel Analytics
      if (analyticsId) {
        const url = `${vitalsUrl}?id=${analyticsId}`;
        
        // Use `navigator.sendBeacon()` if available, falling back to `fetch()`
        if (navigator.sendBeacon) {
          navigator.sendBeacon(url, body);
        } else {
          fetch(url, { body, method: 'POST', keepalive: true });
        }
      }

      // Send to Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // Debug logging
      if (debug) {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: getVitalRating(metric.name, metric.value),
          id: metric.id,
          entries: metric.entries,
        });
      }

      // Performance monitoring for INBOLA
      if (typeof window !== 'undefined') {
        // Store metrics in localStorage for admin dashboard
        const existingMetrics = JSON.parse(localStorage.getItem('inbola_web_vitals') || '[]');
        const newMetric = {
          name: metric.name,
          value: metric.value,
          rating: getVitalRating(metric.name, metric.value),
          timestamp: Date.now(),
          url: window.location.pathname,
        };
        
        existingMetrics.push(newMetric);
        
        // Keep only last 50 metrics
        if (existingMetrics.length > 50) {
          existingMetrics.splice(0, existingMetrics.length - 50);
        }
        
        localStorage.setItem('inbola_web_vitals', JSON.stringify(existingMetrics));
      }
    }

    // Get all Core Web Vitals (web-vitals v5 API)
    onCLS(sendToAnalytics);
    onINP(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);

  }, [analyticsId, debug]);

  return null;
};

// Helper function to rate web vitals
function getVitalRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  switch (name) {
    case 'CLS':
      return value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
    case 'LCP':
      return value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
    case 'INP':
      // INP guidance (good <=200ms, needs-improvement <=500ms, poor >500ms)
      return value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
    case 'FCP':
      return value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
    case 'TTFB':
      return value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
    default:
      return 'good';
  }
}

export default WebVitals;