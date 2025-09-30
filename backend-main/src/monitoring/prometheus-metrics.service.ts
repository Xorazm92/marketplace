// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisCacheService } from '../performance/redis-cache.service';

@Injectable()
export class PrometheusMetricsService {
  private readonly logger = new Logger(PrometheusMetricsService.name);

  // Application Metrics
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code', 'user_type'],
  });

  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  });

  // Business Metrics
  private readonly ordersTotal = new Counter({
    name: 'orders_total',
    help: 'Total number of orders',
    labelNames: ['status', 'payment_method', 'category'],
  });

  private readonly revenueTotal = new Counter({
    name: 'revenue_total',
    help: 'Total revenue in UZS',
    labelNames: ['category', 'payment_method'],
  });

  private readonly usersActive = new Gauge({
    name: 'users_active',
    help: 'Number of active users',
    labelNames: ['user_type', 'time_window'],
  });

  private readonly productsTotal = new Gauge({
    name: 'products_total',
    help: 'Total number of products',
    labelNames: ['category', 'status'],
  });

  // Performance Metrics
  private readonly databaseConnections = new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
  });

  private readonly cacheHitRate = new Gauge({
    name: 'cache_hit_rate',
    help: 'Cache hit rate percentage',
    labelNames: ['cache_layer'],
  });

  private readonly errorRate = new Gauge({
    name: 'error_rate',
    help: 'Application error rate',
    labelNames: ['error_type', 'service'],
  });

  // Security Metrics
  private readonly authenticationAttempts = new Counter({
    name: 'authentication_attempts_total',
    help: 'Total authentication attempts',
    labelNames: ['method', 'status', 'ip_country'],
  });

  private readonly suspiciousActivity = new Counter({
    name: 'suspicious_activity_total',
    help: 'Suspicious activity detected',
    labelNames: ['activity_type', 'severity'],
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheService,
  ) {
    // Enable default metrics collection
    collectDefaultMetrics({ register });
    this.startMetricsCollection();
  }

  // HTTP Request Metrics
  recordHttpRequest(method: string, route: string, statusCode: number, duration: number, userType?: string) {
    this.httpRequestsTotal.inc({
      method,
      route,
      status_code: statusCode.toString(),
      user_type: userType || 'anonymous',
    });

    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration / 1000 // Convert to seconds
    );
  }

  // Business Metrics
  recordOrder(status: string, paymentMethod: string, category: string, amount: number) {
    this.ordersTotal.inc({ status, payment_method: paymentMethod, category });
    
    if (status === 'completed') {
      this.revenueTotal.inc({ category, payment_method: paymentMethod }, amount);
    }
  }

  recordUserActivity(userType: string, timeWindow: string, count: number) {
    this.usersActive.set({ user_type: userType, time_window: timeWindow }, count);
  }

  recordProductMetrics(category: string, status: string, count: number) {
    this.productsTotal.set({ category, status }, count);
  }

  // Performance Metrics
  recordDatabaseConnections(count: number) {
    this.databaseConnections.set(count);
  }

  recordCacheMetrics(layer: string, hitRate: number) {
    this.cacheHitRate.set({ cache_layer: layer }, hitRate);
  }

  recordError(errorType: string, service: string, rate: number) {
    this.errorRate.set({ error_type: errorType, service }, rate);
  }

  // Security Metrics
  recordAuthAttempt(method: string, status: string, ipCountry: string) {
    this.authenticationAttempts.inc({
      method,
      status,
      ip_country: ipCountry,
    });
  }

  recordSuspiciousActivity(activityType: string, severity: string) {
    this.suspiciousActivity.inc({ activity_type: activityType, severity });
  }

  // Automated metrics collection
  private startMetricsCollection() {
    setInterval(async () => {
      await this.collectBusinessMetrics();
      await this.collectPerformanceMetrics();
    }, 30000); // Every 30 seconds
  }

  private async collectBusinessMetrics() {
    try {
      // Active users metrics
      const activeUsers = await // @ts-ignore
    this.prisma.user.count({
        where: {
          last_online: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      });
      this.recordUserActivity('all', '5m', activeUsers);

      // Product metrics by category
      const productsByCategory = await // @ts-ignore
    this.prisma.product.groupBy({
        by: ['category_id'],
        where: { is_active: true },
        _count: { id: true },
      });

      for (const category of productsByCategory) {
        this.recordProductMetrics(category.category_id, 'active', category._count.id);
      }

      // Order metrics (last hour)
      const recentOrders = await // @ts-ignore
    this.prisma.order.findMany({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
          },
        },
        select: {
          status: true,
          total_amount: true,
          payment_method: true,
        },
      });

      for (const order of recentOrders) {
        this.recordOrder(
          order.status,
          order.payment_method || 'unknown',
          'general',
          parseFloat(order.total_amount.toString())
        );
      }

    } catch (error) {
      this.logger.error('Error collecting business metrics:', error);
    }
  }

  private async collectPerformanceMetrics() {
    try {
      // Database connections
      const dbConnections = await this.prisma.$queryRaw`
        SELECT count(*) as connections FROM pg_stat_activity;
      `;
      this.recordDatabaseConnections(parseInt(dbConnections[0]?.connections || '0'));

      // Cache metrics
      const cacheMetrics = await this.cacheService.getMetrics();
      for (const [layer, metrics] of Object.entries(cacheMetrics)) {
        const hitRate = metrics.hits / (metrics.hits + metrics.misses) * 100;
        this.recordCacheMetrics(layer, isNaN(hitRate) ? 0 : hitRate);
      }

    } catch (error) {
      this.logger.error('Error collecting performance metrics:', error);
    }
  }

  // Custom business intelligence metrics
  async getBusinessIntelligence(): Promise<Record<string, any>> {
    const [
      totalUsers,
      totalOrders,
      totalRevenue,
      topCategories,
      conversionRate,
    ] = await Promise.all([
    this.prisma.user.count(),
    this.prisma.order.count(),
    this.prisma.order.aggregate({
        _sum: { total_amount: true },
        where: { status: 'DELIVERED' },
      }),
      this.getTopCategories(),
      this.getConversionRate(),
    ]);

    return {
      totalUsers,
      totalOrders,
      totalRevenue: totalRevenue._sum.total_amount || 0,
      topCategories,
      conversionRate,
      timestamp: new Date().toISOString(),
    };
  }

  private async getTopCategories() {
    return await // @ts-ignore
    this.prisma.product.groupBy({
      by: ['category_id'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  }

  private async getConversionRate() {
    const [visitors, orders] = await Promise.all([
    this.prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    this.prisma.order.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    return visitors > 0 ? (orders / visitors) * 100 : 0;
  }

  // Export metrics for Prometheus scraping
  async getMetrics(): Promise<string> {
    return await register.metrics();
  }

  // Health check for monitoring
  async healthCheck(): Promise<Record<string, any>> {
    try {
      const [dbHealth, cacheHealth] = await Promise.all([
        this.prisma.$queryRaw`SELECT 1`,
        this.cacheService.healthCheck(),
      ]);

      return {
        status: 'healthy',
        database: !!dbHealth,
        cache: cacheHealth,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  // Alert conditions
  async checkAlertConditions(): Promise<string[]> {
    const alerts: string[] = [];

    try {
      // High error rate
      const errorRate = await this.getErrorRate();
      if (errorRate > 5) {
        alerts.push(`High error rate: ${errorRate}%`);
      }

      // Low cache hit rate
      const cacheMetrics = await this.cacheService.getMetrics();
      const avgHitRate = Object.values(cacheMetrics).reduce((sum, m) => {
        const hitRate = m.hits / (m.hits + m.misses);
        return sum + (isNaN(hitRate) ? 0 : hitRate);
      }, 0) / Object.keys(cacheMetrics).length;

      if (avgHitRate < 0.8) {
        alerts.push(`Low cache hit rate: ${(avgHitRate * 100).toFixed(2)}%`);
      }

      // High database connections
      const dbConnections = await this.prisma.$queryRaw`
        SELECT count(*) as connections FROM pg_stat_activity;
      `;
      const connections = parseInt(dbConnections[0]?.connections || '0');
      if (connections > 80) {
        alerts.push(`High database connections: ${connections}`);
      }

    } catch (error) {
      alerts.push(`Monitoring system error: ${error.message}`);
    }

    return alerts;
  }

  private async getErrorRate(): Promise<number> {
    // This would be calculated from actual error logs
    // For now, return a placeholder
    return Math.random() * 10;
  }
}
