
import { IsString, IsEmail, IsOptional, IsBoolean, IsArray, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSellerDto {
  @ApiProperty({ description: 'Seller company name' })
  @IsString()
  company_name: string;

  @ApiProperty({ description: 'Business registration number' })
  @IsString()
  business_registration: string;

  @ApiProperty({ description: 'Tax identification number' })
  @IsString()
  tax_id: string;

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Contact phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Business address' })
  @IsString()
  business_address: string;

  @ApiProperty({ description: 'Company description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ description: 'Business categories', type: [String] })
  @IsArray()
  @IsString({ each: true })
  business_categories: string[];

  @ApiProperty({ description: 'Bank account details' })
  @IsString()
  bank_account: string;

  @ApiProperty({ description: 'Bank name' })
  @IsString()
  bank_name: string;
}

export class UpdateSellerDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  company_name?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  business_address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  business_categories?: string[];
}

export class VerifySellerDto {
  @ApiProperty({ description: 'Verification status' })
  @IsBoolean()
  is_verified: boolean;

  @ApiProperty({ description: 'Admin notes', required: false })
  @IsOptional()
  @IsString()
  verification_notes?: string;
}
