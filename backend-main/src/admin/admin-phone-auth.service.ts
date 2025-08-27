import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AdminPhoneSignUpDto, AdminPhoneSignInDto, AdminOtpLoginDto } from './dto';
import { OtpService } from '../otp/otp.service';
import { SmsService } from '../utils/smsService';
import * as otpGenerator from 'otp-generator';
import { AddMinutesToDate } from '../utils/otp-crypto/addMinutes';
import { encode, decode } from '../utils/otp-crypto/crypto';
import { Details } from '../otp/types/details.type';

@Injectable()
export class AdminPhoneAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  // Admin uchun OTP yuborish (registratsiya yoki login uchun)
  async sendAdminOtp(phone_number: string, purpose: 'registration' | 'login' = 'registration') {
    // Telefon raqam formatini tekshirish
    if (!phone_number.startsWith('+998')) {
      throw new BadRequestException('Telefon raqam +998 bilan boshlanishi kerak');
    }

    // Agar registratsiya uchun bo'lsa, admin mavjudligini tekshirish
    if (purpose === 'registration') {
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { phone_number }
      });
      
      if (existingAdmin) {
        throw new ConflictException('Bu telefon raqam bilan admin allaqachon ro\'yxatdan o\'tgan');
      }
    }

    // Agar login uchun bo'lsa, admin mavjudligini tekshirish
    if (purpose === 'login') {
      const existingAdmin = await this.prisma.admin.findUnique({
        where: { phone_number }
      });
      
      if (!existingAdmin) {
        throw new BadRequestException('Bu telefon raqam bilan admin topilmadi');
      }

      if (!existingAdmin.is_active) {
        throw new UnauthorizedException('Admin hisobi faollashtirilmagan');
      }
    }

    // Eski OTP'larni o'chirish
    await this.prisma.otp.deleteMany({
      where: { phone_number }
    });

    // Yangi OTP yaratish
    const otp = otpGenerator.generate(4, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    const now = new Date();
    const expiration_time = AddMinutesToDate(now, 5);

    // OTP'ni saqlash
    const createdOtp = await this.prisma.otp.create({
      data: {
        code: otp,
        expired_time: expiration_time,
        phone_number,
      },
    });

    // Verification key yaratish
    const details: Details = {
      timeStamp: now,
      otp_id: createdOtp.id,
      phone_number,
      is_used: false,
    };

    const encodedData = await encode(JSON.stringify(details));

    // Development mode: OTP'ni console'ga chiqarish
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔐 Admin OTP for ${phone_number}: ${otp}`);
    }

    // SMS yuborish
    const smsMessage = purpose === 'registration' 
      ? `INBOLA Admin - Ro'yxatdan o'tish kodi: ${otp}. Kodni hech kimga bermang!`
      : `INBOLA Admin - Kirish kodi: ${otp}. Kodni hech kimga bermang!`;

    await SmsService.sendSMS(phone_number, otp);

    return {
      key: encodedData,
      message: `${purpose === 'registration' ? 'Ro\'yxatdan o\'tish' : 'Kirish'} kodi yuborildi`,
      status: 200,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    };
  }

  // Admin telefon orqali ro'yxatdan o'tish
  async adminPhoneSignUp(dto: AdminPhoneSignUpDto) {
    const { phone_number, password, first_name, last_name, role, otp_code, verification_key } = dto;

    // OTP'ni tekshirish
    await this.verifyOtp(otp_code, verification_key);

    // Admin mavjudligini qayta tekshirish
    const existingAdmin = await this.prisma.admin.findUnique({
      where: { phone_number }
    });

    if (existingAdmin) {
      throw new ConflictException('Bu telefon raqam bilan admin allaqachon ro\'yxatdan o\'tgan');
    }

    // Parolni hash qilish
    const hashedPassword = await bcrypt.hash(password, 12);

    // Yangi admin yaratish
    const newAdmin = await this.prisma.admin.create({
      data: {
        first_name,
        last_name,
        phone_number,
        role: role || 'ADMIN',
        hashed_password: hashedPassword,
        is_active: true, // Telefon orqali ro'yxatdan o'tganda darhol faollashtirish
        activation_link: null, // Telefon orqali ro'yxatdan o'tganda activation link kerak emas
      },
    });

    // Token yaratish
    const tokens = await this.generateTokens(newAdmin);

    return {
      message: 'Admin muvaffaqiyatli ro\'yxatdan o\'tdi',
      admin: {
        id: newAdmin.id,
        first_name: newAdmin.first_name,
        last_name: newAdmin.last_name,
        phone_number: newAdmin.phone_number,
        role: newAdmin.role,
      },
      ...tokens,
    };
  }

  // Admin telefon orqali kirish (parol bilan)
  async adminPhoneSignIn(dto: AdminPhoneSignInDto) {
    const { phone_number, password } = dto;

    // Admin topish
    const admin = await this.prisma.admin.findUnique({
      where: { phone_number }
    });

    if (!admin) {
      throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
    }

    if (!admin.is_active) {
      throw new UnauthorizedException('Admin hisobi faollashtirilmagan');
    }

    // Parolni tekshirish
    const isPasswordValid = await bcrypt.compare(password, admin.hashed_password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Telefon raqam yoki parol noto\'g\'ri');
    }

    // Token yaratish
    const tokens = await this.generateTokens(admin);

    return {
      message: 'Admin muvaffaqiyatli tizimga kirdi',
      admin: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone_number: admin.phone_number,
        role: admin.role,
      },
      ...tokens,
    };
  }

  // Admin OTP orqali kirish
  async adminOtpLogin(dto: AdminOtpLoginDto) {
    const { phone_number, otp_code, verification_key } = dto;

    // OTP'ni tekshirish
    await this.verifyOtp(otp_code, verification_key);

    // Admin topish
    const admin = await this.prisma.admin.findUnique({
      where: { phone_number }
    });

    if (!admin) {
      throw new UnauthorizedException('Admin topilmadi');
    }

    if (!admin.is_active) {
      throw new UnauthorizedException('Admin hisobi faollashtirilmagan');
    }

    // Token yaratish
    const tokens = await this.generateTokens(admin);

    return {
      message: 'Admin muvaffaqiyatli tizimga kirdi',
      admin: {
        id: admin.id,
        first_name: admin.first_name,
        last_name: admin.last_name,
        phone_number: admin.phone_number,
        role: admin.role,
      },
      ...tokens,
    };
  }

  // OTP tekshirish
  private async verifyOtp(code: string, verification_key: string) {
    const currentData = new Date();
    const decodedData = await decode(verification_key);
    const details: Details = JSON.parse(decodedData);

    const resultOtp = await this.prisma.otp.findUnique({
      where: { id: details.otp_id },
    });

    if (!resultOtp) {
      throw new BadRequestException('OTP topilmadi');
    }

    if (resultOtp.is_used) {
      throw new BadRequestException('OTP allaqachon ishlatilgan');
    }

    if (resultOtp.expired_time < currentData) {
      throw new BadRequestException('OTP muddati tugagan');
    }

    if (resultOtp.code !== code) {
      throw new BadRequestException('OTP noto\'g\'ri');
    }

    // OTP'ni ishlatilgan deb belgilash
    await this.prisma.otp.update({
      where: { id: resultOtp.id },
      data: { is_used: true },
    });

    return true;
  }

  // Token yaratish
  private async generateTokens(admin: any) {
    const payload = {
      sub: admin.id,
      phone_number: admin.phone_number,
      role: admin.role,
      type: 'admin'
    };

    const access_token = this.jwtService.sign(payload, {
      secret: process.env.ACCESS_TOKEN_KEY,
      expiresIn: process.env.ACCESS_TOKEN_TIME || '15m',
    });

    const refresh_token = this.jwtService.sign(payload, {
      secret: process.env.REFRESH_TOKEN_KEY,
      expiresIn: process.env.REFRESH_TOKEN_TIME || '7d',
    });

    // Refresh token'ni hash qilib saqlash
    const hashedRefreshToken = await bcrypt.hash(refresh_token, 7);
    await this.prisma.admin.update({
      where: { id: admin.id },
      data: { hashed_refresh_token: hashedRefreshToken },
    });

    return {
      access_token,
      refresh_token,
      token_type: 'bearer',
    };
  }
}
