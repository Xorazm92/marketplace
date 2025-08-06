import {
  IsString,
  IsInt,
  Min,
  Length,
  IsNumber,
  IsOptional,
  IsEmail,
  IsNotEmpty,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateEmailDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @ApiProperty({
    description: 'Email nomi',
    example: 'example@gmail.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  is_main: boolean;
}
