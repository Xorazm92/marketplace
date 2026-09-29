import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class ListProductsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @IsOptional()
  @IsString()
  category?: string; // slug

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brand_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;

  // Bola yoshi (oyda): tavsiya etilgan oraliqqa tushadigan mahsulotlar.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  age_months?: number;

  @IsOptional()
  @IsIn(['newest', 'price_asc', 'price_desc', 'popular'])
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'popular';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number;
}

export class AdminListProductsQuery {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsIn(['active', 'inactive', 'all'])
  status?: 'active' | 'inactive' | 'all';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

export class UpsertProductDto {
  @IsString()
  @Length(2, 200)
  title: string;

  @IsString()
  @Length(1, 10000)
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  short_description?: string;

  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price: number;

  // Chegirmadan oldingi narx (chizilgan narx). Chegirma foizi shundan hisoblanadi.
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  original_price?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  category_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  brand_id?: number;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  sku?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  age_range?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  recommended_age_min?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  recommended_age_max?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  material?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  safety_warnings?: string;

  @IsOptional()
  @IsBoolean()
  choking_hazard?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  min_order_quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_order_quantity?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsBoolean()
  is_featured?: boolean;
}

export class SetStockDto {
  @Type(() => Number)
  @IsInt()
  @Min(0)
  stock_quantity: number;
}
