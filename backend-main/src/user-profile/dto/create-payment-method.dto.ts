// @ts-nocheck
import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreatePaymentMethodDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsString()
  @IsOptional()
  card_number?: string;

  @IsString()
  @IsOptional()
  expiry_date?: string;

  @IsString()
  @IsOptional()
  cardholder_name?: string;

  @IsBoolean()
  @IsOptional()
  is_default?: boolean;
}
