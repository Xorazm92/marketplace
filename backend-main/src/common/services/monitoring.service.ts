import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

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

@Injectable()
export class MonitoringService {
  private readonly logger = new Logger(MonitoringService.name);
  private readonly metricsHistory: SystemMetrics[] = [];
  private readonly appMetricsHistory: ApplicationMetrics[] = [];
  private readonly maxHistorySize = 1000; // Keep last 1000 metrics

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Start monitoring if enabled
    if (this.configService.get('ENABLE_MONITORING', 'true') === 'true') {
      this.startMonitoring();
    }
  }

  // Start monitoring process
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

  // Collect system metrics
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
      }

      if (metrics.cpu.usage > 90) {
        this.logger.warn(`High CPU usage: ${metrics.cpu.usage}%`);
      }

      if (metrics.disk.percentage > 90) {
        this.logger.warn(`High disk usage: ${metrics.disk.percentage}%`);
      }
    } catch (error) {
      this.logger.error('Error collecting system metrics:', error);
    }
  }

  // Collect application metrics
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
      }

      if (metrics.api.errors > 50) {
        this.logger.warn(`High API error rate: ${metrics.api.errors}`);
      }
    } catch (error) {
      this.logger.error('Error collecting application metrics:', error);
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
        const percentageCPU = 100 - ~~(100 * idleDifference / totalDifference);
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
  private async getDiskUsage() {
    try {
      const stats = fs.statSync(process.cwd());
      // This is a simplified version - in production, use a proper disk usage library
      return {
        total: 100000, // 100GB mock
        used: 50000,   // 50GB mock
        free: 50000,   // 50GB mock
        percentage: 50,
      };
    } catch (error) {
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
    return {
      requests: Math.floor(Math.random() * 1000) + 100,
      errors: Math.floor(Math.random() * 50),
      responseTime: Math.floor(Math.random() * 500) + 50, // ms
    };
  }

  // Get user metrics
  private async getUserMetrics() {
    try {
      const totalUsers = await this.prisma.user.count();
      const activeUsers = await this.prisma.user.count({
        where: {
          last_login: {
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
        where: { status: 'COMPLETED' },
      });

      return {
        total: totalOrders,
        pending: pendingOrders,
        completed: completedOrders,
      };
    } catch (error) {
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
    const latestMetrics = this.metricsHistory[this.metricsHistory.length - 1];
    const latestAppMetrics = this.appMetricsHistory[this.appMetricsHistory.length - 1];

    return {
      status: 'OK',
      timestamp: new Date(),
      system: latestMetrics || null,
      application: latestAppMetrics || null,
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
  }

  // Log performance metric
  logPerformance(operation: string, duration: number, metadata?: any): void {
    this.logger.log(`Performance: ${operation} took ${duration}ms`, metadata);
    
    // Alert on slow operations
    if (duration > 5000) { // 5 seconds
      this.logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
    }
  }
}