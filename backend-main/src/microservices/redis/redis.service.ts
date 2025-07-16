
import { Injectable, Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async get<T>(key: string): Promise<T | undefined> {
    return this.cacheManager.get<T>(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<void> {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string): Promise<void> {
    await this.cacheManager.del(key);
  }

  async reset(): Promise<void> {
    // Cache manager reset method might not be available in newer versions
    // Using del with wildcard pattern instead
    try {
      await this.cacheManager.del('*');
    } catch (error) {
      console.warn('Cache reset failed:', error);
    }
  }

  // Product-specific cache methods
  async cacheProduct(productId: number, product: any, ttl: number = 3600): Promise<void> {
    await this.set(`product:${productId}`, product, ttl);
  }

  async getCachedProduct(productId: number): Promise<any> {
    return this.get(`product:${productId}`);
  }

  async invalidateProductCache(productId: number): Promise<void> {
    await this.del(`product:${productId}`);
  }

  // Search cache
  async cacheSearchResults(query: string, results: any, ttl: number = 1800): Promise<void> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    await this.set(key, results, ttl);
  }

  async getCachedSearchResults(query: string): Promise<any> {
    const key = `search:${Buffer.from(query).toString('base64')}`;
    return this.get(key);
  }
}
