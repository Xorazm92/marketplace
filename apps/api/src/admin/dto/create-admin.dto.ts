import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator";

export class CreateAdminDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    first_name: string;
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    last_name: string;
    
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string;
    
    @ApiProperty()
    @IsPhoneNumber('UZ')
    @IsNotEmpty()
    phone_number: string;
        
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password:string
    
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    confirm_password:string
}
