import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  MinLength,
  MaxLength,
  Matches,
  IsPhoneNumber,
} from "class-validator";

export class SingUpUserDto {
  @ApiProperty({
    example: "John",
    description: "First name of the user",
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  first_name: string;

  @ApiProperty({
    example: "Doe",
    description: "Last name of the user",
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  last_name: string;

  @ApiProperty({
    example: "StrongPass123!",
    description: "Password for the user account",
  })
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  password: string;

  @ApiProperty({
    example: "+998881070125",
    description: "Primary phone number",
  })
  @IsPhoneNumber("UZ")
  phone_number: string;

  @ApiProperty({
    example: "dasda",
    description: "verification key otp key ",
  })
  @IsString()
  verified_key: string;
}
