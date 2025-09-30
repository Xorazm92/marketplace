// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as zlib from 'zlib';

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
export class CacheStrategyService {
  private readonly logger = new Logger(CacheStrategyService.name);
  private readonly metrics = new Map<string, CacheMetrics>();

  // Cache layers
  private readonly LAYERS = {
    L1_HOT: 60,        // 1 minute - Hot data
    L2_WARM: 300,      // 5 minutes - Warm data
    L3_COLD: 3600,     // 1 hour - Cold data
    L4_PERSISTENT: 86400, // 24 hours - Persistent
  };

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

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
    await this.setWithMetrics('L2', key, value, { ttl, compression: true, tags: ['products'] });
  }

  // L3 Cache: Cold data (search results, analytics)
  async getL3(key: string): Promise<any> {
    return this.getWithMetrics('L3', key);
  }

  async setL3(key: string, value: any, ttl = this.LAYERS.L3_COLD): Promise<void> {
    await this.setWithMetrics('L3', key, value, { ttl, compression: true, tags: ['search', 'analytics'] });
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
      const cached = await this.redisService.get(fullKey);
      if (cached) {
        this.incrementMetric(layer, 'hits');
        
        // Check if compressed
        if (cached.startsWith('gz:')) {
          const decompressed = await this.decompress(cached.slice(3));
          return JSON.parse(decompressed);
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
        serialized = 'gz:' + await this.compress(serialized);
      }
      
      await this.redisService.setex(fullKey, config.ttl, serialized);
      
      // Add tags for cache invalidation
      if (config.tags) {
        for (const tag of config.tags) {
          await this.redisService.sadd(`tag:${tag}`, fullKey);
        }
      }
      
    } catch (error) {
      this.logger.error(`Cache set error [${layer}:${key}]:`, error);
    }
  }

  // Cache invalidation by tags
  async invalidateByTag(tag: string): Promise<void> {
    const keys = await this.redisService.smembers(`tag:${tag}`);
    if (keys.length > 0) {
      await this.redisService.del(...keys);
      await this.redisService.del(`tag:${tag}`);
      this.logger.log(`Invalidated ${keys.length} cache entries for tag: ${tag}`);
    }
  }

  // Cache warming for popular products
  async warmPopularProducts(limit = 100): Promise<void> {
    const popularProducts = await // @ts-ignore
    this.prisma.product.findMany({
      where: { is_active: true },
      orderBy: [
        { view_count: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      include: {
        category: true,
        brand: {
          select: { id: true, name: true },
        },
        product_image: {
          where: { is_primary: true },
          take: 1,
        },
      },
    });

    for (const product of popularProducts) {
      await this.setL2(`product:${product.id}`, product, 300);
    }

    this.logger.log(`Warmed cache for ${popularProducts.length} popular products`);
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

  // Cache metrics
  async getMetrics(): Promise<Record<string, CacheMetrics>> {
    const metrics: Record<string, CacheMetrics> = {};
    
    for (const [layer, data] of this.metrics.entries()) {
      metrics[layer] = data;
    }
    
    return metrics;
  }

  // Cache memory management
  async cleanup(): Promise<void> {
    const patterns = ['L1:*', 'L2:*', 'L3:*'];
    
    for (const pattern of patterns) {
      const keys = await this.redisService.keys(pattern);
      if (keys.length > 10000) {
        // LRU eviction for memory management
        const keysToDelete = keys.slice(0, keys.length - 5000);
        if (keysToDelete.length > 0) {
          await this.redisService.del(...keysToDelete);
        }
      }
    }
  }

  private async compress(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer.toString('base64'));
      });
    });
  }

  private async decompress(data: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const buffer = Buffer.from(data, 'base64');
      zlib.gunzip(buffer, (err, result) => {
        if (err) reject(err);
        else resolve(result.toString());
      });
    });
  }

  private incrementMetric(layer: string, metric: keyof CacheMetrics): void {
    if (!this.metrics.has(layer)) {
      this.metrics.set(layer, { hits: 0, misses: 0, evictions: 0, memory: 0 });
    }
    
    const layerMetrics = this.metrics.get(layer)!;
    layerMetrics[metric]++;
  }
}
