// @ts-nocheck
import { IsOptional, IsString, IsArray, IsNumber, IsBoolean, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchProductsDto {
  @ApiProperty({ description: 'Search query', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ description: 'Category IDs to filter by', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  category?: string[];

  @ApiProperty({ description: 'Brand IDs to filter by', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  brand?: string[];

  @ApiProperty({ description: 'Minimum price', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ description: 'Maximum price', required: false, minimum: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ description: 'Filter by stock availability', required: false })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiProperty({ description: 'Age group IDs to filter by', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  ageGroup?: string[];

  @ApiProperty({ description: 'Product conditions to filter by', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  condition?: string[];

  @ApiProperty({ description: 'Minimum rating', required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiProperty({ description: 'Sort field and order', required: false, example: 'price:asc' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiProperty({ description: 'Page number', required: false, minimum: 1, default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', required: false, minimum: 1, maximum: 100, default: 20 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({ description: 'User ID for personalized results', required: false })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiProperty({ description: 'Geo-location for nearby products', required: false })
  @IsOptional()
  geoLocation?: {
    lat: number;
    lng: number;
    radius: number;
  };
}

export class SearchSuggestionsDto {
  @ApiProperty({ description: 'Search query for suggestions', required: true })
  @IsString()
  query: string;

  @ApiProperty({ description: 'Maximum number of suggestions', required: false, minimum: 1, maximum: 10, default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  limit?: number = 5;
}

export class SearchResponseDto {
  @ApiProperty({ description: 'Search results' })
  products: any[];

  @ApiProperty({ description: 'Total number of results' })
  total: number;

  @ApiProperty({ description: 'Faceted search aggregations' })
  aggregations: {
    categories: { id: string; name: string; count: number }[];
    brands: { id: string; name: string; count: number }[];
    priceRange: { min: number; max: number };
    ageGroups: { id: string; name: string; count: number }[];
    conditions: { key: string; count: number }[];
  };

  @ApiProperty({ description: 'Search suggestions' })
  suggestions: string[];

  @ApiProperty({ description: 'Pagination information' })
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  };

  @ApiProperty({ description: 'Search metadata' })
  searchMeta: {
    query: string;
    took: number;
    searchEngine: 'elasticsearch' | 'postgres';
  };
}
