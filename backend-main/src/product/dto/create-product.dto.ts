import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateProductDto {
  @ApiProperty({ description: 'Mahsulot nomi' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  user_id?: number;

  @ApiProperty({ description: 'Brand ID' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  brand_id: number;

  @ApiProperty({ description: 'Narx' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  price: number;

  @ApiProperty({ description: 'Valyuta ID' })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  currency_id: number;

  @ApiProperty({ description: 'Mahsulot tavsifi' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ description: 'Narx kelishish mumkinmi' })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  negotiable: boolean;

  @ApiProperty({ description: 'Holat (yangi/ishlatilgan)' })
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  condition: boolean;

  @ApiProperty({ description: 'Telefon raqam' })
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => String)
  address_id?: string;

  @ApiProperty({ required: false, description: 'Kategoriya ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  category_id?: number;

  @ApiProperty({ required: false, description: 'Yosh oralig\'i (masalan: 3-6, 6-12)' })
  @IsOptional()
  @IsString()
  age_range?: string;

  @ApiProperty({ required: false, description: 'Material' })
  @IsOptional()
  @IsString()
  material?: string;

  @ApiProperty({ required: false, description: 'Rang' })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiProperty({ required: false, description: 'O\'lcham' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({ required: false, description: 'Ishlab chiqaruvchi' })
  @IsOptional()
  @IsString()
  manufacturer?: string;

  @ApiProperty({ required: false, description: 'Xavfsizlik ma\'lumotlari' })
  @IsOptional()
  @IsString()
  safety_info?: string;

  @ApiProperty({ required: false, description: 'Xususiyatlar ro\'yxati', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiProperty({ required: false, description: 'Og\'irlik (kg)' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @ApiProperty({ required: false, description: 'O\'lchamlar (JSON string)' })
  @IsOptional()
  @IsString()
  dimensions?: string;

  @ApiProperty({ required: false, description: 'Mahsulot ranglari ID ro\'yxati', type: [Number] })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Transform(({ value }) => {
    if (Array.isArray(value)) return value.map(v => Number(v));
    if (typeof value === 'string') return value.split(',').map(v => Number(v.trim())).filter(v => !isNaN(v));
    return undefined;
  })
  product_color_ids?: number[];

  @ApiProperty({
    type: "array",
    items: {
      type: "string",
      format: "binary",
    },
  })
  @IsOptional()
  images?: Express.Multer.File[];
}
