import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { safeEqual } from '../common/security/safe-equal';
import { SmsService } from './sms.service';

const CODE_TTL_MS = 5 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;
const DAILY_LIMIT = 10;

@Injectable()
export class OtpService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {}

  async send(phone: string, purpose = 'login'): Promise<{ expires_in: number }> {
    const now = Date.now();
    const recent = await this.prisma.otpVerification.findMany({
      where: { phone_number: phone, createdAt: { gte: new Date(now - 24 * 3600_000) } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new HttpException('Kodni qayta yuborish uchun 1 daqiqa kuting', HttpStatus.TOO_MANY_REQUESTS);
    }
    // SMS pullik: bitta raqamga cheksiz yuborish balansni yoqib yuboradi.
    if (recent.length >= DAILY_LIMIT) {
      throw new HttpException("Bugun uchun urinishlar tugadi, ertaga qayta urinib ko'ring", HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = String(randomInt(100000, 1000000));
    await this.prisma.$transaction([
      // Yangi kod eskisini bekor qiladi: bir vaqtda faqat bitta kod amal qiladi.
      this.prisma.otpVerification.updateMany({
        where: { phone_number: phone, purpose, is_verified: false, expires_at: { gt: new Date(now) } },
        data: { expires_at: new Date(now) },
      }),
      this.prisma.otpVerification.create({
        data: { phone_number: phone, purpose, otp_code: this.hash(phone, code), expires_at: new Date(now + CODE_TTL_MS) },
      }),
    ]);

    await this.sms.send(phone, `INBOLA: tasdiqlash kodi ${code}. Kodni hech kimga bermang.`);
    return { expires_in: CODE_TTL_MS / 1000 };
  }

  async verify(phone: string, code: string, purpose = 'login'): Promise<void> {
    const invalid = new BadRequestException("Kod noto'g'ri yoki muddati tugagan");
    const record = await this.prisma.otpVerification.findFirst({
      where: { phone_number: phone, purpose, is_verified: false, expires_at: { gt: new Date() } },
      orderBy: { createdAt: 'desc' },
    });
    if (!record) throw invalid;

    // Urinish avval shartli yoziladi, keyin taqqoslanadi: parallel so'rovlar
    // bilan 5 urinish chegarasini aylanib o'tib bo'lmaydi.
    const { count } = await this.prisma.otpVerification.updateMany({
      where: { id: record.id, attempts: { lt: MAX_ATTEMPTS } },
      data: { attempts: { increment: 1 } },
    });
    if (count === 0) {
      throw new BadRequestException("Urinishlar tugadi. Yangi kod so'rang");
    }

    if (!safeEqual(this.hash(phone, String(code)), record.otp_code)) throw invalid;

    // Bir kod ikki marta ishlatilmasin (ikki parallel so'rov ikkalasi ham to'g'ri kod bilan).
    const consumed = await this.prisma.otpVerification.updateMany({
      where: { id: record.id, is_verified: false },
      data: { is_verified: true },
    });
    if (consumed.count === 0) throw invalid;
  }

  // Kod bazada ochiq saqlanmaydi: baza o'qilsa ham faol kodlar sizib chiqmaydi.
  private hash(phone: string, code: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_OTP_SECRET')).update(`${phone}:${code}`).digest('hex');
  }
}
