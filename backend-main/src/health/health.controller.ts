
import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { 
  HealthCheck, 
  HealthCheckService, 
  HealthCheckResult,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('🏥 Health')
@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check (unversioned -> /api/health)' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 
      }),
      async () => {
        try {
          await this.prisma.$queryRaw`SELECT 1`;
          return { database: { status: 'up' } };
        } catch (error) {
          throw new Error('Database connection failed');
        }
      }
    ]);
  }

  @Get('health')
  @ApiOperation({ summary: 'API health check (versioned -> /api/v1/health)' })
  @ApiResponse({ status: 200, description: 'API is healthy' })
  // Versioned endpoint: available at /api/v1/health due to URI versioning
  @Version('1')
  checkApi() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'INBOLA Backend API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    };
  }

  // Keep detailed status under a simple non-prefixed path that will become /api/status
  @Get('status')
  @ApiOperation({ summary: 'Simple status check' })
  @ApiResponse({ status: 200, description: 'Service status' })
  getStatus() {
    return {
      status: 'healthy',
      message: 'INBOLA backend is running successfully'
    };
  }
}
