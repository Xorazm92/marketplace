import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

// This DTO represents the request payload for refresh containing refreshToken
export class RefreshTokenRequestDto {
  @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", description: "Refresh JWT" })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
