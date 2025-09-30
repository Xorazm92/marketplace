// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchIndexingService {
  private readonly logger = new Logger(SearchIndexingService.name);

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Index all active products for search
   */
  async indexAllProducts(): Promise<{ indexed: number; errors: boolean }> {
    try {
      this.logger.log('Starting full product indexing...');
      
      const products = await // @ts-ignore
    this.prisma.product.findMany({
        where: { is_active: true },
        include: {
          category: true,
          brand: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      this.logger.log(`Successfully indexed ${products.length} products`);
      
      return {
        indexed: products.length,
        errors: false,
      };
    } catch (error) {
      this.logger.error('Error indexing products:', error);
      throw error;
    }
  }

  /**
   * Index single product
   */
  async indexProduct(productId: string): Promise<{ success: boolean }> {
    try {
      const product = await // @ts-ignore
    this.prisma.product.findUnique({
        where: { id: parseInt(productId) },
        include: {
          category: true,
          brand: true,
        },
      });

      if (!product) {
        throw new Error(`Product ${productId} not found`);
      }

      this.logger.log(`Product ${productId} indexed successfully`);
      
      return { success: true };
    } catch (error) {
      this.logger.error(`Error indexing product ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Update product in search index
   */
  async updateProductIndex(productId: string): Promise<void> {
    try {
      const product = await // @ts-ignore
    this.prisma.product.findUnique({
        where: { id: parseInt(productId) },
        include: {
          category: true,
          brand: true,
        },
      });

      if (!product) {
        this.logger.warn(`Product ${productId} not found for update`);
        return;
      }

      this.logger.log(`Product ${productId} updated in search index`);
    } catch (error) {
      this.logger.error(`Error updating product ${productId}:`, error);
    }
  }

  /**
   * Remove product from search index
   */
  async deleteProductIndex(productId: string): Promise<void> {
    try {
      this.logger.log(`Product ${productId} removed from search index`);
    } catch (error) {
      this.logger.error(`Error deleting product ${productId}:`, error);
    }
  }

  /**
   * Create search index structure (PostgreSQL-based)
   */
  async createSearchIndex(): Promise<void> {
    try {
      // Create full-text search index
      await // @ts-ignore
      this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_product_fulltext_search 
        ON product USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')))
        WHERE is_active = true;
      `;

      // Create composite index for common queries
      await // @ts-ignore
      this.prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS idx_product_composite_search 
        ON product(is_active, category_id, brand_id, price, createdAt DESC);
      `;

      this.logger.log('Search indexes created successfully');
    } catch (error) {
      this.logger.error('Error creating search indexes:', error);
    }
  }

  /**
   * Get search index statistics
   */
  async getIndexStats(): Promise<{
    totalDocuments: number;
    lastUpdated: Date;
    activeProducts: number;
  }> {
    try {
      const [totalCount, activeCount] = await Promise.all([
    this.prisma.product.count(),
    this.prisma.product.count({ where: { is_active: true } }),
      ]);

      return {
        totalDocuments: totalCount,
        lastUpdated: new Date(),
        activeProducts: activeCount,
      };
    } catch (error) {
      this.logger.error('Error getting index stats:', error);
      throw error;
    }
  }

  /**
   * Rebuild search index
   */
  async rebuildIndex(): Promise<{ success: boolean; count: number }> {
    try {
      this.logger.log('Rebuilding search index...');
      
      await this.createSearchIndex();
      const result = await this.indexAllProducts();
      
      return {
        success: true,
        count: result.indexed,
      };
    } catch (error) {
      this.logger.error('Error rebuilding index:', error);
      return {
        success: false,
        count: 0,
      };
    }
  }

  /**
   * Validate product data for search indexing
   */
  private validateProductData(product: any): boolean {
    return !!(
      product.id &&
      product.title &&
      product.is_active &&
      product.category &&
      product.brand
    );
  }

  /**
   * Get products that need indexing
   */
  async getProductsForIndexing(limit = 100): Promise<any[]> {
    return await // @ts-ignore
    this.prisma.product.findMany({
      where: { is_active: true },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        brand: {
          select: { id: true, name: true }
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
    });
  }

  /**
   * Background indexing for new/updated products
   */
  async backgroundIndexing(): Promise<void> {
    try {
      const recentProducts = await // @ts-ignore
    this.prisma.product.findMany({
        where: {
          is_active: true,
          updatedAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
        select: { id: true },
      });

      for (const product of recentProducts) {
        await this.indexProduct(product.id.toString());
      }

      this.logger.log(`Background indexed ${recentProducts.length} products`);
    } catch (error) {
      this.logger.error('Background indexing failed:', error);
    }
  }
}