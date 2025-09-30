// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisCacheService } from './redis-cache.service';
import { DatabaseOptimizerService } from './db-optimizer.service';
import { ImageOptimizerService } from './image-optimizer.service';
import { RateLimiterService } from './rate-limiter.service';

interface PerformanceMetrics {
  responseTime: number;
  throughput: number;
  errorRate: number;
  cacheHitRate: number;
  databaseQueries: number;
  memoryUsage: number;
}

interface RealTimeMetrics {
  activeUsers: number;
  requestsPerSecond: number;
  averageResponseTime: number;
  errorCount: number;
  cacheHits: number;
  cacheMisses: number;
  databaseConnections: number;
  memoryUsage: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  lastCheck: Date;
  services: Record<string, boolean>;
}

@Injectable()
export class PerformanceDashboardService {
  private readonly logger = new Logger(PerformanceDashboardService.name);
  private metricsInterval: NodeJS.Timeout;
  private startTime = Date.now();

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheService,
    private readonly dbOptimizer: DatabaseOptimizerService,
    private readonly imageOptimizer: ImageOptimizerService,
    private readonly rateLimiter: RateLimiterService,
  ) {
    this.startMetricsCollection();
  }

  // Real-time metrics collection
  private startMetricsCollection() {
    this.metricsInterval = setInterval(async () => {
      await this.collectMetrics();
    }, 30000); // Collect every 30 seconds
  }

  async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getRealTimeMetrics();
      
      // Store in cache for dashboard
      await this.cacheService.setL1('metrics:realtime', metrics, 60);
      
      // Log critical metrics
      if (metrics.averageResponseTime > 1000) {
        this.logger.warn(`High response time: ${metrics.averageResponseTime}ms`);
      }
      
      if (metrics.errorCount > 100) {
        this.logger.error(`High error count: ${metrics.errorCount}`);
      }
      
    } catch (error) {
      this.logger.error('Error collecting metrics:', error);
    }
  }

  // Get comprehensive real-time metrics
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const [
      activeUsers,
      requestsPerSecond,
      responseTime,
      errorCount,
      cacheMetrics,
      dbConnections,
      memoryUsage,
    ] = await Promise.all([
      this.getActiveUsers(),
      this.getRequestsPerSecond(),
      this.getAverageResponseTime(),
      this.getErrorCount(),
      this.cacheService.getMetrics(),
      this.getDatabaseConnections(),
      this.getMemoryUsage(),
    ]);

    const totalHits = Object.values(cacheMetrics).reduce((sum, m) => sum + m.hits, 0);
    const totalMisses = Object.values(cacheMetrics).reduce((sum, m) => sum + m.misses, 0);

    return {
      activeUsers,
      requestsPerSecond,
      averageResponseTime: responseTime,
      errorCount,
      cacheHits: totalHits,
      cacheMisses: totalMisses,
      databaseConnections: dbConnections,
      memoryUsage,
    };
  }

  // System health monitoring
  async getSystemHealth(): Promise<SystemHealth> {
    const services = {
      database: await this.checkDatabaseHealth(),
      redis: await this.cacheService.healthCheck(),
      imageOptimizer: await this.checkImageOptimizerHealth(),
    };

    const healthyServices = Object.values(services).filter(Boolean).length;
    const totalServices = Object.keys(services).length;
    
    let status: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (healthyServices < totalServices) {
      status = healthyServices < totalServices * 0.5 ? 'critical' : 'warning';
    }

    return {
      status,
      uptime: Date.now() - this.startTime,
      lastCheck: new Date(),
      services,
    };
  }

  // Performance dashboard data
  async getDashboardData(): Promise<Record<string, any>> {
    const [
      realTimeMetrics,
      systemHealth,
      cacheMetrics,
      dbStats,
      imageMetrics,
      loadBalancerMetrics,
      slowQueries,
    ] = await Promise.all([
      this.getRealTimeMetrics(),
      this.getSystemHealth(),
      this.cacheService.getMetrics(),
      this.dbOptimizer.getDatabaseStats(),
      this.imageOptimizer.getImageMetrics(),
      this.rateLimiter.getMetrics(),
      this.dbOptimizer.monitorQueryPerformance(),
    ]);

    return {
      realTime: realTimeMetrics,
      health: systemHealth,
      cache: cacheMetrics,
      database: dbStats,
      images: imageMetrics,
      loadBalancer: loadBalancerMetrics,
      slowQueries,
      timestamp: new Date().toISOString(),
    };
  }

  // Performance alerts and thresholds
  async checkPerformanceThresholds(): Promise<string[]> {
    const alerts: string[] = [];
    const metrics = await this.getRealTimeMetrics();

    // Response time alerts
    if (metrics.averageResponseTime > 1000) {
      alerts.push(`High response time: ${metrics.averageResponseTime}ms`);
    }

    // Error rate alerts
    if (metrics.errorCount > 100) {
      alerts.push(`High error count: ${metrics.errorCount}`);
    }

    // Memory usage alerts
    if (metrics.memoryUsage > 80) {
      alerts.push(`High memory usage: ${metrics.memoryUsage}%`);
    }

    // Cache hit rate alerts
    const cacheHitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses);
    if (cacheHitRate < 0.8) {
      alerts.push(`Low cache hit rate: ${(cacheHitRate * 100).toFixed(2)}%`);
    }

    // Database connection alerts
    if (metrics.databaseConnections > 80) {
      alerts.push(`High database connections: ${metrics.databaseConnections}`);
    }

    return alerts;
  }

  // Performance optimization recommendations
  async getOptimizationRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const metrics = await this.getRealTimeMetrics();

    // Database recommendations
    const slowQueries = await this.dbOptimizer.monitorQueryPerformance();
    if (Array.isArray(slowQueries) && slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} slow queries that need optimization`);
    }

    // Cache recommendations
    const cacheHitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses);
    if (cacheHitRate < 80) {
      recommendations.push('Consider increasing cache TTL or adding more cache layers');
    }

    // Memory recommendations
    if (metrics.memoryUsage > 70) {
      recommendations.push('Memory usage is high, consider scaling or optimizing memory usage');
    }

    // Image optimization recommendations
    const imageMetrics = await this.imageOptimizer.getImageMetrics();
    if (imageMetrics.cacheHitRate < 85) {
      recommendations.push('Image cache hit rate is low, consider CDN optimization');
    }

    return recommendations;
  }

  // Historical performance data
  async getHistoricalMetrics(hours: number = 24): Promise<any[]> {
    const metrics = [];
    const interval = Math.max(1, Math.floor(hours / 24)); // Sample every hour for 24h
    
    for (let i = hours; i >= 0; i -= interval) {
      const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
      const historicalData = await this.cacheService.getL3(`metrics:${timestamp.getHours()}`);
      
      if (historicalData) {
        metrics.push({
          timestamp,
          ...historicalData,
        });
      }
    }
    
    return metrics;
  }

  // Performance benchmarking
  async benchmarkEndpoint(endpoint: string, iterations = 100): Promise<Record<string, number>> {
    const results = {
      min: Infinity,
      max: 0,
      avg: 0,
      total: 0,
      p95: 0,
      p99: 0,
    };

    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      try {
        // Simulate endpoint call
        await // @ts-ignore
    this.prisma.product.count({ where: { is_active: true } });
        
        const duration = Date.now() - start;
        times.push(duration);
        
        results.min = Math.min(results.min, duration);
        results.max = Math.max(results.max, duration);
        results.total += duration;
      } catch (error) {
        this.logger.error(`Benchmark error for ${endpoint}:`, error);
      }
    }
    
    times.sort((a, b) => a - b);
    results.avg = results.total / iterations;
    results.p95 = times[Math.floor(iterations * 0.95)];
    results.p99 = times[Math.floor(iterations * 0.99)];
    
    return results;
  }

  // Auto-scaling recommendations
  async getScalingRecommendations(): Promise<Record<string, any>> {
    const metrics = await this.getRealTimeMetrics();
    const recommendations = {
      scaleUp: false,
      scaleDown: false,
      reasons: [] as string[],
      suggestedInstances: 1,
    };

    // Scale up conditions
    if (metrics.averageResponseTime > 500 && metrics.requestsPerSecond > 100) {
      recommendations.scaleUp = true;
      recommendations.reasons.push('High response time with high traffic');
      recommendations.suggestedInstances = 2;
    }

    if (metrics.memoryUsage > 80) {
      recommendations.scaleUp = true;
      recommendations.reasons.push('High memory usage');
    }

    // Scale down conditions
    if (metrics.averageResponseTime < 100 && metrics.requestsPerSecond < 10 && metrics.memoryUsage < 30) {
      recommendations.scaleDown = true;
      recommendations.reasons.push('Low resource utilization');
    }

    return recommendations;
  }

  // Helper methods for metrics collection
  private async getActiveUsers(): Promise<number> {
    try {
      const count = await // @ts-ignore
    this.prisma.user.count({
        where: {
          last_online: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });
      return count;
    } catch (error) {
      return 0;
    }
  }

  private async getRequestsPerSecond(): Promise<number> {
    const count = await this.cacheService.getL1('requests:counter') || 0;
    return Math.floor(count / 60); // Approximate RPS
  }

  private async getAverageResponseTime(): Promise<number> {
    const times = await this.cacheService.getL1('response_times') || [];
    if (times.length === 0) return 0;
    
    const total = times.reduce((sum: number, time: number) => sum + time, 0);
    return Math.round(total / times.length);
  }

  private async getErrorCount(): Promise<number> {
    return await this.cacheService.getL1('errors:count') || 0;
  }

  private async getDatabaseConnections(): Promise<number> {
    try {
      const result = await this.prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity;`;
      return parseInt(result[0]?.connections || '0');
    } catch (error) {
      return 0;
    }
  }

  private async getMemoryUsage(): Promise<number> {
    // This would typically come from system monitoring
    return Math.floor(Math.random() * 100); // Placeholder
  }

  private async checkDatabaseHealth(): Promise<boolean> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      return false;
    }
  }

  private async checkImageOptimizerHealth(): Promise<boolean> {
    try {
      await this.imageOptimizer.getImageMetrics();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Cleanup
  onModuleDestroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}
