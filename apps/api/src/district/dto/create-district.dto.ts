import { IsString, IsInt, Min, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDistrictDto {
  @ApiProperty({
    description: 'Tuman nomi',
    example: 'Yunusobod',
  })
  @IsString({ message: 'Name must be a string' })
  @Length(2, 50, { message: 'Name must be between 2 and 50 characters' })
  name: string;

  @ApiProperty({
    description: 'Tegishli viloyat ID raqami',
    example: 1,
  })
  @IsInt({ message: 'Region ID must be an integer' })
  @Min(1, { message: 'Region ID must be at least 1' })
  region_id: number;
}
