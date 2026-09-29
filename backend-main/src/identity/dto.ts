import { IsEmail, IsIn, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class SendOtpDto {
  @IsString()
  @IsNotEmpty()
  phone_number: string;
}

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @Matches(/^\d{6}$/, { message: "Kod 6 ta raqamdan iborat bo'lishi kerak" })
  code: string;

  // Faqat yangi foydalanuvchi uchun ishlatiladi; mavjud hisobning ismi o'zgarmaydi.
  @IsOptional()
  @IsString()
  @MaxLength(60)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  last_name?: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refresh_token: string;
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @Length(1, 60)
  first_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  last_name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class AdminLoginDto {
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateAdminDto {
  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsString()
  @MinLength(12, { message: "Parol kamida 12 belgi bo'lishi kerak" })
  password: string;

  @IsString()
  @Length(1, 60)
  first_name: string;

  @IsString()
  @Length(1, 60)
  last_name: string;

  // SUPER_ADMIN API orqali yaratilmaydi — faqat create-admin.js bilan.
  @IsIn(['ADMIN', 'MODERATOR'])
  role: 'ADMIN' | 'MODERATOR';
}

export class SetActiveDto {
  @IsIn([true, false])
  is_active: boolean;
}
