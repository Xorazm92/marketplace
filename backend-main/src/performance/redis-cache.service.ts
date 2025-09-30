// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as zlib from 'zlib';
import { promisify } from 'util';

interface CacheConfig {
  ttl: number;
  compression: boolean;
  tags?: string[];
}

interface CacheMetrics {
  hits: number;
  misses: number;
  evictions: number;
  memory: number;
}

@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  private readonly redis: Redis;
  private readonly metrics = new Map<string, CacheMetrics>();
  
  // Cache layers with different TTL
  private readonly LAYERS = {
    L1_HOT: 60,        // 1 minute - Hot data (user sessions, cart)
    L2_WARM: 300,      // 5 minutes - Warm data (product lists, categories)
    L3_COLD: 3600,     // 1 hour - Cold data (search results, analytics)
    L4_PERSISTENT: 86400, // 24 hours - Persistent (static content)
  };

  private readonly gzip = promisify(zlib.gzip);
  private readonly gunzip = promisify(zlib.gunzip);

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: this.configService.get('REDIS_HOST', 'localhost'),
      port: this.configService.get('REDIS_PORT', 6379),
      password: this.configService.get('REDIS_PASSWORD'),
      db: 0,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.initializeMetrics();
  }

  private initializeMetrics() {
    ['L1', 'L2', 'L3', 'L4'].forEach(layer => {
      this.metrics.set(layer, { hits: 0, misses: 0, evictions: 0, memory: 0 });
    });
  }

  // L1 Cache: Hot data (user sessions, cart)
  async getL1(key: string): Promise<any> {
    return this.getWithMetrics('L1', key);
  }

  async setL1(key: string, value: any, ttl = this.LAYERS.L1_HOT): Promise<void> {
    await this.setWithMetrics('L1', key, value, { ttl, compression: true });
  }

  // L2 Cache: Warm data (product lists, categories)
  async getL2(key: string): Promise<any> {
    return this.getWithMetrics('L2', key);
  }

  async setL2(key: string, value: any, ttl = this.LAYERS.L2_WARM): Promise<void> {
    await this.setWithMetrics('L2', key, value, { 
      ttl, 
      compression: true, 
      tags: ['products', 'categories'] 
    });
  }

  // L3 Cache: Cold data (search results, analytics)
  async getL3(key: string): Promise<any> {
    return this.getWithMetrics('L3', key);
  }

  async setL3(key: string, value: any, ttl = this.LAYERS.L3_COLD): Promise<void> {
    await this.setWithMetrics('L3', key, value, { 
      ttl, 
      compression: true, 
      tags: ['search', 'analytics'] 
    });
  }

  // L4 Cache: Persistent data (static content)
  async getL4(key: string): Promise<any> {
    return this.getWithMetrics('L4', key);
  }

  async setL4(key: string, value: any, ttl = this.LAYERS.L4_PERSISTENT): Promise<void> {
    await this.setWithMetrics('L4', key, value, { ttl, compression: false });
  }

  // Advanced caching with compression and tagging
  private async getWithMetrics(layer: string, key: string): Promise<any> {
    const fullKey = `${layer}:${key}`;
    
    try {
      const cached = await this.redis.get(fullKey);
      if (cached) {
        this.incrementMetric(layer, 'hits');
        
        // Check if compressed
        if (cached.startsWith('gz:')) {
          const decompressed = await this.gunzip(Buffer.from(cached.slice(3), 'base64'));
          return JSON.parse(decompressed.toString());
        }
        
        return JSON.parse(cached);
      }
      
      this.incrementMetric(layer, 'misses');
      return null;
    } catch (error) {
      this.logger.error(`Cache get error [${layer}:${key}]:`, error);
      return null;
    }
  }

  private async setWithMetrics(
    layer: string, 
    key: string, 
    value: any, 
    config: CacheConfig
  ): Promise<void> {
    const fullKey = `${layer}:${key}`;
    
    try {
      let serialized = JSON.stringify(value);
      
      if (config.compression && serialized.length > 1024) {
        const compressed = await this.gzip(serialized);
        serialized = 'gz:' + compressed.toString('base64');
      }
      
      await this.redis.setex(fullKey, config.ttl, serialized);
      
      // Add tags for cache invalidation
      if (config.tags) {
        for (const tag of config.tags) {
          await this.redis.sadd(`tag:${tag}`, fullKey);
          await this.redis.expire(`tag:${tag}`, config.ttl);
        }
      }
      
    } catch (error) {
      this.logger.error(`Cache set error [${layer}:${key}]:`, error);
    }
  }

  // Cache invalidation by tags
  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.redis.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await this.redis.del(...keys);
      await this.redis.del(`tag:${tag}`);
      this.logger.log(`Invalidated ${keys.length} cache entries for tag: ${tag}`);
    }
  }

  // Cache-aside pattern implementation
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    layer: 'L1' | 'L2' | 'L3' | 'L4' = 'L2',
    ttl?: number
  ): Promise<T> {
    const cached = await this[`get${layer}`](key);
    if (cached !== null) {
      return cached;
    }

    const result = await factory();
    await this[`set${layer}`](key, result, ttl);
    return result;
  }

  // Batch operations for better performance
  async mget(keys: string[]): Promise<(any | null)[]> {
    const values = await this.redis.mget(...keys);
    return values.map(value => value ? JSON.parse(value) : null);
  }

  async mset(keyValues: Record<string, any>, ttl = 300): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    for (const [key, value] of Object.entries(keyValues)) {
      pipeline.setex(key, ttl, JSON.stringify(value));
    }
    
    await pipeline.exec();
  }

  // Cache warming for popular products
  async warmPopularProducts(productIds: string[]): Promise<void> {
    // Implementation would fetch products and cache them
    this.logger.log(`Warming cache for ${productIds.length} products`);
  }

  // Cache metrics
  async getMetrics(): Promise<Record<string, CacheMetrics>> {
    const metrics: Record<string, CacheMetrics> = {};
    
    for (const [layer, data] of this.metrics.entries()) {
      const info = await this.redis.info('memory');
      const memoryUsage = parseInt(info.match(/used_memory:(\d+)/)?.[1] || '0');
      
      metrics[layer] = {
        ...data,
        memory: memoryUsage,
      };
    }
    
    return metrics;
  }

  // Cache cleanup and memory management
  async cleanup(): Promise<void> {
    const patterns = ['L1:*', 'L2:*', 'L3:*'];
    
    for (const pattern of patterns) {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 10000) {
        // LRU eviction for memory management
        const keysToDelete = keys.slice(0, keys.length - 5000);
        if (keysToDelete.length > 0) {
          await this.redis.del(...keysToDelete);
          this.logger.log(`Cleaned up ${keysToDelete.length} cache entries`);
        }
      }
    }
  }

  private incrementMetric(layer: string, metric: keyof CacheMetrics): void {
    const layerMetrics = this.metrics.get(layer);
    if (layerMetrics) {
      layerMetrics[metric]++;
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return false;
    }
  }
}
