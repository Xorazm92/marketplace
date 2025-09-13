import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyDto {
  @ApiProperty({
    description: "Encoded verification key returned when OTP was generated",
    example:
      "eyJ0aW1lU3RhbXAiOiAiMjAyNS0wNS0xNlQxMjowMDowMFoiLCAib3RwX2lkIjogMSwgInBob25lX251bWJlciI6ICI5OTg5MTEyMjMzNCJ9",
  })
  @IsString()
  @IsNotEmpty()
  verification_key: string;

  @ApiProperty({
    description: "OTP code received by the user",
    example: "1234",
  })
  @IsString()
  @IsNotEmpty()
  code: string;
}
