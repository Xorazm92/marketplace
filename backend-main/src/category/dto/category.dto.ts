import { IsString, IsOptional, IsBoolean, IsInt, IsUUID, Min, Max, IsHexColor } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name', example: 'O\'yinchoqlar' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Parent category ID', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ description: 'FontAwesome icon class', example: 'fas fa-gamepad' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color code', example: '#4ECDC4' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'SEO meta title' })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({ description: 'Is category active', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateCategoryDto {
  @ApiPropertyOptional({ description: 'Category name', example: 'O\'yinchoqlar' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Parent category ID', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiPropertyOptional({ description: 'FontAwesome icon class', example: 'fas fa-gamepad' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color code', example: '#4ECDC4' })
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'SEO meta title' })
  @IsOptional()
  @IsString()
  meta_title?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  @IsOptional()
  @IsString()
  meta_description?: string;

  @ApiPropertyOptional({ description: 'Sort order', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;

  @ApiPropertyOptional({ description: 'Is category active', example: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class CategoryQueryDto {
  @ApiPropertyOptional({ description: 'Parent category ID for filtering children' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ description: 'Search term for category name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', example: 20 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Filter by active status' })
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class ReorderCategoryDto {
  @ApiProperty({ description: 'Category ID', example: '550e8400-e29b-41d4-a716-446655440001' })
  @IsUUID()
  id: string;

  @ApiPropertyOptional({ description: 'New parent category ID' })
  @IsOptional()
  @IsUUID()
  parent_id?: string;

  @ApiProperty({ description: 'New sort order', example: 1 })
  @IsInt()
  @Min(0)
  sort_order: number;
}

export class BulkReorderDto {
  @ApiProperty({ 
    description: 'Array of category reorder instructions',
    type: [ReorderCategoryDto]
  })
  orders: ReorderCategoryDto[];
}

export class CategoryResponseDto {
  @ApiProperty({ description: 'Category ID' })
  id: string;

  @ApiProperty({ description: 'Category name' })
  name: string;

  @ApiProperty({ description: 'Category slug' })
  slug: string;

  @ApiPropertyOptional({ description: 'Parent category ID' })
  parent_id?: string;

  @ApiPropertyOptional({ description: 'FontAwesome icon class' })
  icon?: string;

  @ApiPropertyOptional({ description: 'Hex color code' })
  color?: string;

  @ApiPropertyOptional({ description: 'Category description' })
  description?: string;

  @ApiPropertyOptional({ description: 'SEO meta title' })
  meta_title?: string;

  @ApiPropertyOptional({ description: 'SEO meta description' })
  meta_description?: string;

  @ApiProperty({ description: 'Sort order' })
  sort_order: number;

  @ApiProperty({ description: 'Is category active' })
  is_active: boolean;

  @ApiProperty({ description: 'Creation date' })
  created_at: Date;

  @ApiProperty({ description: 'Last update date' })
  updated_at: Date;

  @ApiPropertyOptional({ description: 'Number of direct children' })
  children_count?: number;

  @ApiPropertyOptional({ description: 'Number of products in this category' })
  product_count?: number;

  @ApiPropertyOptional({ description: 'Category hierarchy level' })
  level?: number;

  @ApiPropertyOptional({ description: 'Full category path' })
  path?: string;

  @ApiPropertyOptional({ description: 'Child categories' })
  children?: CategoryResponseDto[];
}

export class CategoryTreeResponseDto {
  @ApiProperty({ description: 'Success status' })
  success: boolean;

  @ApiProperty({ description: 'Categories tree', type: [CategoryResponseDto] })
  data: CategoryResponseDto[];

  @ApiPropertyOptional({ description: 'Total count' })
  total?: number;

  @ApiPropertyOptional({ description: 'Current page' })
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page' })
  limit?: number;
}
