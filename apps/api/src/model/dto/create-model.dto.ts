import { IsString, Length, IsInt, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateModelDto {
  @ApiProperty({
    description: 'Model nomi',
    example: 'iPhone 15 Pro',
  })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 100, { message: 'Name must be between 2 and 100 characters' })
  name: string;

  @ApiProperty({
    description: 'Tegishli brendning ID raqami',
    example: 1,
  })
  @IsInt({ message: 'Brand ID must be an integer' })
  @Min(1, { message: 'Brand ID must be at least 1' })
  brand_id: number;
}
