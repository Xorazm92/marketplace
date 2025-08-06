import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface EskizAuthResponse {
  message: string;
  data: {
    token: string;
  };
}

interface EskizSendSmsResponse {
  message: string;
  data: {
    id: string;
    message: string;
    status: string;
  };
}

interface EskizSmsStatus {
  message: string;
  data: {
    id: string;
    status: string;
    message: string;
  };
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly baseUrl = 'https://notify.eskiz.uz/api';
  private token: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(private readonly configService: ConfigService) {}

  // Eskiz.uz dan token olish
  private async getAuthToken(): Promise<string> {
    try {
      // Agar token mavjud va muddati tugamagan bo'lsa, uni qaytaramiz
      if (this.token && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.token;
      }

      const email = this.configService.get<string>('ESKIZ_EMAIL');
      const password = this.configService.get<string>('ESKIZ_PASSWORD');

      if (!email || !password) {
        throw new HttpException(
          'Eskiz.uz credentials not configured',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const response: AxiosResponse<EskizAuthResponse> = await axios.post(
        `${this.baseUrl}/auth/login`,
        {
          email,
          password,
        },
      );

      if (response.data && response.data.data && response.data.data.token) {
        this.token = response.data.data.token;
        // Token 30 kun amal qiladi
        this.tokenExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        
        this.logger.log('Eskiz.uz token successfully obtained');
        return this.token;
      }

      throw new HttpException(
        'Failed to get auth token from Eskiz.uz',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      this.logger.error('Error getting Eskiz.uz auth token:', error);
      throw new HttpException(
        'SMS service authentication failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // OTP kod generatsiya qilish
  generateOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    
    return otp;
  }

  // SMS yuborish
  async sendSMS(phoneNumber: string, message: string): Promise<string> {
    try {
      const token = await this.getAuthToken();

      // Telefon raqamini formatlash (+998901234567 -> 998901234567)
      const formattedPhone = phoneNumber.replace(/^\+/, '');

      const response: AxiosResponse<EskizSendSmsResponse> = await axios.post(
        `${this.baseUrl}/message/sms/send`,
        {
          mobile_phone: formattedPhone,
          message: message,
          from: '4546', // Eskiz.uz default sender
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data && response.data.data && response.data.data.id) {
        this.logger.log(`SMS sent successfully to ${phoneNumber}, ID: ${response.data.data.id}`);
        return response.data.data.id;
      }

      throw new HttpException(
        'Failed to send SMS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    } catch (error) {
      this.logger.error(`Error sending SMS to ${phoneNumber}:`, error);
      throw new HttpException(
        'Failed to send SMS',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // OTP SMS yuborish
  async sendOTP(phoneNumber: string): Promise<{ otp: string; smsId: string }> {
    try {
      const otp = this.generateOTP(6);
      const message = `INBOLA tasdiqlash kodi: ${otp}. Kodni hech kimga bermang!`;

      const smsId = await this.sendSMS(phoneNumber, message);

      this.logger.log(`OTP sent to ${phoneNumber}: ${otp}`);
      
      return { otp, smsId };
    } catch (error) {
      this.logger.error(`Error sending OTP to ${phoneNumber}:`, error);
      throw error;
    }
  }

  // SMS holatini tekshirish
  async getSmsStatus(smsId: string): Promise<string> {
    try {
      const token = await this.getAuthToken();

      const response: AxiosResponse<EskizSmsStatus> = await axios.get(
        `${this.baseUrl}/message/sms/status/${smsId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data && response.data.data) {
        return response.data.data.status;
      }

      return 'unknown';
    } catch (error) {
      this.logger.error(`Error getting SMS status for ${smsId}:`, error);
      return 'error';
    }
  }

  // Telefon raqamini validatsiya qilish
  validatePhoneNumber(phoneNumber: string): boolean {
    // O'zbekiston telefon raqamlari uchun regex
    const uzbekPhoneRegex = /^\+998[0-9]{9}$/;
    return uzbekPhoneRegex.test(phoneNumber);
  }

  // Telefon raqamini formatlash
  formatPhoneNumber(phoneNumber: string): string {
    // Barcha bo'shliq va maxsus belgilarni olib tashlash
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Agar 998 bilan boshlanmasa, qo'shish
    if (!cleaned.startsWith('998')) {
      if (cleaned.startsWith('8')) {
        cleaned = '99' + cleaned;
      } else if (cleaned.length === 9) {
        cleaned = '998' + cleaned;
      }
    }
    
    // + belgisini qo'shish
    return '+' + cleaned;
  }

  // Test SMS yuborish (development uchun)
  async sendTestSMS(phoneNumber: string): Promise<boolean> {
    try {
      if (this.configService.get('NODE_ENV') === 'development') {
        this.logger.log(`TEST SMS: OTP 123456 sent to ${phoneNumber}`);
        return true;
      }
      
      const { smsId } = await this.sendOTP(phoneNumber);
      return !!smsId;
    } catch (error) {
      this.logger.error('Test SMS failed:', error);
      return false;
    }
  }
}
