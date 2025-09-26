import { IsString, IsOptional, IsBoolean, IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ example: 'Uy' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '+998901234567' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'Uzbekistan' })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({ example: 'Tashkent Region' })
  @IsString()
  @IsNotEmpty()
  region: string;

  @ApiProperty({ example: 'Tashkent' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Chilonzor 5, house 12, apt 45' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '100000' })
  @IsString()
  @IsNotEmpty()
  zip: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;
}

export class UpdateAddressDto {
  @ApiProperty({ example: 'Uy', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiProperty({ example: '+998901234567', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'Uzbekistan', required: false })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 'Tashkent Region', required: false })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiProperty({ example: 'Tashkent', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Chilonzor 5, house 12, apt 45', required: false })
  @IsOptional()
  @IsString()
  street?: string;

  @ApiProperty({ example: '100000', required: false })
  @IsOptional()
  @IsString()
  zip?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;
}
