import { Injectable, UnauthorizedException, Logger, ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { SmsService } from '../common/services/sms.service';
import { UnifiedAuthService, AuthProvider } from './unified-auth.service';

export interface SmsLoginResponse {
  message: string;
  expiresIn: number;
  phoneNumber: string;
}

@Injectable()
export class SmsAuthService {
  private readonly logger = new Logger(SmsAuthService.name);
  private readonly otpExpiry: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly unifiedAuthService: UnifiedAuthService,
  ) {
    this.otpExpiry = this.configService.get<number>('OTP_EXPIRY_SECONDS', 300);
  }

  // Generate a JWT for OTP verification
  private generateOtpToken(phoneNumber: string, otp: string): string {
    return this.jwtService.sign(
      { phoneNumber, otp },
      {
        secret: this.configService.get<string>('JWT_OTP_SECRET', 'your-otp-secret'),
        expiresIn: this.otpExpiry,
      },
    );
  }

  // Verify OTP token
  private verifyOtpToken(token: string): { phoneNumber: string; otp: string } | null {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_OTP_SECRET', 'your-otp-secret'),
      });
    } catch (error) {
      this.logger.error('Invalid OTP token', error);
      return null;
    }
  }

  // Generate and send OTP to the provided phone number
  async sendOtp(phoneNumber: string): Promise<SmsLoginResponse> {
    // Format phone number if needed (e.g., add country code)
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // Generate OTP
    const otp = this.smsService.generateOTP();
    
    try {
      // In production, uncomment this to actually send the SMS
      // await this.smsService.sendSMS({
      //   phone_number: formattedPhone,
      //   message: `Your verification code is: ${otp}`,
      // });
      
      // For development, just log the OTP
      this.logger.log(`OTP for ${formattedPhone}: ${otp}`);
      
      // Generate JWT containing the OTP
      const otpToken = this.generateOtpToken(formattedPhone, otp);
      
      return {
        message: 'OTP sent successfully',
        expiresIn: this.otpExpiry,
        phoneNumber: formattedPhone,
      };
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${formattedPhone}`, error);
      throw new Error('Failed to send OTP. Please try again later.');
    }
  }

  // Verify OTP and authenticate user
  async verifyOtp(phoneNumber: string, otp: string) {
    const formattedPhone = this.formatPhoneNumber(phoneNumber);
    
    // In a real app, you would verify the OTP from your storage (e.g., Redis)
    // For this example, we'll verify against the JWT token
    const otpToken = this.generateOtpToken(formattedPhone, otp);
    const decoded = this.verifyOtpToken(otpToken);
    
    if (!decoded || decoded.otp !== otp) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }
    
    // Check if user exists or create a new one
    try {
      // Find or create user with the phone number
      const user = await this.unifiedAuthService.findOrCreateUser('sms', {
        phoneNumber: formattedPhone,
        firstName: 'User', // Default first name
        lastName: formattedPhone.slice(-4), // Last 4 digits as last name
      });
      
      // Generate JWT tokens
      const tokens = await this.unifiedAuthService.generateTokens({
        id: user.id,
        phoneNumber: user.phone_number,
        firstName: user.first_name,
        lastName: user.last_name,
        isVerified: user.is_verified,
        authProvider: 'sms',
      });
      
      // Update refresh token
      await this.unifiedAuthService.updateRefreshToken(user.id, tokens.refreshToken);
      
      return {
        ...tokens,
        user: {
          id: user.id,
          phoneNumber: user.phone_number,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          isVerified: user.is_verified,
        },
      };
    } catch (error) {
      this.logger.error('Error during OTP verification', error);
      throw new Error('Failed to authenticate. Please try again.');
    }
  }
  
  // Format phone number to include country code if missing
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    
    // If number starts with a valid country code, return as is
    if (digitsOnly.startsWith('998') && digitsOnly.length >= 12) {
      return `+${digitsOnly}`;
    }
    
    // If number starts with 9 and is 9 digits, assume it's a local Uzbek number
    if (digitsOnly.match(/^9\d{8}$/)) {
      return `+998${digitsOnly}`;
    }
    
    // If number is 12 digits, assume it's already in international format
    if (digitsOnly.match(/^\d{12}$/)) {
      return `+${digitsOnly}`;
    }
    
    // If we can't determine the format, return as is (will be validated by SMS service)
    return phoneNumber;
  }
}
