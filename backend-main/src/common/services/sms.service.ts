import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosResponse } from 'axios';

interface EskizSendSmsResponse {
  message: string;
  data: {
    id: string;
    status: string;
  };
}

interface EskizSmsStatus {
  message: string;
  data: {
    status: string;
  };
}

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly smsFrom: string;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('SMS_PROVIDER_URL', 'https://notify.eskiz.uz/api');
    this.token = this.configService.get<string>('SMS_TOKEN');
    this.smsFrom = this.configService.get<string>('SMS_FROM', 'INBOLA');
    
    if (!this.token) {
      this.logger.error('SMS_TOKEN not found in environment variables');
      throw new HttpException(
        'SMS service configuration error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    
    this.logger.log('SMS service initialized with Eskiz provider');
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

  // SMS yuborish (Eskiz API)
  async sendSMS(phoneNumber: string, message: string): Promise<string> {
    try {
      const formattedPhone = this.formatPhoneNumber(phoneNumber);
      
      // Log SMS details
      this.logger.log(`Sending SMS to ${formattedPhone}: ${message}`);

      // Shablon ishlatish (ID: 50104) - oddiy send
      const response: AxiosResponse<EskizSendSmsResponse> = await axios.post(
        `${this.baseUrl}/message/sms/send`,
        {
          mobile_phone: formattedPhone.replace('+', ''),
          message: message,
          from: this.smsFrom,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000, // 10 seconds timeout
        },
      );

      // Eskiz.uz response formatini tekshirish
      this.logger.log(`Eskiz response:`, JSON.stringify(response.data));

      if ((response.data as any)?.id) {
        this.logger.log(`SMS sent successfully to ${formattedPhone}, ID: ${(response.data as any).id}`);
        return (response.data as any).id;
      }

      if ((response.data as any)?.status === 'waiting') {
        this.logger.log(`SMS queued for ${formattedPhone}, ID: ${(response.data as any).id}`);
        return (response.data as any).id;
      }

      if (response.data?.data?.id) {
        this.logger.log(`SMS sent successfully to ${formattedPhone}, ID: ${response.data.data.id}`);
        return response.data.data.id;
      }

      throw new Error(`SMS provider error: ${JSON.stringify(response.data)}`);
    } catch (error) {
      this.logger.error(`Error sending SMS to ${phoneNumber}:`, error.message);
      
      // Development mode da xatolik bo'lsa ham davom etsin
      if (this.configService.get('NODE_ENV') === 'development') {
        return 'dev_error_sms_id_' + Date.now();
      }
      
      throw new HttpException(
        'SMS yuborishda xatolik yuz berdi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // OTP SMS yuborish
  async sendOTP(phoneNumber: string): Promise<{ otp: string; smsId: string }> {
    try {
      const otp = this.generateOTP(6);
      const message = `INBOLA Kids Marketplace tasdiqlash kodi: ${otp}. Kodni hech kimga bermang! Kod 5 daqiqa amal qiladi.`;

      const smsId = await this.sendSMS(phoneNumber, message);

      this.logger.log(`OTP generated and sent to ${phoneNumber}`);
      return { otp, smsId };
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${phoneNumber}:`, error);
      throw new HttpException(
        'OTP yuborishda xatolik yuz berdi',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // SMS holatini tekshirish
  async getSmsStatus(smsId: string): Promise<string> {
    try {
      // Development mode uchun mock
      if (this.configService.get('NODE_ENV') === 'development') {
        return 'delivered';
      }

      const response: AxiosResponse<EskizSmsStatus> = await axios.get(
        `${this.baseUrl}/message/sms/status/${smsId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
          },
          timeout: 5000,
        },
      );

      return response.data?.data?.status || 'unknown';
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

  // Test SMS yuborish
  async sendTestSMS(phoneNumber: string): Promise<boolean> {
    try {
      const testMessage = 'INBOLA Kids Marketplace test xabari. Tizim to\'g\'ri ishlayapti!';
      const smsId = await this.sendSMS(phoneNumber, testMessage);
      return !!smsId;
    } catch (error) {
      this.logger.error('Test SMS failed:', error);
      return false;
    }
  }

  // Buyurtma tasdiqlash SMS
  async sendOrderConfirmationSMS(phoneNumber: string, orderNumber: string): Promise<void> {
    try {
      const message = `INBOLA: Buyurtmangiz #${orderNumber} qabul qilindi! Tez orada aloqaga chiqamiz.`;
      await this.sendSMS(phoneNumber, message);
    } catch (error) {
      this.logger.error(`Failed to send order confirmation SMS:`, error);
    }
  }

  // To'lov tasdiqlash SMS
  async sendPaymentConfirmationSMS(phoneNumber: string, amount: number, orderNumber: string): Promise<void> {
    try {
      const message = `INBOLA: ${amount.toLocaleString()} so'm to'lov qabul qilindi. Buyurtma #${orderNumber}`;
      await this.sendSMS(phoneNumber, message);
    } catch (error) {
      this.logger.error(`Failed to send payment confirmation SMS:`, error);
    }
  }
}