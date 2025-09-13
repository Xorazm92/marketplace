import { IsNotEmpty, IsString, IsObject, IsOptional, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TelegramUserDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  first_name: string;
  
  @IsString()
  @IsOptional()
  last_name?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  photo_url?: string;
}

export class TelegramAuthDto {
  @IsObject()
  @ValidateNested()
  @Type(() => TelegramUserDto)
  user: TelegramUserDto;

  @IsString()
  @IsNotEmpty()
  hash: string;

  @IsNumber()
  @IsOptional()
  auth_date?: number;
}
