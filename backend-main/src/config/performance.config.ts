import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const performanceConfig = {
  // Cache configuration
  cache: CacheModule.registerAsync({
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => ({
      store: redisStore,
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
      password: configService.get('REDIS_PASSWORD'),
      ttl: 300, // 5 minutes default TTL
      max: 1000, // Maximum number of items in cache
      isGlobal: true,
    }),
    inject: [ConfigService],
  }),

  // Database connection pool
  database: {
    connectionLimit: 20,
    acquireTimeout: 60000,
    timeout: 60000,
    reconnect: true,
    reconnectTries: 3,
    reconnectInterval: 1000,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },

  // Compression
  compression: {
    level: 6,
    threshold: 1024,
    filter: (req: any, res: any) => {
      if (req.headers['x-no-compression']) {
        return false;
      }
      return true;
    },
  },

  // CORS optimized
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'Cache-Control',
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 86400, // 24 hours
  },

  // Helmet security with performance optimizations
  helmet: {
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  },
};

// Performance monitoring
export const performanceMetrics = {
  // Memory usage monitoring
  memoryThreshold: 0.8, // 80% of available memory
  
  // Response time monitoring
  responseTimeThreshold: 1000, // 1 second
  
  // Database query monitoring
  slowQueryThreshold: 500, // 500ms
  
  // Cache hit rate monitoring
  cacheHitRateThreshold: 0.8, // 80% hit rate
};

// Performance optimization utilities
export class PerformanceUtils {
  static async measureExecutionTime<T>(
    operation: () => Promise<T>,
    label: string,
  ): Promise<T> {
    const start = Date.now();
    try {
      const result = await operation();
      const duration = Date.now() - start;
      console.log(`[Performance] ${label}: ${duration}ms`);
      return result;
    } catch (error) {
      const duration = Date.now() - start;
      console.error(`[Performance] ${label} failed after ${duration}ms:`, error);
      throw error;
    }
  }

  static createCacheKey(prefix: string, ...parts: (string | number)[]): string {
    return `${prefix}:${parts.join(':')}`;
  }

  static isValidCacheKey(key: string): boolean {
    return key.length <= 250 && /^[a-zA-Z0-9:_-]+$/.test(key);
  }
}
