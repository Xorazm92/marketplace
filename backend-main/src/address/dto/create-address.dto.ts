import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsString, IsBoolean, IsOptional } from "class-validator";

export class CreateAddressDto {
  @ApiProperty({
    description: "User ID associated with the address",
    example: 1,
  })
  @IsInt()
  user_id: number;

  @ApiProperty({ description: "Name of the address", example: "Home" })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: "Latitude coordinate",
    example: "41.2995",
  })
  @IsOptional()
  @IsString()
  lat?: string;

  @ApiPropertyOptional({
    description: "Longitude coordinate",
    example: "69.2401",
  })
  @IsOptional()
  @IsString()
  long?: string;

  @ApiPropertyOptional({
    description: "Is this the main address?",
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  is_main?: boolean;

  @ApiPropertyOptional({ description: "Region ID", example: 10 })
  @IsOptional()
  @IsInt()
  region_id?: number;

  @ApiPropertyOptional({ description: "District ID", example: 20 })
  @IsOptional()
  @IsInt()
  district_id?: number;

  @ApiProperty({
    description: "Full address string",
    example: "123 Main St, City, Country",
  })
  @IsString()
  address: string;
}
