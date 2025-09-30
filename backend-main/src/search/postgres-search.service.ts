// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

interface PostgresSearchQuery {
  query: string;
  filters?: {
    category?: string[];
    brand?: string[];
    priceRange?: [number, number];
    inStock?: boolean;
    ageGroup?: string[];
    condition?: string[];
    rating?: number;
  };
  sort?: {
    field: 'price' | 'created_at' | 'rating' | 'relevance';
    order: 'asc' | 'desc';
  };
  pagination: {
    page: number;
    limit: number;
  };
}

@Injectable()
export class PostgresSearchService {
  constructor(private readonly prisma: PrismaService) {}

  async searchProducts(query: PostgresSearchQuery) {
    const { query: searchQuery, filters, sort, pagination } = query;
    
    const where: Prisma.ProductWhereInput = {
      AND: [
        { is_active: true },
        this.buildTextSearch(searchQuery),
        this.buildFilters(filters),
      ].filter(Boolean),
    };

    const [products, total] = await Promise.all([
    this.prisma.product.findMany({
        where,
        include: {
          category: true,
          brand: true,
          age_group: true,
          seller: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
            },
          },
          images: {
            where: { is_primary: true },
            take: 1,
          },
          reviews: {
            select: {
              rating: true,
            },
          },
        },
        orderBy: this.buildOrderBy(sort),
        skip: (pagination.page - 1) * pagination.limit,
        take: pagination.limit,
      }),
    this.prisma.product.count({ where }),
    ]);

    const aggregations = await this.getAggregations(filters);

    return {
      products,
      total,
      aggregations,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  private buildTextSearch(query: string): Prisma.ProductWhereInput {
    if (!query?.trim()) return {};

    return {
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { search_keywords: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query] } },
        { category: { name: { contains: query, mode: 'insensitive' } } },
        { brand: { name: { contains: query, mode: 'insensitive' } } },
      ],
    };
  }

  private buildFilters(filters?: any): Prisma.ProductWhereInput {
    if (!filters) return {};

    const where: Prisma.ProductWhereInput = {};

    if (filters.category?.length) {
      where.category_id = { in: filters.category };
    }

    if (filters.brand?.length) {
      where.brand_id = { in: filters.brand };
    }

    if (filters.priceRange) {
      where.price = {
        gte: filters.priceRange[0],
        lte: filters.priceRange[1],
      };
    }

    if (filters.inStock !== undefined) {
      where.stock_quantity = filters.inStock ? { gt: 0 } : { lte: 0 };
    }

    if (filters.ageGroup?.length) {
      where.age_group_id = { in: filters.ageGroup };
    }

    if (filters.condition?.length) {
      where.condition = { in: filters.condition };
    }

    if (filters.rating) {
      where.reviews = {
        some: {
          rating: { gte: filters.rating },
        },
      };
    }

    return where;
  }

  private buildOrderBy(sort?: any): Prisma.ProductOrderByWithRelationInput {
    if (!sort) return { created_at: 'desc' };

    switch (sort.field) {
      case 'price':
        return { price: sort.order };
      case 'created_at':
        return { created_at: sort.order };
      case 'rating':
        return { reviews: { _count: sort.order } };
      default:
        return { created_at: 'desc' };
    }
  }

  private async getAggregations(filters?: any) {
    const baseWhere = this.buildFilters(filters);

    const [
      categories,
      brands,
      priceRange,
      ageGroups,
      conditions,
    ] = await Promise.all([
    this.prisma.category.findMany({
        where: { products: { some: baseWhere } },
        select: { id: true, name: true, _count: { select: { products: true } } },
      }),
    this.prisma.brand.findMany({
        where: { products: { some: baseWhere } },
        select: { id: true, name: true, _count: { select: { products: true } } },
      }),
    this.prisma.product.aggregate({
        where: baseWhere,
        _min: { price: true },
        _max: { price: true },
      }),
      this.prisma.ageGroup.findMany({
        where: { products: { some: baseWhere } },
        select: { id: true, name: true, _count: { select: { products: true } } },
      }),
    this.prisma.product.groupBy({
        by: ['condition'],
        where: baseWhere,
        _count: { id: true },
      }),
    ]);

    return {
      categories: categories.map(c => ({ id: c.id, name: c.name, count: c._count.products })),
      brands: brands.map(b => ({ id: b.id, name: b.name, count: b._count.products })),
      priceRange: {
        min: priceRange._min.price || 0,
        max: priceRange._max.price || 0,
      },
      ageGroups: ageGroups.map(a => ({ id: a.id, name: a.name, count: a._count.products })),
      conditions: conditions.map(c => ({ key: c.condition, count: c._count.id })),
    };
  }

  async getSuggestions(query: string, limit = 5) {
    if (!query?.trim()) return [];

    const suggestions = await // @ts-ignore
    this.prisma.product.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { search_keywords: { contains: query, mode: 'insensitive' } },
        ],
        is_active: true,
      },
      select: { title: true },
      take: limit,
    });

    return suggestions.map(p => p.title);
  }

  async getPopularSearches(limit = 10) {
    // This would typically come from analytics
    const popularProducts = await // @ts-ignore
    this.prisma.product.findMany({
      where: { is_active: true },
      orderBy: [
        { is_featured: 'desc' },
        { created_at: 'desc' },
      ],
      select: { title: true },
      take: limit,
    });

    return popularProducts.map(p => p.title);
  }

  async getRecentSearches(userId?: string) {
    // This would typically come from Redis/user session
    return [];
  }

  async getSearchTrends() {
    const trending = await // @ts-ignore
    this.prisma.product.findMany({
      where: { is_active: true, is_bestseller: true },
      orderBy: { created_at: 'desc' },
      select: { title: true, category: { select: { name: true } } },
      take: 10,
    });

    return trending.map(p => ({
      title: p.title,
      category: p.category.name,
    }));
  }
}
