import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private metrics = new Map<string, any>();

  constructor(private readonly configService: ConfigService) {}

  // Measure execution time
  async measureTime<T>(
    operation: () => Promise<T>,
    label: string,
  ): Promise<{ result: T; duration: number }> {
    const start = process.hrtime.bigint();
    
    try {
      const result = await operation();
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      
      this.logger.debug(`[Performance] ${label}: ${duration.toFixed(2)}ms`);
      this.recordMetric(label, duration);
      
      return { result, duration };
    } catch (error) {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000;
      
      this.logger.error(`[Performance] ${label} failed after ${duration.toFixed(2)}ms:`, error);
      throw error;
    }
  }

  // Record performance metric
  recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, {
        count: 0,
        total: 0,
        min: Infinity,
        max: 0,
        avg: 0,
      });
    }

    const metric = this.metrics.get(name);
    metric.count++;
    metric.total += value;
    metric.min = Math.min(metric.min, value);
    metric.max = Math.max(metric.max, value);
    metric.avg = metric.total / metric.count;
  }

  // Get performance metrics
  getMetrics(): Record<string, any> {
    const result: Record<string, any> = {};
    for (const [name, metric] of this.metrics.entries()) {
      result[name] = {
        ...metric,
        min: metric.min === Infinity ? 0 : metric.min,
      };
    }
    return result;
  }

  // Clear metrics
  clearMetrics(): void {
    this.metrics.clear();
  }

  // Memory usage monitoring
  getMemoryUsage(): NodeJS.MemoryUsage {
    return process.memoryUsage();
  }

  // Check if memory usage is within threshold
  isMemoryHealthy(): boolean {
    const usage = this.getMemoryUsage();
    const threshold = this.configService.get<number>('MEMORY_THRESHOLD') || 0.8;
    const usedPercentage = usage.heapUsed / usage.heapTotal;
    
    return usedPercentage < threshold;
  }

  // Database query optimization helpers
  optimizeQuery(query: string, params?: any[]): { query: string; params?: any[] } {
    // Add LIMIT if not present for SELECT queries
    if (query.trim().toLowerCase().startsWith('select') && 
        !query.toLowerCase().includes('limit')) {
      const defaultLimit = this.configService.get<number>('DEFAULT_QUERY_LIMIT') || 100;
      query += ` LIMIT ${defaultLimit}`;
    }

    return { query, params };
  }

  // Create optimized cache key
  createCacheKey(prefix: string, ...parts: (string | number)[]): string {
    const key = `${prefix}:${parts.join(':')}`;
    
    // Ensure key length is within Redis limits
    if (key.length > 250) {
      const hash = this.hashString(key);
      return `${prefix}:hash:${hash}`;
    }
    
    return key;
  }

  // Simple hash function for long keys
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  // Batch operations helper
  async batchProcess<T, R>(
    items: T[],
    processor: (batch: T[]) => Promise<R[]>,
    batchSize: number = 10,
  ): Promise<R[]> {
    const results: R[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await processor(batch);
      results.push(...batchResults);
    }
    
    return results;
  }

  // Rate limiting helper
  private rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  isRateLimited(key: string, limit: number, windowMs: number): boolean {
    const now = Date.now();
    const entry = this.rateLimitMap.get(key);

    if (!entry || now > entry.resetTime) {
      this.rateLimitMap.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return false;
    }

    if (entry.count >= limit) {
      return true;
    }

    entry.count++;
    return false;
  }

  // Cleanup rate limit entries
  cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, entry] of this.rateLimitMap.entries()) {
      if (now > entry.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }

  // Performance health check
  getHealthStatus(): {
    status: 'healthy' | 'warning' | 'critical';
    memory: NodeJS.MemoryUsage;
    metrics: Record<string, any>;
    uptime: number;
  } {
    const memory = this.getMemoryUsage();
    const metrics = this.getMetrics();
    const uptime = process.uptime();
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    
    // Check memory usage
    if (!this.isMemoryHealthy()) {
      status = 'warning';
    }
    
    // Check average response times
    for (const [name, metric] of Object.entries(metrics)) {
      if (metric.avg > 1000) { // 1 second threshold
        status = status === 'healthy' ? 'warning' : 'critical';
      }
    }
    
    return {
      status,
      memory,
      metrics,
      uptime,
    };
  }
}
