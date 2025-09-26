import { IsString, IsNotEmpty, IsBoolean, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentMethodDto {
  @ApiProperty({ example: 'visa' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ example: '4242' })
  @IsString()
  @IsNotEmpty()
  last4: string;

  @ApiProperty({ example: 12 })
  @IsNumber()
  expMonth: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  expYear: number;

  @ApiProperty({ example: 'tok_visa_4242', description: 'Payment provider token' })
  @IsString()
  @IsNotEmpty()
  providerToken: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

export class UpdatePaymentMethodDto {
  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
