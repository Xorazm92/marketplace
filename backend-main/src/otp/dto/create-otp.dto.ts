import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from "class-validator";

export class CreateOtpDto {
  @ApiProperty({
    example: "+998901234567",
    description: "User phone number in Uzbekistan format",
  })
  @IsNotEmpty()
  @IsPhoneNumber("UZ")
  phone_number: string;
}
