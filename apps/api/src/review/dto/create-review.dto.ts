
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, IsOptional, Min, Max, IsArray } from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({ description: 'Product ID' })
  @IsInt()
  product_id: number;

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
