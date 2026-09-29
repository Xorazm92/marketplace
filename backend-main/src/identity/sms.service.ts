import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

// Eskiz.uz: token /auth/login bilan olinadi va ~30 kunda eskiradi. Uni env'da
// qotirib qo'yish bir oydan keyin barcha kirishlarni jimgina to'xtatardi, shuning
// uchun token login/parol bilan olinadi va 401 da bir marta yangilanadi.
@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private token: string | null = null;

  constructor(private readonly config: ConfigService) {}

  get isConfigured(): boolean {
    return !!(this.config.get('ESKIZ_EMAIL') && this.config.get('ESKIZ_PASSWORD'));
  }

  async send(phone: string, message: string): Promise<void> {
    if (!this.isConfigured) {
      if (this.config.get('NODE_ENV') === 'production') {
        throw new ServiceUnavailableException('SMS xizmati sozlanmagan');
      }
      // Dev/test: SMS o'rniga log. Prodda bu tarmoq hech qachon ishlamaydi.
      this.logger.warn(`[DEV SMS] ${phone}: ${message}`);
      return;
    }

    try {
      await this.post(phone, message);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.token = null;
        await this.post(phone, message);
        return;
      }
      this.logger.error(`SMS yuborilmadi (${phone}): ${axios.isAxiosError(error) ? error.response?.status : error}`);
      throw new ServiceUnavailableException("SMS yuborib bo'lmadi, birozdan keyin urinib ko'ring");
    }
  }

  private get baseUrl(): string {
    return this.config.get<string>('ESKIZ_BASE_URL') || 'https://notify.eskiz.uz/api';
  }

  private async post(phone: string, message: string): Promise<void> {
    const token = await this.getToken();
    await axios.post(
      `${this.baseUrl}/message/sms/send`,
      { mobile_phone: phone.replace('+', ''), message, from: this.config.get<string>('SMS_FROM') || '4546' },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10_000 },
    );
  }

  private async getToken(): Promise<string> {
    if (this.token) return this.token;
    const res = await axios.post(
      `${this.baseUrl}/auth/login`,
      { email: this.config.get('ESKIZ_EMAIL'), password: this.config.get('ESKIZ_PASSWORD') },
      { timeout: 10_000 },
    );
    this.token = res.data?.data?.token;
    if (!this.token) throw new Error('Eskiz token qaytarmadi');
    return this.token;
  }
}
