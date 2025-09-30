// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisCacheService } from './redis-cache.service';

interface QueryOptimization {
  query: string;
  params: any[];
  cacheKey: string;
  ttl: number;
  tags?: string[];
}

interface PaginationConfig {
  page: number;
  limit: number;
  maxLimit: number;
}

@Injectable()
export class DatabaseOptimizerService {
  private readonly logger = new Logger(DatabaseOptimizerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cacheService: RedisCacheService,
  ) {}

  // Optimized product queries with caching
  async getProductsOptimized(filters: any, pagination: PaginationConfig) {
    const { page, limit } = this.validatePagination(pagination);
    const cacheKey = `products:${JSON.stringify(filters)}:${page}:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => this.fetchProducts(filters, page, limit),
      'L2',
      300
    );
  }

  // Optimized search with query hints
  async searchProductsOptimized(query: string, filters: any, pagination: PaginationConfig) {
    const { page, limit } = this.validatePagination(pagination);
    const cacheKey = `search:${query}:${JSON.stringify(filters)}:${page}:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => this.performSearch(query, filters, page, limit),
      'L3',
      600
    );
  }

  // Database query optimization with indexes
  async getPopularProductsOptimized(limit: number = 20) {
    const cacheKey = `popular-products:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        return await // @ts-ignore
    this.prisma.product.findMany({
          where: { is_active: true },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            original_price: true,
            category: {
              select: { id: true, name: true, slug: true }
            },
            brand: {
              select: { id: true, name: true }
            },
            product_image: {
              take: 1,
              select: { url: true }
            },
          },
          orderBy: [
            { view_count: 'desc' },
            { createdAt: 'desc' }
          ],
          take: limit,
        });
      },
      'L2',
      300
    );
  }

  // Category-based caching with tags
  async getCategoryProductsOptimized(categoryId: string, pagination: PaginationConfig) {
    const { page, limit } = this.validatePagination(pagination);
    const cacheKey = `category-products:${categoryId}:${page}:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => this.fetchCategoryProducts(categoryId, page, limit),
      'L2',
      300
    );
  }

  // Advanced pagination with cursor-based approach
  async getProductsCursorOptimized(cursor?: string, limit = 20) {
    const cacheKey = `products-cursor:${cursor || 'start'}:${limit}`;

    return this.cacheService.getOrSet(
      cacheKey,
      async () => {
        const where = cursor ? { id: { gt: cursor } } : {};
        
        return await // @ts-ignore
    this.prisma.product.findMany({
          where: { ...where, is_active: true },
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            createdAt: true,
          },
          orderBy: { id: 'asc' },
          take: limit + 1, // +1 to check if there's more
        });
      },
      'L2',
      300
    );
  }

  // Database index recommendations and creation
  async createOptimizedIndexes() {
    try {
      // Product search indexes
      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_active_search 
        ON product(is_active, title) WHERE is_active = true;
      `;

      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_category_brand 
        ON product(category_id, brand_id) WHERE is_active = true;
      `;

      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_price_range 
        ON product(price) WHERE is_active = true;
      `;

      // Composite indexes for common queries
      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_composite 
        ON product(is_active, category_id, brand_id, price, "createdAt" DESC);
      `;

      // Full-text search index
      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_product_fulltext 
        ON product USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));
      `;

      // User activity indexes
      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_last_online 
        ON "user"(last_online DESC);
      `;

      // Order performance indexes
      await this.prisma.$executeRaw`
        CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_user_date 
        ON "order"(user_id, "createdAt" DESC);
      `;

      this.logger.log('Optimized database indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating optimized indexes:', error);
    }
  }

  // Query performance monitoring
  async monitorQueryPerformance() {
    try {
      const slowQueries = await this.prisma.$queryRaw`
        SELECT query, mean_exec_time, calls, total_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > 100
        ORDER BY mean_exec_time DESC
        LIMIT 10;
      `;

      this.logger.log('Slow queries detected:', slowQueries);
      return slowQueries;
    } catch (error) {
      this.logger.warn('Query monitoring not available (pg_stat_statements not enabled)');
      return [];
    }
  }

  // Connection pooling optimization
  async optimizeConnectionPool() {
    try {
      await this.prisma.$executeRaw`
        SET statement_timeout = '30s';
        SET lock_timeout = '5s';
        SET idle_in_transaction_session_timeout = '10s';
      `;

      this.logger.log('Connection pool optimized');
    } catch (error) {
      this.logger.error('Error optimizing connection pool:', error);
    }
  }

  // Batch operations for better performance
  async batchUpdateProducts(updates: any[]) {
    return await // @ts-ignore
    this.prisma.$transaction(
      updates.map(update => 
    this.prisma.product.update({
          where: { id: update.id },
          data: update.data,
        })
      )
    );
  }

  // Database statistics and health
  async getDatabaseStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples,
          seq_scan as sequential_scans,
          idx_scan as index_scans,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        WHERE schemaname = 'public'
        ORDER BY n_live_tup DESC;
      `;

      return stats;
    } catch (error) {
      this.logger.error('Error getting database stats:', error);
      return [];
    }
  }

  private validatePagination(pagination: PaginationConfig): PaginationConfig {
    const page = Math.max(1, pagination.page || 1);
    const limit = Math.min(pagination.limit || 20, pagination.maxLimit || 100);
    
    return { page, limit, maxLimit: pagination.maxLimit || 100 };
  }

  private async fetchProducts(filters: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    return await // @ts-ignore
    this.prisma.product.findMany({
      where: { ...filters, is_active: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true }
        },
        product_image: {
          take: 1,
          select: { url: true }
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }

  private async performSearch(query: string, filters: any, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    return await // @ts-ignore
    this.prisma.product.findMany({
      where: {
        ...filters,
        is_active: true,
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true }
        },
        product_image: {
          take: 1,
          select: { url: true }
        },
      },
      orderBy: [
        { view_count: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    });
  }

  private async fetchCategoryProducts(categoryId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;
    
    return await // @ts-ignore
    this.prisma.product.findMany({
      where: { category_id: parseInt(categoryId), is_active: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true }
        },
        product_image: {
          take: 1,
          select: { url: true }
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    });
  }
}
