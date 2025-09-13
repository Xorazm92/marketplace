import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString,IsEmail } from "class-validator";

export class AdminSignInDto {

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string;
}
