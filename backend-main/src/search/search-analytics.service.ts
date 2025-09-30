// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

interface SearchEvent {
  query: string;
  userId?: string;
  sessionId?: string;
  resultsCount: number;
  filters: Record<string, any>;
  sort: string;
  page: number;
  responseTime: number;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

interface ClickEvent {
  query: string;
  productId: string;
  position: number;
  userId?: string;
  timestamp: Date;
}

@Injectable()
export class SearchAnalyticsService {
  private readonly analyticsKey = 'search_analytics';
  private readonly trendingKey = 'trending_searches';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async logSearch(event: SearchEvent) {
    // Store in Redis for real-time analytics
    await this.redis.zadd(
      `${this.analyticsKey}:searches`,
      Date.now(),
      JSON.stringify(event),
    );

    // Store in PostgreSQL for long-term analytics
    await this.prisma.search_analytics.create({
      data: {
        query: event.query,
        user_id: event.userId,
        session_id: event.sessionId,
        results_count: event.resultsCount,
        filters: event.filters,
        sort_order: event.sort,
        page_number: event.page,
        response_time_ms: event.responseTime,
        ip_address: event.ipAddress,
        user_agent: event.userAgent,
      },
    });

    // Update trending searches
    await this.updateTrendingSearches(event.query);
  }

  async logClick(event: ClickEvent) {
    await this.redis.zadd(
      `${this.analyticsKey}:clicks`,
      Date.now(),
      JSON.stringify(event),
    );

    await this.prisma.search_click.create({
      data: {
        query: event.query,
        product_id: event.productId,
        position: event.position,
        user_id: event.userId,
      },
    });
  }

  async getSearchInsights(timeRange: 'hour' | 'day' | 'week' | 'month') {
    const startDate = this.getStartDate(timeRange);
    
    const [
      topQueries,
      noResultsQueries,
      popularFilters,
      avgResponseTime,
      clickThroughRate,
    ] = await Promise.all([
      this.getTopQueries(startDate),
      this.getNoResultsQueries(startDate),
      this.getPopularFilters(startDate),
      this.getAverageResponseTime(startDate),
      this.getClickThroughRate(startDate),
    ]);

    return {
      topQueries,
      noResultsQueries,
      popularFilters,
      avgResponseTime,
      clickThroughRate,
      timeRange,
    };
  }

  async getTrendingSearches(limit = 10) {
    const trending = await this.redis.zrevrange(
      this.trendingKey,
      0,
      limit - 1,
      'WITHSCORES',
    );

    return trending.map(([query, score]) => ({
      query,
      count: parseInt(score),
    }));
  }

  async getSearchSuggestions(query: string) {
    // Get popular searches starting with query
    const suggestions = await this.prisma.search_analytics.findMany({
      where: {
        query: { startsWith: query },
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: { query: true },
      distinct: ['query'],
      orderBy: { query: 'asc' },
      take: 5,
    });

    return suggestions.map(s => s.query);
  }

  async getPersonalizedSuggestions(userId: string) {
    // Get user's recent searches and clicks
    const recentSearches = await this.prisma.search_analytics.findMany({
      where: {
        user_id: userId,
        timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { query: true },
      distinct: ['query'],
      orderBy: { timestamp: 'desc' },
      take: 10,
    });

    // Get products user clicked on
    const clickedProducts = await this.prisma.search_click.findMany({
      where: {
        user_id: userId,
        timestamp: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: {
        product: {
          select: {
            title: true,
            category: { select: { name: true } },
          },
        },
      },
      distinct: ['product_id'],
    });

    return {
      recentSearches: recentSearches.map(s => s.query),
      relatedCategories: [...new Set(clickedProducts.map(p => p.product.category.name))],
    };
  }

  async getSearchPerformance() {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
      totalSearches,
      avgResponseTime,
      zeroResults,
      clickRate,
    ] = await Promise.all([
      this.prisma.search_analytics.count({
        where: { timestamp: { gte: last24Hours } },
      }),
      this.prisma.search_analytics.aggregate({
        where: { timestamp: { gte: last24Hours } },
        _avg: { response_time_ms: true },
      }),
      this.prisma.search_analytics.count({
        where: {
          timestamp: { gte: last24Hours },
          results_count: 0,
        },
      }),
      this.calculateClickRate(last24Hours),
    ]);

    return {
      totalSearches,
      avgResponseTime: avgResponseTime._avg.response_time_ms || 0,
      zeroResults,
      zeroResultsRate: totalSearches > 0 ? (zeroResults / totalSearches) * 100 : 0,
      clickRate,
    };
  }

  async getPopularFilters() {
    const filters = await this.prisma.search_analytics.findMany({
      where: {
        timestamp: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        filters: { not: Prisma.JsonNull },
      },
      select: { filters: true },
    });

    const filterCounts: Record<string, Record<string, number>> = {};

    filters.forEach(({ filters }) => {
      Object.entries(filters as Record<string, any>).forEach(([key, value]) => {
        if (!filterCounts[key]) filterCounts[key] = {};
        if (Array.isArray(value)) {
          value.forEach(v => {
            filterCounts[key][v] = (filterCounts[key][v] || 0) + 1;
          });
        } else {
          filterCounts[key][value] = (filterCounts[key][value] || 0) + 1;
        }
      });
    });

    return filterCounts;
  }

  private async updateTrendingSearches(query: string) {
    await this.redis.zincrby(this.trendingKey, 1, query.toLowerCase());
    
    // Expire old entries after 7 days
    await this.redis.expire(this.trendingKey, 7 * 24 * 60 * 60);
  }

  private getStartDate(timeRange: string): Date {
    const now = new Date();
    switch (timeRange) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private async getTopQueries(startDate: Date) {
    return this.prisma.search_analytics.groupBy({
      by: ['query'],
      where: { timestamp: { gte: startDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  }

  private async getNoResultsQueries(startDate: Date) {
    return this.prisma.search_analytics.findMany({
      where: {
        timestamp: { gte: startDate },
        results_count: 0,
      },
      select: { query: true, _count: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  }

  private async getPopularFilters(startDate: Date) {
    return this.prisma.search_analytics.groupBy({
      by: ['filters'],
      where: { timestamp: { gte: startDate } },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 10,
    });
  }

  private async getAverageResponseTime(startDate: Date) {
    return this.prisma.search_analytics.aggregate({
      where: { timestamp: { gte: startDate } },
      _avg: { response_time_ms: true },
    });
  }

  private async getClickThroughRate(startDate: Date) {
    const searches = await this.prisma.search_analytics.count({
      where: { timestamp: { gte: startDate } },
    });

    const clicks = await this.prisma.search_click.count({
      where: { timestamp: { gte: startDate } },
    });

    return searches > 0 ? (clicks / searches) * 100 : 0;
  }

  private async calculateClickRate(date: Date) {
    const searches = await this.prisma.search_analytics.count({
      where: { timestamp: { gte: date } },
    });

    const clicks = await this.prisma.search_click.count({
      where: { timestamp: { gte: date } },
    });

    return searches > 0 ? (clicks / searches) * 100 : 0;
  }

  async cleanupOldAnalytics(daysToKeep = 90) {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);

    const [deletedSearches, deletedClicks] = await Promise.all([
      this.prisma.search_analytics.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
      this.prisma.search_click.deleteMany({
        where: { timestamp: { lt: cutoffDate } },
      }),
    ]);

    this.logger.log(`Cleaned up ${deletedSearches.count} search records and ${deletedClicks.count} click records`);
  }
}
