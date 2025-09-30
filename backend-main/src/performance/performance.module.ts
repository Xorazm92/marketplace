// @ts-nocheck
import { Module } from '@nestjs/common';
import { CacheStrategyService } from './cache-strategy.service';
import { QueryOptimizerService } from './query-optimizer.service';
import { CDNOptimizerService } from './cdn-optimizer.service';
import { LoadBalancerService } from './load-balancer.service';
import { PerformanceMonitorService } from './performance-monitor.service';
import { RedisModule } from '../redis/redis.module';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [RedisModule],
  providers: [
    CacheStrategyService,
    QueryOptimizerService,
    CDNOptimizerService,
    LoadBalancerService,
    PerformanceMonitorService,
    PrismaService,
    ConfigService,
  ],
  exports: [
    CacheStrategyService,
    QueryOptimizerService,
    CDNOptimizerService,
    LoadBalancerService,
    PerformanceMonitorService,
  ],
})
export class PerformanceModule {}
