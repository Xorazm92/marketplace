import { IsString, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCurrencyDto {
  @ApiProperty({
    description: 'Valyuta nomi (masalan: USD, UZS, EUR)',
    example: 'US Dollar',
  })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @ApiProperty({
    description: 'Valyuta kodi (masalan: USD, UZS, EUR)',
    example: 'USD',
  })
  @IsString({ message: 'Code must be a string' })
  @Length(2, 10, { message: 'Code must be between 2 and 10 characters' })
  code: string;

  @ApiProperty({
    description: 'Valyuta belgisi (masalan: $, so\'m, €)',
    example: '$',
  })
  @IsString({ message: 'Symbol must be a string' })
  @Length(1, 10, { message: 'Symbol must be between 1 and 10 characters' })
  symbol: string;
}
