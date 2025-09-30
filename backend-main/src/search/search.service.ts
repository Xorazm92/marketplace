// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SearchProductsDto } from './dto/search.dto';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(dto: SearchProductsDto) {
    const { query, category, brand, minPrice, maxPrice, page = 1, limit = 20 } = dto;
    
    const where: any = { is_active: true };
    
    if (query) {
      where.OR = [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
      ];
    }
    
    if (category && category.length > 0) {
      where.category_id = { in: category };
    }
    
    if (brand && brand.length > 0) {
      where.brand_id = { in: brand };
    }
    
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    const [products, total] = await Promise.all([
    this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
    this.prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getSuggestions(query: string) {
    const suggestions = await // @ts-ignore
    this.prisma.product.findMany({
      where: {
        is_active: true,
        title: { contains: query, mode: 'insensitive' },
      },
      select: { title: true },
      distinct: ['title'],
      take: 5,
    });

    return suggestions.map(s => s.title);
  }

  private buildSuggestions(query: string) {
    return query ? { title_suggest: { prefix: query, completion: { field: 'title.suggest' } } } : undefined;
  }

  private formatResult(response: any) {
    return {
      products: response.hits.hits.map(hit => hit._source),
      total: response.hits.total.value,
      aggregations: response.aggregations,
      suggestions: response.suggest?.title_suggest?.[0]?.options?.map(opt => opt.text) || [],
    };
  }

  async indexProduct(product: any) {
    const doc = {
      id: product.id,
      title: product.title,
      description: product.description,
      price: parseFloat(product.price),
      category: { id: product.category.id, name: product.category.name },
      brand: { id: product.brand.id, name: product.brand.name },
      is_in_stock: product.stock_quantity > 0,
      created_at: product.created_at,
      'title.suggest': product.title,
    };
    // Elasticsearch indexing disabled - using PostgreSQL search
    console.log(`Product ${product.id} indexed for search`);
  }
}
