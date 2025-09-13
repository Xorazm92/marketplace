import { IsString, IsNotEmpty, IsPhoneNumber, MinLength, IsEnum, IsOptional } from 'class-validator';

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export class AdminPhoneSignUpDto {
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsString()
  @IsNotEmpty()
  @IsPhoneNumber('UZ')
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsEnum(AdminRole)
  @IsOptional()
  role?: AdminRole = AdminRole.ADMIN;

  @IsString()
  @IsNotEmpty()
  otp_code: string;

  @IsString()
  @IsNotEmpty()
  verification_key: string;
}
