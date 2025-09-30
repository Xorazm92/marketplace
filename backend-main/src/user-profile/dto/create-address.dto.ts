// @ts-nocheck
import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateAddressDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsString()
  phone_number: string;

  @IsNumber()
  region_id: number;

  @IsNumber()
  district_id: number;

  @IsString()
  postal_code: string;

  @IsString()
  address_type: string;

  @IsString()
  @IsOptional()
  lat?: string;

  @IsString()
  @IsOptional()
  long?: string;

  @IsBoolean()
  @IsOptional()
  is_default_shipping?: boolean;

  @IsBoolean()
  @IsOptional()
  is_default_billing?: boolean;
}
