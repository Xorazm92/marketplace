// @ts-nocheck
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrometheusMetricsService } from './prometheus-metrics.service';
import { WinstonLoggerService } from './winston-logger.service';
import { SecurityMonitorService } from './security-monitor.service';
import { PrismaService } from '../core/prisma/prisma.service';
import { RedisCacheService } from '../performance/redis-cache.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    RedisCacheService,
    PrometheusMetricsService,
    WinstonLoggerService,
    SecurityMonitorService,
  ],
  exports: [
    PrometheusMetricsService,
    WinstonLoggerService,
    SecurityMonitorService,
  ],
})
export class MonitoringModule {}
