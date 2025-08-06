import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ description: 'Category name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Category slug' })
  @IsString()
  slug: string;

  @ApiProperty({ description: 'Category description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Category image URL', required: false })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ description: 'Parent category ID', required: false })
  @IsOptional()
  @IsInt()
  parent_id?: number;

  @ApiProperty({ description: 'Is category active', default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @ApiProperty({ description: 'Sort order', default: 0 })
  @IsOptional()
  @IsInt()
  sort_order?: number;
}
