import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  UseGuards,
  Req,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PhoneAuthService } from './phone-auth.service';
import { SmsService } from '../common/services/sms.service';
import { UserGuard } from '../guards/user.guard';
import { RateLimitGuard } from '../common/guards/rate-limit.guard';
import { Request } from 'express';

import { IsString, IsOptional, IsEnum } from 'class-validator';

// DTOs
export class SendOtpDto {
  @IsString()
  phone_number: string;

  @IsOptional()
  @IsEnum(['registration', 'login', 'password_reset'])
  purpose?: 'registration' | 'login' | 'password_reset' = 'login';
}

export class VerifyOtpDto {
  @IsString()
  phone_number: string;

  @IsString()
  otp_code: string;

  @IsOptional()
  @IsEnum(['registration', 'login', 'password_reset'])
  purpose?: 'registration' | 'login' | 'password_reset' = 'login';
}

export class PhoneLoginDto {
  @IsString()
  phone_number: string;

  @IsString()
  otp_code: string;
}

export class PhoneRegisterDto {
  @IsString()
  phone_number: string;

  @IsString()
  otp_code: string;

  @IsString()
  first_name: string;

  @IsString()
  last_name: string;

  @IsOptional()
  @IsString()
  birth_date?: string;
}

@ApiTags('Phone Authentication')
@Controller('phone-auth')
export class PhoneAuthController {
  constructor(
    private readonly phoneAuthService: PhoneAuthService,
    private readonly smsService: SmsService,
  ) {}

  @Post('send-otp')
  @UseGuards(RateLimitGuard)
  @ApiOperation({ summary: 'Telefon raqamiga OTP kod yuborish' })
  @ApiResponse({ status: 200, description: 'OTP muvaffaqiyatli yuborildi' })
  @ApiResponse({ status: 400, description: 'Noto\'g\'ri telefon raqami' })
  @ApiResponse({ status: 429, description: 'Juda ko\'p urinish' })
  async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      // Telefon raqamini validatsiya qilish
      if (!this.smsService.validatePhoneNumber(sendOtpDto.phone_number)) {
        throw new HttpException(
          'Noto\'g\'ri telefon raqami formati. Misol: +998901234567',
          HttpStatus.BAD_REQUEST,
        );
      }

      // Telefon raqamini formatlash
      const formattedPhone = this.smsService.formatPhoneNumber(sendOtpDto.phone_number);

      // OTP yuborish
      const result = await this.phoneAuthService.sendOtp(
        formattedPhone,
        sendOtpDto.purpose || 'login',
      );

      return {
        success: true,
        message: 'OTP kod yuborildi',
        phone_number: formattedPhone,
        expires_in: 300, // 5 daqiqa
        can_resend_after: 60, // 1 daqiqa
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'OTP yuborishda xatolik',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'OTP kodni tasdiqlash' })
  @ApiResponse({ status: 200, description: 'OTP muvaffaqiyatli tasdiqlandi' })
  @ApiResponse({ status: 400, description: 'Noto\'g\'ri yoki muddati tugagan OTP' })
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const formattedPhone = this.smsService.formatPhoneNumber(verifyOtpDto.phone_number);

      const result = await this.phoneAuthService.verifyOtp(
        formattedPhone,
        verifyOtpDto.otp_code,
        verifyOtpDto.purpose || 'login',
      );

      return {
        success: true,
        message: 'OTP muvaffaqiyatli tasdiqlandi',
        verified: true,
        phone_number: formattedPhone,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'OTP tasdiqlashda xatolik',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('login')
  @ApiOperation({ summary: 'Telefon raqami va OTP bilan kirish' })
  @ApiResponse({ status: 200, description: 'Muvaffaqiyatli kirish' })
  @ApiResponse({ status: 401, description: 'Noto\'g\'ri ma\'lumotlar' })
  async phoneLogin(@Body() phoneLoginDto: PhoneLoginDto) {
    try {
      const formattedPhone = this.smsService.formatPhoneNumber(phoneLoginDto.phone_number);

      const result = await this.phoneAuthService.loginWithPhone(
        formattedPhone,
        phoneLoginDto.otp_code,
      );

      return {
        success: true,
        message: 'Muvaffaqiyatli kirildi',
        user: {
          id: result.user.id,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          phone_number: formattedPhone,
          is_premium: result.user.is_premium,
        },
        tokens: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Kirishda xatolik',
        error.status || HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('register')
  @ApiOperation({ summary: 'Telefon raqami bilan ro\'yxatdan o\'tish' })
  @ApiResponse({ status: 201, description: 'Muvaffaqiyatli ro\'yxatdan o\'tish' })
  @ApiResponse({ status: 400, description: 'Noto\'g\'ri ma\'lumotlar' })
  async phoneRegister(@Body() phoneRegisterDto: PhoneRegisterDto) {
    try {
      const formattedPhone = this.smsService.formatPhoneNumber(phoneRegisterDto.phone_number);

      const result = await this.phoneAuthService.registerWithPhone({
        phone_number: formattedPhone,
        otp_code: phoneRegisterDto.otp_code,
        first_name: phoneRegisterDto.first_name,
        last_name: phoneRegisterDto.last_name,
        birth_date: phoneRegisterDto.birth_date,
      });

      return {
        success: true,
        message: 'Muvaffaqiyatli ro\'yxatdan o\'tildi',
        user: {
          id: result.user.id,
          first_name: result.user.first_name,
          last_name: result.user.last_name,
          phone_number: formattedPhone,
          is_premium: result.user.is_premium,
        },
        tokens: {
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        },
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Ro\'yxatdan o\'tishda xatolik',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Post('resend-otp')
  @ApiOperation({ summary: 'OTP kodni qayta yuborish' })
  @ApiResponse({ status: 200, description: 'OTP qayta yuborildi' })
  @ApiResponse({ status: 429, description: 'Juda tez qayta yuborish' })
  async resendOtp(@Body() sendOtpDto: SendOtpDto) {
    try {
      const formattedPhone = this.smsService.formatPhoneNumber(sendOtpDto.phone_number);

      const result = await this.phoneAuthService.resendOtp(
        formattedPhone,
        sendOtpDto.purpose || 'login',
      );

      return {
        success: true,
        message: 'OTP qayta yuborildi',
        phone_number: formattedPhone,
        expires_in: 300,
        can_resend_after: 60,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'OTP qayta yuborishda xatolik',
        error.status || HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  @Get('check-phone')
  @ApiOperation({ summary: 'Telefon raqami mavjudligini tekshirish' })
  @ApiResponse({ status: 200, description: 'Telefon raqami holati' })
  async checkPhone(@Body('phone_number') phone_number: string) {
    try {
      const formattedPhone = this.smsService.formatPhoneNumber(phone_number);
      const exists = await this.phoneAuthService.checkPhoneExists(formattedPhone);

      return {
        success: true,
        phone_number: formattedPhone,
        exists,
        message: exists 
          ? 'Telefon raqami ro\'yxatdan o\'tgan' 
          : 'Telefon raqami ro\'yxatdan o\'tmagan',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Tekshirishda xatolik',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @Post('verify-phone')
  @ApiOperation({ summary: 'Foydalanuvchi telefon raqamini tasdiqlash' })
  @ApiResponse({ status: 200, description: 'Telefon raqami tasdiqlandi' })
  async verifyUserPhone(@Req() req: Request, @Body() verifyOtpDto: VerifyOtpDto) {
    try {
      const userId = req.user['sub'];
      const formattedPhone = this.smsService.formatPhoneNumber(verifyOtpDto.phone_number);

      const result = await this.phoneAuthService.verifyUserPhone(
        userId,
        formattedPhone,
        verifyOtpDto.otp_code,
      );

      return {
        success: true,
        message: 'Telefon raqami muvaffaqiyatli tasdiqlandi',
        phone_verified: true,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Telefon tasdiqlashda xatolik',
        error.status || HttpStatus.BAD_REQUEST,
      );
    }
  }
}
