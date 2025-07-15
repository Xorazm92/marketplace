import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface CacheEntry {
  data: any;
  expiry: number;
  createdAt: number;
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private cache = new Map<string, CacheEntry>();
  private readonly defaultTTL: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultTTL = this.configService.get<number>('CACHE_TTL') || 3600; // 1 hour default
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    this.logger.debug(`Cache hit for key: ${key}`);
    return entry.data as T;
  }

  async set(key: string, data: any, ttlSeconds?: number): Promise<void> {
    const ttl = ttlSeconds || this.defaultTTL;
    const expiry = Date.now() + (ttl * 1000);
    
    this.cache.set(key, {
      data,
      expiry,
      createdAt: Date.now(),
    });

    this.logger.debug(`Cache set for key: ${key}, TTL: ${ttl}s`);
  }

  async del(key: string): Promise<void> {
    const deleted = this.cache.delete(key);
    if (deleted) {
      this.logger.debug(`Cache deleted for key: ${key}`);
    }
  }

  async clear(): Promise<void> {
    this.cache.clear();
    this.logger.log('Cache cleared');
  }

  async has(key: string): Promise<boolean> {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds?: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    
    if (cached !== null) {
      return cached;
    }

    this.logger.debug(`Cache miss for key: ${key}, executing factory function`);
    const data = await factory();
    await this.set(key, data, ttlSeconds);
    
    return data;
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const regex = new RegExp(pattern);
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
    
    if (keysToDelete.length > 0) {
      this.logger.debug(`Invalidated ${keysToDelete.length} cache entries matching pattern: ${pattern}`);
    }
  }

  private cleanup(): void {
    const now = Date.now();
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.logger.debug(`Cleaned up ${deletedCount} expired cache entries`);
    }
  }

  getStats(): {
    size: number;
    memoryUsage: string;
    hitRate: number;
  } {
    const size = this.cache.size;
    const memoryUsage = `${Math.round(JSON.stringify([...this.cache.entries()]).length / 1024)} KB`;
    
    return {
      size,
      memoryUsage,
      hitRate: 0, // Would need to track hits/misses for accurate calculation
    };
  }

  // Specific cache methods for common use cases
  async cacheProduct(productId: number, product: any, ttl = 1800): Promise<void> {
    await this.set(`product:${productId}`, product, ttl);
  }

  async getCachedProduct(productId: number): Promise<any> {
    return this.get(`product:${productId}`);
  }

  async invalidateProduct(productId: number): Promise<void> {
    await this.del(`product:${productId}`);
    await this.invalidatePattern(`products:.*`); // Invalidate product lists
  }

  async cacheProductList(key: string, products: any[], ttl = 600): Promise<void> {
    await this.set(`products:${key}`, products, ttl);
  }

  async getCachedProductList(key: string): Promise<any[]> {
    return this.get(`products:${key}`);
  }

  async cacheUser(userId: number, user: any, ttl = 1800): Promise<void> {
    await this.set(`user:${userId}`, user, ttl);
  }

  async getCachedUser(userId: number): Promise<any> {
    return this.get(`user:${userId}`);
  }

  async invalidateUser(userId: number): Promise<void> {
    await this.del(`user:${userId}`);
  }

  async cacheCategory(categoryId: number, category: any, ttl = 3600): Promise<void> {
    await this.set(`category:${categoryId}`, category, ttl);
  }

  async getCachedCategory(categoryId: number): Promise<any> {
    return this.get(`category:${categoryId}`);
  }

  async cacheCategoryList(categories: any[], ttl = 3600): Promise<void> {
    await this.set('categories:all', categories, ttl);
  }

  async getCachedCategoryList(): Promise<any[]> {
    return this.get('categories:all');
  }

  async invalidateCategories(): Promise<void> {
    await this.invalidatePattern('category:.*');
    await this.del('categories:all');
  }
}
