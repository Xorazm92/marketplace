import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreatePhoneNumberDto {
  @ApiProperty({ required: false })
  @IsNumber()
  @Type(() => Number)
  user_id: number;

  @ApiProperty({
    description: 'Telefon raqami',
    example: '+99890-123-45-67',
  })
  @IsPhoneNumber('UZ')
  @IsNotEmpty()
  phone_number: string;

  @ApiProperty()
  @IsBoolean()
  @IsNotEmpty()
  @Transform(({ value }) => value === 'true' || value === true)
  is_main: boolean;
}
