// @ts-nocheck
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisCacheService } from './redis-cache.service';
import { DatabaseOptimizerService } from './db-optimizer.service';
import { ImageOptimizerService } from './image-optimizer.service';
import { RateLimiterService } from './rate-limiter.service';
import { PerformanceDashboardService } from './performance-dashboard.service';
import { PrismaService } from '../core/prisma/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [
    PrismaService,
    RedisCacheService,
    DatabaseOptimizerService,
    ImageOptimizerService,
    RateLimiterService,
    PerformanceDashboardService,
  ],
  exports: [
    RedisCacheService,
    DatabaseOptimizerService,
    ImageOptimizerService,
    RateLimiterService,
    PerformanceDashboardService,
  ],
})
export class PerformanceProductionModule {}
