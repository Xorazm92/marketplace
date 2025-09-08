import { IsEnum, IsNumber, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ description: 'Order ID', example: 1 })
  @IsNumber()
  @Type(() => Number)
  order_id: number;

  @ApiProperty({ description: 'Payment amount', example: 100.50 })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ 
    description: 'Payment method',
    enum: ['PAYPAL', 'STRIPE', 'CLICK', 'PAYME', 'UZCARD'],
    example: 'PAYPAL'
  })
  @IsEnum(['PAYPAL', 'STRIPE', 'CLICK', 'PAYME', 'UZCARD'])
  payment_method: string;

  @ApiProperty({ description: 'Currency code', example: 'USD', required: false })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Return URL after payment', required: false })
  @IsOptional()
  @IsString()
  return_url?: string;

  @ApiProperty({ description: 'Cancel URL if payment cancelled', required: false })
  @IsOptional()
  @IsString()
  cancel_url?: string;
}

export class PaymentWebhookDto {
  @ApiProperty({ description: 'Transaction ID from gateway' })
  @IsString()
  transaction_id: string;

  @ApiProperty({ description: 'Payment status' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ description: 'Gateway response data' })
  gateway_data: any;
}
