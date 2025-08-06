import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class UserLoginDto {
  @ApiProperty({
    example: "+998901234567",
    description: "User phone number in Uzbekistan format",
  })
  @IsString()
  @IsPhoneNumber("UZ")
  phone_number: string;

  @ApiProperty({
    example: "mySecurePassword123",
    description: "User password used for authentication",
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
