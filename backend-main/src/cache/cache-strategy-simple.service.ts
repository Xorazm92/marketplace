// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CacheStrategyService {
  private readonly logger = new Logger(CacheStrategyService.name);
  private readonly cache = new Map<string, any>();

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getL1(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async setL1(key: string, value: any, ttl = 60): Promise<void> {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttl * 1000);
  }

  async getL2(key: string): Promise<any> {
    return this.cache.get(key);
  }

  async setL2(key: string, value: any, ttl = 300): Promise<void> {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttl * 1000);
  }

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
          take: 1,
        },
      },
    });

    for (const product of popularProducts) {
      await this.setL2(`product:${product.id}`, product, 300);
    }

    this.logger.log(`Warmed cache for ${popularProducts.length} popular products`);
  }

  async getMetrics(): Promise<Record<string, any>> {
    return {
      cacheSize: this.cache.size,
    };
  }
}
