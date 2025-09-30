// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CacheStrategyService } from '../cache/cache-strategy.service';

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
}

@Injectable()
export class PerformanceMonitorService {
  private readonly logger = new Logger(PerformanceMonitorService.name);
  private metricsInterval: NodeJS.Timeout;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly cacheService: CacheStrategyService,
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
      
      // Store in Redis for real-time dashboard
      await this.redisService.setex('metrics:realtime', 60, JSON.stringify(metrics));
      
      // Log critical metrics
      if (metrics.averageResponseTime > 1000) {
        this.logger.warn(`High response time: ${metrics.averageResponseTime}ms`);
      }
      
      if (metrics.errorRate > 5) {
        this.logger.error(`High error rate: ${metrics.errorRate}%`);
      }
      
    } catch (error) {
      this.logger.error('Error collecting metrics:', error);
    }
  }

  // Get real-time performance metrics
  async getRealTimeMetrics(): Promise<RealTimeMetrics> {
    const pipeline = this.redisService.pipeline();
    
    // Get metrics from Redis
    const [
      activeUsers,
      requestsPerSecond,
      responseTime,
      errorCount,
      cacheHits,
      cacheMisses,
    ] = await Promise.all([
      this.getActiveUsers(),
      this.getRequestsPerSecond(),
      this.getAverageResponseTime(),
      this.getErrorCount(),
      this.getCacheHits(),
      this.getCacheMisses(),
    ]);

    return {
      activeUsers,
      requestsPerSecond,
      averageResponseTime: responseTime,
      errorCount,
      cacheHits,
      cacheMisses,
    };
  }

  // Database performance monitoring
  async getDatabaseMetrics(): Promise<Record<string, any>> {
    const metrics = await this.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        n_tup_ins as inserts,
        n_tup_upd as updates,
        n_tup_del as deletes,
        n_live_tup as live_tuples,
        n_dead_tup as dead_tuples,
        seq_scan as sequential_scans,
        seq_tup_read as sequential_tuples_read,
        idx_scan as index_scans,
        idx_tup_fetch as index_tuples_fetched
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY n_live_tup DESC;
    `;

    return metrics;
  }

  // Query performance analysis
  async analyzeQueryPerformance(): Promise<Record<string, any>[]> {
    const slowQueries = await this.prisma.$queryRaw`
      SELECT 
        query,
        mean_exec_time as avg_time_ms,
        calls,
        total_exec_time as total_time_ms,
        rows,
        100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
      FROM pg_stat_statements
      WHERE mean_exec_time > 50
      ORDER BY mean_exec_time DESC
      LIMIT 20;
    `;

    return slowQueries;
  }

  // Cache performance metrics
  async getCacheMetrics(): Promise<Record<string, any>> {
    const cacheMetrics = await this.cacheService.getMetrics();
    const redisInfo = await this.redisService.info();
    
    return {
      cacheMetrics,
      redis: {
        usedMemory: redisInfo.used_memory_human,
        connectedClients: redisInfo.connected_clients,
        keyspaceHits: redisInfo.keyspace_hits,
        keyspaceMisses: redisInfo.keyspace_misses,
        hitRate: redisInfo.keyspace_hits / (redisInfo.keyspace_hits + redisInfo.keyspace_misses) * 100,
      },
    };
  }

  // Real-time active users
  private async getActiveUsers(): Promise<number> {
    const keys = await this.redisService.keys('presence:*');
    return keys.length;
  }

  // Requests per second
  private async getRequestsPerSecond(): Promise<number> {
    const count = await this.redisService.incr('requests:counter');
    const ttl = await this.redisService.ttl('requests:counter');
    
    if (ttl === -1) {
      await this.redisService.expire('requests:counter', 1);
    }
    
    return count;
  }

  // Average response time
  private async getAverageResponseTime(): Promise<number> {
    const times = await this.redisService.lrange('response_times', 0, 99);
    if (times.length === 0) return 0;
    
    const total = times.reduce((sum, time) => sum + parseInt(time), 0);
    return total / times.length;
  }

  // Error count
  private async getErrorCount(): Promise<number> {
    return parseInt((await this.redisService.get('errors:count')) || '0');
  }

  // Cache hits/misses
  private async getCacheHits(): Promise<number> {
    const metrics = await this.cacheService.getMetrics();
    return Object.values(metrics).reduce((sum, m) => sum + m.hits, 0);
  }

  private async getCacheMisses(): Promise<number> {
    const metrics = await this.cacheService.getMetrics();
    return Object.values(metrics).reduce((sum, m) => sum + m.misses, 0);
  }

  // Performance alerting
  async checkPerformanceThresholds(): Promise<string[]> {
    const alerts: string[] = [];
    const metrics = await this.getRealTimeMetrics();

    if (metrics.averageResponseTime > 1000) {
      alerts.push(`High response time: ${metrics.averageResponseTime}ms`);
    }

    if (metrics.errorCount > 100) {
      alerts.push(`High error count: ${metrics.errorCount}`);
    }

    if (metrics.activeUsers > 10000) {
      alerts.push(`High user load: ${metrics.activeUsers} active users`);
    }

    const cacheHitRate = metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses);
    if (cacheHitRate < 0.8) {
      alerts.push(`Low cache hit rate: ${(cacheHitRate * 100).toFixed(2)}%`);
    }

    return alerts;
  }

  // Performance optimization recommendations
  async getOptimizationRecommendations(): Promise<string[]> {
    const recommendations: string[] = [];
    const metrics = await this.getRealTimeMetrics();

    // Database recommendations
    const slowQueries = await this.analyzeQueryPerformance();
    if (slowQueries.length > 0) {
      recommendations.push(`Found ${slowQueries.length} slow queries that need optimization`);
    }

    // Cache recommendations
    const cacheMetrics = await this.getCacheMetrics();
    if (cacheMetrics.redis.hitRate < 80) {
      recommendations.push('Consider increasing cache TTL or adding more cache layers');
    }

    // Memory recommendations
    const redisInfo = await this.redisService.info();
    if (parseInt(redisInfo.used_memory) > 1000000000) { // 1GB
      recommendations.push('Redis memory usage is high, consider cache cleanup');
    }

    return recommendations;
  }

  // Performance benchmarking
  async benchmarkEndpoint(endpoint: string, iterations = 100): Promise<Record<string, number>> {
    const results = {
      min: Infinity,
      max: 0,
      avg: 0,
      total: 0,
    };

    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      
      // Simulate endpoint call
      await // @ts-ignore
    this.prisma.product.count({ where: { is_active: true } });
      
      const duration = Date.now() - start;
      times.push(duration);
      
      results.min = Math.min(results.min, duration);
      results.max = Math.max(results.max, duration);
      results.total += duration;
    }
    
    results.avg = results.total / iterations;
    
    return results;
  }

  // Real-time dashboard data
  async getDashboardData(): Promise<Record<string, any>> {
    const [
      realTimeMetrics,
      databaseMetrics,
      cacheMetrics,
      slowQueries,
      alerts,
    ] = await Promise.all([
      this.getRealTimeMetrics(),
      this.getDatabaseMetrics(),
      this.getCacheMetrics(),
      this.analyzeQueryPerformance(),
      this.checkPerformanceThresholds(),
    ]);

    return {
      realTime: realTimeMetrics,
      database: databaseMetrics,
      cache: cacheMetrics,
      slowQueries,
      alerts,
      timestamp: new Date().toISOString(),
    };
  }

  // Performance optimization based on metrics
  async optimizeBasedOnMetrics(): Promise<void> {
    const metrics = await this.getRealTimeMetrics();
    
    // Auto-scale cache if needed
    if (metrics.cacheHitRate < 70) {
      await this.cacheService.warmPopularProducts(200);
    }
    
    // Clean up old cache entries
    if (metrics.activeUsers < 100) {
      await this.cacheService.cleanup();
    }
  }

  // Stop metrics collection
  onModuleDestroy() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }
  }
}
