import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../common/services/sms.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

interface RegisterWithPhoneData {
  phone_number: string;
  otp_code: string;
  first_name: string;
  last_name: string;
  birth_date?: string;
}

@Injectable()
export class PhoneAuthService {
  private readonly logger = new Logger(PhoneAuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  // OTP yuborish
  async sendOtp(phoneNumber: string, purpose: string = 'login'): Promise<void> {
    try {
      // Rate limiting - oxirgi OTP dan 60 soniya o'tganini tekshirish
      const lastOtp = await this.prisma.otpVerification.findFirst({
        where: {
          phone_number: phoneNumber,
          purpose,
          createdAt: {
            gte: new Date(Date.now() - 60 * 1000), // 60 soniya
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastOtp) {
        throw new HttpException(
          'OTP ni qayta yuborish uchun 60 soniya kuting',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Eski OTP larni o'chirish
      await this.prisma.otpVerification.deleteMany({
        where: {
          phone_number: phoneNumber,
          purpose,
          expires_at: {
            lt: new Date(),
          },
        },
      });

      // Yangi OTP yaratish
      const otpCode = this.smsService.generateOTP(6);
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 daqiqa

      // OTP ni bazaga saqlash
      await this.prisma.otpVerification.create({
        data: {
          phone_number: phoneNumber,
          otp_code: otpCode,
          purpose,
          expires_at: expiresAt,
        },
      });

      // SMS yuborish
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`DEV MODE - OTP for ${phoneNumber}: ${otpCode}`);
      } else {
        await this.smsService.sendOTP(phoneNumber);
      }

      this.logger.log(`OTP sent to ${phoneNumber} for ${purpose}`);
    } catch (error) {
      this.logger.error(`Error sending OTP to ${phoneNumber}:`, error);
      throw error;
    }
  }

  // OTP tasdiqlash
  async verifyOtp(phoneNumber: string, otpCode: string, purpose: string = 'login'): Promise<boolean> {
    try {
      const otpRecord = await this.prisma.otpVerification.findFirst({
        where: {
          phone_number: phoneNumber,
          purpose,
          is_verified: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (!otpRecord) {
        throw new HttpException(
          'OTP topilmadi yoki allaqachon ishlatilgan',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Muddatni tekshirish
      if (new Date() > otpRecord.expires_at) {
        throw new HttpException(
          'OTP muddati tugagan',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Urinishlar sonini tekshirish
      if (otpRecord.attempts >= 3) {
        throw new HttpException(
          'Juda ko\'p noto\'g\'ri urinish. Yangi OTP so\'rang',
          HttpStatus.BAD_REQUEST,
        );
      }

      // OTP ni tekshirish
      if (otpRecord.otp_code !== otpCode) {
        // Urinishlar sonini oshirish
        await this.prisma.otpVerification.update({
          where: { id: otpRecord.id },
          data: { attempts: otpRecord.attempts + 1 },
        });

        throw new HttpException(
          'Noto\'g\'ri OTP kod',
          HttpStatus.BAD_REQUEST,
        );
      }

      // OTP ni tasdiqlangan deb belgilash
      await this.prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { is_verified: true },
      });

      this.logger.log(`OTP verified for ${phoneNumber}`);
      return true;
    } catch (error) {
      this.logger.error(`Error verifying OTP for ${phoneNumber}:`, error);
      throw error;
    }
  }

  // Telefon bilan kirish
  async loginWithPhone(phoneNumber: string, otpCode: string) {
    try {
      // OTP ni tekshirish
      await this.verifyOtp(phoneNumber, otpCode, 'login');

      // Foydalanuvchini topish
      const user = await this.prisma.user.findUnique({
        where: { phone_number: phoneNumber },
      });

      if (!user) {
        throw new HttpException(
          'Bu telefon raqami bilan foydalanuvchi topilmadi',
          HttpStatus.NOT_FOUND,
        );
      }

      // user allaqachon yuqorida e'lon qilingan

      if (!user.is_active) {
        throw new HttpException(
          'Foydalanuvchi hisobi faol emas',
          HttpStatus.FORBIDDEN,
        );
      }

      // User'ni tasdiqlangan deb belgilash
      await this.prisma.user.update({
        where: { id: user.id },
        data: { is_verified: true },
      });

      // JWT tokenlar yaratish
      const tokens = await this.generateTokens(user.id, phoneNumber);

      // Refresh token ni saqlash
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { 
          hashed_refresh_token: hashedRefreshToken,
          last_online: new Date(),
        },
      });

      return {
        user,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      this.logger.error(`Error logging in with phone ${phoneNumber}:`, error);
      throw error;
    }
  }

  // Telefon bilan ro'yxatdan o'tish
  async registerWithPhone(data: RegisterWithPhoneData) {
    try {
      // OTP ni tekshirish
      await this.verifyOtp(data.phone_number, data.otp_code, 'registration');

      // Telefon raqami allaqachon mavjudligini tekshirish
      const existingUser = await this.prisma.user.findUnique({
        where: { phone_number: data.phone_number },
      });

      if (existingUser) {
        throw new HttpException(
          'Bu telefon raqami allaqachon ro\'yxatdan o\'tgan',
          HttpStatus.CONFLICT,
        );
      }

      // Yangi foydalanuvchi yaratish
      const user = await this.prisma.user.create({
        data: {
          phone_number: data.phone_number,
          first_name: data.first_name,
          last_name: data.last_name,
          password: '', // Telefon orqali kirish uchun parol kerak emas
          birth_date: data.birth_date,
          is_active: true,
          is_verified: true,
        },
      });

      // JWT tokenlar yaratish
      const tokens = await this.generateTokens(user.id, data.phone_number);

      // Refresh token ni saqlash
      const hashedRefreshToken = await bcrypt.hash(tokens.refresh_token, 10);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { hashed_refresh_token: hashedRefreshToken },
      });

      this.logger.log(`New user registered with phone: ${data.phone_number}`);

      return {
        user,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      this.logger.error(`Error registering with phone ${data.phone_number}:`, error);
      throw error;
    }
  }

  // OTP qayta yuborish
  async resendOtp(phoneNumber: string, purpose: string = 'login'): Promise<void> {
    return this.sendOtp(phoneNumber, purpose);
  }

  // Telefon raqami mavjudligini tekshirish
  async checkPhoneExists(phoneNumber: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { phone_number: phoneNumber },
    });
    return !!user;
  }

  // Foydalanuvchi telefon raqamini tasdiqlash
  async verifyUserPhone(userId: number, phoneNumber: string, otpCode: string): Promise<boolean> {
    try {
      // OTP ni tekshirish
      await this.verifyOtp(phoneNumber, otpCode, 'verification');

      // User'ni topish va tasdiqlash
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new HttpException(
          'Foydalanuvchi topilmadi',
          HttpStatus.NOT_FOUND,
        );
      }

      if (user.phone_number !== phoneNumber) {
        throw new HttpException(
          'Bu telefon raqami sizga tegishli emas',
          HttpStatus.CONFLICT,
        );
      }

      // User'ni tasdiqlangan deb belgilash
      await this.prisma.user.update({
          where: { id: userId },
          data: { is_verified: true },
        });

      return true;
    } catch (error) {
      this.logger.error(`Error verifying user phone ${phoneNumber}:`, error);
      throw error;
    }
  }

  // JWT tokenlar yaratish
  private async generateTokens(userId: number, phoneNumber: string) {
    const payload = { 
      sub: userId, 
      phone: phoneNumber,
      type: 'phone_auth',
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { access_token, refresh_token };
  }
}
