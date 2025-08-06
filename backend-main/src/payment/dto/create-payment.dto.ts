import {
  IsNumber,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreatePaymentDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  payment_method_id: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  currency_id: number;

  @ApiProperty({
    description: 'Payment miqdori',
    example: 1000,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  amount: number;
}
