import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber } from "class-validator";

export class RefreshTokenDto {
  @ApiProperty({ example: 42, description: "User ID" })
  @IsNumber()
  @IsNotEmpty()
  userId: number;
}
