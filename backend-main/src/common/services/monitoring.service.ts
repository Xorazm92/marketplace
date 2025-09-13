import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import { PrismaService } from '../../prisma/prisma.service';


interface SystemMetrics {
  timestamp: Date;
  cpu: {
    usage: number;
    loadAverage: number[];
  };
  memory: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  disk: {
    total: number;
    used: number;
    free: number;
    percentage: number;
  };
  network: {
    connections: number;
  };
}

interface ApplicationMetrics {
  timestamp: Date;
  database: {
    connections: number;
    queries: number;
    slowQueries: number;
  };
  api: {
    requests: number;
    errors: number;
    responseTime: number;
  };
  users: {
    active: number;
    online: number;
    registered: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
  };
}

export interface PerformanceMetrics {
  responseTime: number;
  memoryUsage: {
    rss: number;
    heapUsed: number;
    heapTotal: number;
    external: number;
  };
  cpuUsage: NodeJS.CpuUsage;
  timestamp: Date;
}

export interface ErrorMetrics {
  errorType: string;
  message: string;
  stack?: string;
  userId?: number;
  endpoint?: string;
  timestamp: Date;
}

export interface BusinessMetrics {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  conversionRate: number;
  timestamp: Date;
}

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly isProduction: boolean;
  private performanceMetrics: PerformanceMetrics[] = [];
  private errorMetrics: ErrorMetrics[] = [];
  private businessMetrics: BusinessMetrics[] = [];
  private readonly metricsHistory: SystemMetrics[] = [];
  private readonly appMetricsHistory: ApplicationMetrics[] = [];
  private readonly maxHistorySize = 1000; // Keep last 1000 metrics

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.isProduction = configService.get('NODE_ENV') === 'production';
    this.initializeSentry();
    this.initializeMetrics();
    this.startMetricsCollection();
    this.startMonitoring();
  }

  // Periodic collection helpers
  private collectPerformanceMetrics(): void {
    const metrics: PerformanceMetrics = {
      responseTime: this.getAverageResponseTime(5),
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date(),
    };
    this.performanceMetrics.push(metrics);
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }
  }

  private async collectBusinessMetrics(): Promise<void> {
    try {
      const [totalUsers, totalOrders, deliveredAgg] = await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.order.aggregate({
          _sum: { final_amount: true },
          where: { status: 'DELIVERED' },
        }),
      ]);

      const revenue = Number(deliveredAgg._sum.final_amount || 0);
      const avg = totalOrders > 0 ? revenue / totalOrders : 0;
      const conv = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

      this.recordBusinessMetrics({
        totalUsers,
        totalOrders,
        totalRevenue: revenue,
        averageOrderValue: avg,
        conversionRate: conv,
      });
    } catch (error) {
      this.logger.error('collectBusinessMetrics failed', error as any);
    }
  }

  private initializeSentry(): void {
    if (this.isProduction) {
      const sentryDsn = this.configService.get('SENTRY_DSN');
      if (sentryDsn) {
        Sentry.init({
          dsn: sentryDsn,
          environment: this.configService.get('NODE_ENV'),
          tracesSampleRate: 0.1,
          profilesSampleRate: 0.1,
        });
        this.logger.log('Sentry initialized successfully');
      }
    }
  }

  private initializeMetrics(): void {
    // Initialize business metrics
    this.businessMetrics.push({
      totalUsers: 0,
      totalOrders: 0,
      totalRevenue: 0,
      averageOrderValue: 0,
      conversionRate: 0,
      timestamp: new Date(),
    });
  }

  private startMetricsCollection(): void {
    // Collect performance metrics every 30 seconds
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 30000);

    // Collect business metrics every 5 minutes
    setInterval(() => {
      this.collectBusinessMetrics();
    }, 300000);
  }

  // Performance monitoring
  recordPerformanceMetric(responseTime: number): void {
    const metrics: PerformanceMetrics = {
      responseTime,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      timestamp: new Date(),
    };

    this.performanceMetrics.push(metrics);

    // Keep only last 1000 metrics to prevent memory leaks
    if (this.performanceMetrics.length > 1000) {
      this.performanceMetrics = this.performanceMetrics.slice(-1000);
    }

    // Alert if response time is too high
    if (responseTime > 5000) {
      this.logger.warn(`High response time detected: ${responseTime}ms`);
      this.captureException(new Error(`High response time: ${responseTime}ms`));
    }
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return this.performanceMetrics.slice(-100); // Return last 100 metrics
  }

  getAverageResponseTime(minutes: number = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentMetrics = this.performanceMetrics.filter(
      m => m.timestamp > cutoff
    );

    if (recentMetrics.length === 0) return 0;

    const total = recentMetrics.reduce((sum, m) => sum + m.responseTime, 0);
    return total / recentMetrics.length;
  }

  // Error monitoring
  recordError(error: Error, userId?: number, endpoint?: string): void {
    const errorMetric: ErrorMetrics = {
      errorType: error.constructor.name,
      message: error.message,
      stack: error.stack,
      userId,
      endpoint,
      timestamp: new Date(),
    };

    this.errorMetrics.push(errorMetric);

    // Keep only last 1000 errors
    if (this.errorMetrics.length > 1000) {
      this.errorMetrics = this.errorMetrics.slice(-1000);
    }

    // Send to external monitoring service
    this.captureException(error, { userId, endpoint });

    this.logger.error(`Error recorded: ${error.message}`, error.stack);
  }

  getErrorMetrics(): ErrorMetrics[] {
    return this.errorMetrics.slice(-100);
  }

  getErrorRate(minutes: number = 5): number {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const recentErrors = this.errorMetrics.filter(
      e => e.timestamp > cutoff
    );
    const recentRequests = this.performanceMetrics.filter(
      m => m.timestamp > cutoff
    );

    if (recentRequests.length === 0) return 0;
    return (recentErrors.length / recentRequests.length) * 100;
  }

  // Business metrics
  recordBusinessMetrics(metrics: Partial<BusinessMetrics>): void {
    const businessMetric: BusinessMetrics = {
      totalUsers: metrics.totalUsers || 0,
      totalOrders: metrics.totalOrders || 0,
      totalRevenue: metrics.totalRevenue || 0,
      averageOrderValue: metrics.averageOrderValue || 0,
      conversionRate: metrics.conversionRate || 0,
      timestamp: new Date(),
    };

    this.businessMetrics.push(businessMetric);

    // Keep only last 100 business metrics
    if (this.businessMetrics.length > 100) {
      this.businessMetrics = this.businessMetrics.slice(-100);
    }
  }

  getBusinessMetrics(): BusinessMetrics[] {
    return this.businessMetrics.slice(-10); // Return last 10 business metrics
  }

  // External service integration
  private captureException(error: Error, extra?: any): void {
    if (this.isProduction) {
      // Send to Sentry if available
      try {
        Sentry.captureException(error, { extra });
      } catch (sentryError) {
        this.logger.warn('Failed to send error to Sentry', sentryError);
      }
    }
  }

  // Health check
  getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'unhealthy';
    metrics: {
      averageResponseTime: number;
      errorRate: number;
      memoryUsage: number;
      uptime: number;
    };
  } {
    const avgResponseTime = this.getAverageResponseTime();
    const errorRate = this.getErrorRate();
    const memoryUsage = (process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100;
    const uptime = process.uptime();

    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (avgResponseTime > 2000 || errorRate > 5 || memoryUsage > 90) {
      status = 'degraded';
    }

    if (avgResponseTime > 5000 || errorRate > 15 || memoryUsage > 95) {
      status = 'unhealthy';
    }

    return {
      status,
      metrics: {
        averageResponseTime: avgResponseTime,
        errorRate,
        memoryUsage,
        uptime,
      },
    };
  }

  // Cleanup method
  cleanup(): void {
    this.performanceMetrics = [];
    this.errorMetrics = [];
    this.businessMetrics = [];
    this.metricsHistory.length = 0;
    this.appMetricsHistory.length = 0;
  }

  // --- Original System Monitoring Methods (adapted) ---

  private startMonitoring(): void {
    // Collect metrics every 30 seconds
    setInterval(() => {
      this.collectSystemMetrics();
      this.collectApplicationMetrics();
    }, 30000);

    // Clean old metrics every hour
    setInterval(() => {
      this.cleanOldMetrics();
    }, 3600000);

    this.logger.log('Monitoring service started');
  }

  private async collectSystemMetrics(): Promise<void> {
    try {
      const metrics: SystemMetrics = {
        timestamp: new Date(),
        cpu: {
          usage: await this.getCpuUsage(),
          loadAverage: os.loadavg(),
        },
        memory: this.getMemoryUsage(),
        disk: await this.getDiskUsage(),
        network: {
          connections: await this.getNetworkConnections(),
        },
      };

      this.metricsHistory.push(metrics);

      // Log critical metrics
      if (metrics.memory.percentage > 90) {
        this.logger.warn(`High memory usage: ${metrics.memory.percentage}%`);
        this.captureException(new Error(`High memory usage: ${metrics.memory.percentage}%`));
      }

      if (metrics.cpu.usage > 90) {
        this.logger.warn(`High CPU usage: ${metrics.cpu.usage}%`);
        this.captureException(new Error(`High CPU usage: ${metrics.cpu.usage}%`));
      }

      if (metrics.disk.percentage > 90) {
        this.logger.warn(`High disk usage: ${metrics.disk.percentage}%`);
        this.captureException(new Error(`High disk usage: ${metrics.disk.percentage}%`));
      }
    } catch (error) {
      this.logger.error('Error collecting system metrics:', error);
      this.recordError(error as Error, undefined, 'collectSystemMetrics');
    }
  }

  private async collectApplicationMetrics(): Promise<void> {
    try {
      const metrics: ApplicationMetrics = {
        timestamp: new Date(),
        database: await this.getDatabaseMetrics(),
        api: await this.getApiMetrics(),
        users: await this.getUserMetrics(),
        orders: await this.getOrderMetrics(),
      };

      this.appMetricsHistory.push(metrics);

      // Log application alerts
      if (metrics.database.slowQueries > 10) {
        this.logger.warn(`High number of slow queries: ${metrics.database.slowQueries}`);
        this.captureException(new Error(`High number of slow queries: ${metrics.database.slowQueries}`));
      }

      if (metrics.api.errors > 50) {
        this.logger.warn(`High API error rate: ${metrics.api.errors}`);
        this.captureException(new Error(`High API error rate: ${metrics.api.errors}`));
      }
    } catch (error) {
      this.logger.error('Error collecting application metrics:', error);
      this.recordError(error as Error, undefined, 'collectApplicationMetrics');
    }
  }

  // Get CPU usage
  private getCpuUsage(): Promise<number> {
    return new Promise((resolve) => {
      const startMeasure = this.cpuAverage();

      setTimeout(() => {
        const endMeasure = this.cpuAverage();
        const idleDifference = endMeasure.idle - startMeasure.idle;
        const totalDifference = endMeasure.total - startMeasure.total;
        const percentageCPU = 100 - ~~((10000 * idleDifference) / totalDifference);
        resolve(percentageCPU);
      }, 1000);
    });
  }

  private cpuAverage() {
    const cpus = os.cpus();
    let user = 0, nice = 0, sys = 0, idle = 0, irq = 0;

    for (const cpu of cpus) {
      user += cpu.times.user;
      nice += cpu.times.nice;
      sys += cpu.times.sys;
      idle += cpu.times.idle;
      irq += cpu.times.irq;
    }

    const total = user + nice + sys + idle + irq;
    return { idle, total };
  }

  // Get memory usage
  private getMemoryUsage() {
    const total = os.totalmem();
    const free = os.freemem();
    const used = total - free;
    const percentage = Math.round((used / total) * 100);

    return {
      total: Math.round(total / 1024 / 1024), // MB
      used: Math.round(used / 1024 / 1024), // MB
      free: Math.round(free / 1024 / 1024), // MB
      percentage,
    };
  }

  // Get disk usage
  private async getDiskUsage(): Promise<{ total: number; used: number; free: number; percentage: number }> {
    try {
      const stats = fs.statSync(process.cwd());
      const diskInfo = await fs.promises.stat(process.cwd());
      const totalDiskSpace = diskInfo.size; // This is the size of the file, not the disk. Need a different approach.

      // Mock implementation for disk usage
      const total = 100000; // 100GB mock
      const used = 50000;   // 50GB mock
      const free = 50000;   // 50GB mock
      const percentage = 50;

      return {
        total,
        used,
        free,
        percentage,
      };
    } catch (error) {
      this.logger.error('Error getting disk usage:', error);
      return {
        total: 0,
        used: 0,
        free: 0,
        percentage: 0,
      };
    }
  }

  // Get network connections
  private async getNetworkConnections(): Promise<number> {
    // Mock implementation - in production, use netstat or similar
    return Math.floor(Math.random() * 100) + 10;
  }

  // Get database metrics
  private async getDatabaseMetrics() {
    try {
      // Get active connections (mock for now)
      const connections = 10; // Mock value

      // Count recent queries (mock)
      const queries = Math.floor(Math.random() * 1000) + 100;
      const slowQueries = Math.floor(Math.random() * 10);

      return {
        connections,
        queries,
        slowQueries,
      };
    } catch (error) {
      this.logger.error('Error getting database metrics:', error);
      this.recordError(error as Error, undefined, 'getDatabaseMetrics');
      return {
        connections: 0,
        queries: 0,
        slowQueries: 0,
      };
    }
  }

  // Get API metrics
  private async getApiMetrics() {
    // Mock implementation - in production, integrate with actual metrics
    try {
      const requests = Math.floor(Math.random() * 1000) + 100;
      const errors = Math.floor(Math.random() * 50);
      const responseTime = Math.floor(Math.random() * 500) + 50; // ms
      this.recordPerformanceMetric(responseTime); // Record API response time
      return {
        requests,
        errors,
        responseTime,
      };
    } catch (error) {
      this.logger.error('Error getting API metrics:', error);
      this.recordError(error as Error, undefined, 'getApiMetrics');
      return {
        requests: 0,
        errors: 0,
        responseTime: 0,
      };
    }
  }

  // Get user metrics
  private async getUserMetrics() {
    try {
      const totalUsers = await this.prisma.user.count();
      const activeUsers = await this.prisma.user.count({
        where: {
          last_online: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return {
        active: activeUsers,
        online: Math.floor(activeUsers * 0.1), // Mock: 10% of active users are online
        registered: totalUsers,
      };
    } catch (error) {
      this.logger.error('Error getting user metrics:', error);
      this.recordError(error as Error, undefined, 'getUserMetrics');
      return {
        active: 0,
        online: 0,
        registered: 0,
      };
    }
  }

  // Get order metrics
  private async getOrderMetrics() {
    try {
      const totalOrders = await this.prisma.order.count();
      const pendingOrders = await this.prisma.order.count({
        where: { status: 'PENDING' },
      });
      const completedOrders = await this.prisma.order.count({
        where: { status: 'DELIVERED' },
      });

      // Update business metrics
      const totalRevenue = await this.prisma.order.aggregate({
        _sum: { final_amount: true },
        where: { status: 'DELIVERED' },
      });
      const totalUsers = await this.prisma.user.count();
      const averageOrderValue = totalOrders > 0 ? (Number(totalRevenue._sum.final_amount || 0) / totalOrders) : 0;
      const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0;

      this.recordBusinessMetrics({
        totalUsers,
        totalOrders,
        totalRevenue: Number(totalRevenue._sum.final_amount || 0),
        averageOrderValue,
        conversionRate,
      });

      return {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      };
    } catch (error) {
      this.logger.error('Error getting order metrics:', error);
      this.recordError(error as Error, undefined, 'getOrderMetrics');
      return {
        total: 0,
        pending: 0,
        completed: 0,
      };
    }
  }

  // Clean old metrics
  private cleanOldMetrics(): void {
    if (this.metricsHistory.length > this.maxHistorySize) {
      this.metricsHistory.splice(0, this.metricsHistory.length - this.maxHistorySize);
    }

    if (this.appMetricsHistory.length > this.maxHistorySize) {
      this.appMetricsHistory.splice(0, this.appMetricsHistory.length - this.maxHistorySize);
    }
  }

  // Get current system status
  async getSystemStatus() {
    const latestMetrics = this.metricsHistory.length > 0 ? this.metricsHistory[this.metricsHistory.length - 1] : null;
    const latestAppMetrics = this.appMetricsHistory.length > 0 ? this.appMetricsHistory[this.appMetricsHistory.length - 1] : null;

    return {
      status: 'OK',
      timestamp: new Date(),
      system: latestMetrics,
      application: latestAppMetrics,
      uptime: process.uptime(),
      version: this.configService.get('APP_VERSION', '1.0.0'),
      environment: this.configService.get('NODE_ENV', 'development'),
    };
  }

  // Get metrics history
  getMetricsHistory(limit: number = 100) {
    return {
      system: this.metricsHistory.slice(-limit),
      application: this.appMetricsHistory.slice(-limit),
    };
  }

  // Health check
  async healthCheck() {
    try {
      // Check database connection
      await this.prisma.$queryRaw`SELECT 1`;

      // Check system resources
      const memory = this.getMemoryUsage();
      const cpuUsage = await this.getCpuUsage();

      const isHealthy = memory.percentage < 95 && cpuUsage < 95;

      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        timestamp: new Date(),
        checks: {
          database: 'connected',
          memory: `${memory.percentage}%`,
          cpu: `${cpuUsage}%`,
        },
      };
    } catch (error) {
      this.logger.error('Health check failed:', error);
      this.recordError(error as Error, undefined, 'healthCheck');
      return {
        status: 'unhealthy',
        timestamp: new Date(),
        error: error.message,
      };
    }
  }

  // Log custom event
  logEvent(event: string, data?: any): void {
    this.logger.log(`Event: ${event}`, data);
  }

  // Log error with context
  logError(error: Error, context?: any): void {
    this.logger.error(`Error: ${error.message}`, error.stack, context);
    this.recordError(error, undefined, context as string);
  }

  // Log performance metric
  logPerformance(operation: string, duration: number, metadata?: any): void {
    this.logger.log(`Performance: ${operation} took ${duration}ms`, metadata);
    this.recordPerformanceMetric(duration);

    // Alert on slow operations
    if (duration > 5000) { // 5 seconds
      this.logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
      this.captureException(new Error(`Slow operation: ${operation} took ${duration}ms`), metadata);
    }
  }
}