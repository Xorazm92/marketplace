import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class EmailSignInDto {
  @IsString()
  @IsNotEmpty({ message: 'Email or phone number is required' })
  email_or_phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
