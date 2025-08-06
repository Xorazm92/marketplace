import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber,IsOptional, IsString } from "class-validator";

export class FindAddressDto {

  @ApiProperty({
    description: "Region ID associated with the address",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  region_id?: number;

  @ApiProperty({
    description: "District ID associated with the address",
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  district_id?: number;
 
  @ApiPropertyOptional({
    description: "Latitude associated with the address",
    example: 1,
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  lat?: string;

  @ApiPropertyOptional({
    description: "Longitude associated with the address",
    example: 1,
  })
  @IsOptional()
  @Type(() => String)
  @IsString()
  long?: string;

}
