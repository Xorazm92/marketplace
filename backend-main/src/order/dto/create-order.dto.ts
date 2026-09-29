import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const PAYMENT_METHODS = ['PAYME', 'CLICK', 'UZUM', 'CASH'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];
export const ONLINE_METHODS: readonly PaymentMethod[] = ['PAYME', 'CLICK', 'UZUM'];

// Mijoz faqat nima va qancha olishini aytadi. Narx, chegirma, yetkazish va
// valyuta serverda aniqlanadi (Faza 0, C3).
export class OrderItemInput {
  @IsInt()
  @Min(1)
  product_id: number;

  @IsInt()
  @Min(1)
  @Max(999)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(50)
  @ValidateNested({ each: true })
  @Type(() => OrderItemInput)
  items: OrderItemInput[];

  @IsInt()
  address_id: number;

  @IsIn(PAYMENT_METHODS)
  payment_method: PaymentMethod;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class ListOrdersQuery {
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

export class AdminListOrdersQuery extends ListOrdersQuery {
  @IsOptional()
  @IsIn(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status?: string;

  @IsOptional()
  @IsIn(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'])
  payment_status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  q?: string;
}

export class UpdateOrderStatusDto {
  @IsIn(['CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'])
  status: 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;
}
