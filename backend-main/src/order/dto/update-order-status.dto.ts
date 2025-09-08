import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED'
}

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    enum: OrderStatus,
    description: 'New order status',
    example: OrderStatus.CONFIRMED
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ 
    description: 'Optional reason for status change',
    required: false,
    example: 'Payment confirmed'
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
