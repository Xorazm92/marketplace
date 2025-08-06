import { IsOptional, IsString, IsDateString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiPropertyOptional({ description: "First name of the user" })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ description: "Last name of the user" })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({
    description: "Birth date of the user in ISO format",
    type: String
  })
  @IsOptional()
  birth_date?: string;

  @ApiPropertyOptional({ description: "Password for the user account" })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiPropertyOptional({
    description: "Profile image file",
    type: "string",
    format: "binary",
  })
  @IsOptional()
  image?: any;
}
