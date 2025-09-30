// @ts-nocheck

import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min, Max, IsArray, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product ID' })
  @IsUUID()
  product_id: string;

  @ApiProperty({ description: 'Rating (1-5)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review title', required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ description: 'Review comment', required: false })
  @IsString()
  @IsOptional()
  comment?: string;

  @ApiProperty({ description: 'Review images', required: false })
  @IsArray()
  @IsOptional()
  images?: string[];
}
