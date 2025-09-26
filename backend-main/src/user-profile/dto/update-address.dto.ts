import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phone_number?: string;

  @IsNumber()
  @IsOptional()
  region_id?: number;

  @IsNumber()
  @IsOptional()
  district_id?: number;

  @IsString()
  @IsOptional()
  postal_code?: string;

  @IsString()
  @IsOptional()
  address_type?: string;

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
