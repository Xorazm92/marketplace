import { IsOptional, IsString, Length } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBrandDto {
  @ApiProperty({
    description: 'Brend nomi',
    example: 'Iphone',
  })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @ApiProperty({
    description: 'Brend logosi (fayl nomi yoki URL)',
    example: 'iphone.png',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Logo must be a string' })
  logo?: string;

  @ApiProperty({
    description: 'Brend tavsifi',
    example: 'Apple kompaniyasining mahsulotlari',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiProperty({
    description: 'Brend veb-sayti',
    example: 'https://apple.com',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  website?: string;

  @ApiProperty({
    description: 'Brend faol holati',
    example: true,
    required: false,
  })
  @IsOptional()
  is_active?: boolean;
}
