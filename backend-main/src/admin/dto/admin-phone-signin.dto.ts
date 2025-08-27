import { IsString, IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';

export class AdminPhoneSignInDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class AdminOtpLoginDto {
  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  otp_code: string;

  @IsString()
  @IsNotEmpty()
  verification_key: string;
}
