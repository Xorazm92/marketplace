export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name)!.push(value);
  }

  getAverageMetric(name: string): number {
    const values = this.metrics.get(name);
    if (!values || values.length === 0) return 0;
    
    const sum = values.reduce((acc, val) => acc + val, 0);
    return sum / values.length;
  }

  getMetrics(): Record<string, { average: number; count: number; min: number; max: number }> {
    const result: Record<string, { average: number; count: number; min: number; max: number }> = {};
    
    for (const [name, values] of this.metrics.entries()) {
      if (values.length === 0) continue;
      
      const sum = values.reduce((acc, val) => acc + val, 0);
      const min = Math.min(...values);
      const max = Math.max(...values);
      
      result[name] = {
        average: sum / values.length,
        count: values.length,
        min,
        max,
      };
    }
    
    return result;
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Web Vitals monitoring
  monitorWebVitals(): void {
    if (typeof window !== 'undefined') {
      // Monitor Largest Contentful Paint (LCP)
      this.monitorLCP();
      
      // Monitor First Input Delay (FID)
      this.monitorFID();
      
      // Monitor Cumulative Layout Shift (CLS)
      this.monitorCLS();
    }
  }

  private monitorLCP(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.recordMetric('LCP', lastEntry.startTime);
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  private monitorFID(): void {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.recordMetric('FID', entry.processingStart - entry.startTime);
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
  }

  private monitorCLS(): void {
    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      this.recordMetric('CLS', clsValue);
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
  }
}

// React Hook for performance monitoring
export const usePerformanceMonitor = () => {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    startTimer: monitor.startTimer.bind(monitor),
    recordMetric: monitor.recordMetric.bind(monitor),
    getMetrics: monitor.getMetrics.bind(monitor),
    clearMetrics: monitor.clearMetrics.bind(monitor),
  };
};
