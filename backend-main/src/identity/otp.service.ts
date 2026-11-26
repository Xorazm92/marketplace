import { BadRequestException, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, randomInt } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { safeEqual } from '../common/security/safe-equal';
import { maskPhone } from '../common/security/mask';
import { SmsService } from './sms.service';

const CODE_TTL_MS = 5 * 60_000;
const RESEND_COOLDOWN_MS = 60_000;
const MAX_ATTEMPTS = 5;
const DAILY_LIMIT = 10;
const HOUR_MS = 3600_000;

type LimitKind = 'phone_daily' | 'ip_phones' | 'global_hour' | 'global_day';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  // SMS pullik. Bitta raqam chegarasi (kuniga 10) hujumchini to'xtatmaydi — u har safar
  // boshqa raqam yuboradi. Shuning uchun yana ikki to'siq: bitta IP soatiga cheklangan
  // sondagi TURLI raqamlarga yubora oladi, va barcha yuborishlar uchun umumiy byudjet bor.
  // Qiymatlar env'dan (environment.config.ts); testlar shu obyektni almashtiradi.
  limits: { ipPhonesPerHour: number; globalPerHour: number; globalPerDay: number };

  constructor(
    private readonly prisma: PrismaService,
    private readonly sms: SmsService,
    private readonly config: ConfigService,
  ) {
    this.limits = {
      ipPhonesPerHour: Number(this.config.get('OTP_IP_PHONES_PER_HOUR') ?? 10),
      globalPerHour: Number(this.config.get('OTP_GLOBAL_PER_HOUR') ?? 300),
      globalPerDay: Number(this.config.get('OTP_GLOBAL_PER_DAY') ?? 2000),
    };
  }

  async send(phone: string, ip?: string, purpose = 'login'): Promise<{ expires_in: number }> {
    const now = Date.now();
    const dayAgo = new Date(now - 24 * HOUR_MS);
    const hourAgo = new Date(now - HOUR_MS);
    const ipHash = ip ? this.hashIp(ip) : null;

    const recent = await this.prisma.otpVerification.findMany({
      where: { phone_number: phone, createdAt: { gte: dayAgo } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    if (recent[0] && now - recent[0].createdAt.getTime() < RESEND_COOLDOWN_MS) {
      throw new HttpException('Kodni qayta yuborish uchun 1 daqiqa kuting', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (recent.length >= DAILY_LIMIT) {
      this.reject('phone_daily', phone, ipHash, recent.length, DAILY_LIMIT, "Bugun uchun urinishlar tugadi, ertaga qayta urinib ko'ring");
    }

    if (ipHash) {
      const phones = await this.prisma.otpVerification.findMany({
        where: { ip_hash: ipHash, createdAt: { gte: hourAgo } },
        distinct: ['phone_number'],
        select: { phone_number: true },
      });
      // O'zi avval so'ragan raqamga qayta so'rash yangi raqam hisoblanmaydi.
      if (phones.length >= this.limits.ipPhonesPerHour && !phones.some((row) => row.phone_number === phone)) {
        this.reject('ip_phones', phone, ipHash, phones.length, this.limits.ipPhonesPerHour, "Juda ko'p urinish. Birozdan keyin qayta urinib ko'ring");
      }
    }

    // Sanash va yozish bitta amal emas: parallel so'rovlar chegaradan bir necha donaga
    // oshishi mumkin. Bu byudjet (taxminiy to'siq), aniq hisoblagich emas.
    const [lastHour, lastDay] = await Promise.all([
      this.prisma.otpVerification.count({ where: { createdAt: { gte: hourAgo } } }),
      this.prisma.otpVerification.count({ where: { createdAt: { gte: dayAgo } } }),
    ]);
    const busy = "SMS xizmati vaqtincha band. Birozdan keyin qayta urinib ko'ring";
    if (lastHour >= this.limits.globalPerHour) this.reject('global_hour', phone, ipHash, lastHour, this.limits.globalPerHour, busy);
    if (lastDay >= this.limits.globalPerDay) this.reject('global_day', phone, ipHash, lastDay, this.limits.globalPerDay, busy);

    const code = String(randomInt(100000, 1000000));
    const row = await this.prisma.otpVerification.create({
      data: { phone_number: phone, purpose, otp_code: this.hash(phone, code), expires_at: new Date(now + CODE_TTL_MS), ip_hash: ipHash },
      select: { id: true },
    });
    try {
      await this.sms.send(phone, `INBOLA: tasdiqlash kodi ${code}. Kodni hech kimga bermang.`);
    } catch (error) {
      // SMS ketmadi (provayder xatosi): kod yozuvi qolsa, xaridor hech narsa olmagan holda
      // 1 daqiqa kutishga va kunlik chegaraga tushardi, oldingi (yetib borgan) kodi esa
      // bekor bo'lardi. Yozuv o'chiriladi — urinish hisobga kirmaydi.
      await this.prisma.otpVerification.delete({ where: { id: row.id } }).catch(() => undefined);
      throw error;
    }
    // Yangi kod yetib borgandan keyingina eskilari bekor bo'ladi: bir vaqtda bitta kod amal qiladi.
    await this.prisma.otpVerification.updateMany({
      where: { phone_number: phone, purpose, is_verified: false, id: { not: row.id }, expires_at: { gt: new Date(now) } },
      data: { expires_at: new Date(now) },
    });
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

  // Anomaliya logi: chegara ishlagani — yo hujum, yo chegara haqiqiy oqim uchun past.
  // Umumiy byudjet tugashi barcha xaridorlarning kirishini to'xtatadi, shuning uchun u `error`.
  // Logga to'liq raqam, IP va kod tushmaydi.
  private reject(kind: LimitKind, phone: string, ipHash: string | null, count: number, limit: number, message: string): never {
    const entry = { event: 'otp_limit', kind, phone: maskPhone(phone), ip: ipHash?.slice(0, 12) ?? null, count, limit };
    if (kind === 'global_hour' || kind === 'global_day') this.logger.error(entry);
    else this.logger.warn(entry);
    throw new HttpException(message, HttpStatus.TOO_MANY_REQUESTS);
  }

  // Kod bazada ochiq saqlanmaydi: baza o'qilsa ham faol kodlar sizib chiqmaydi.
  private hash(phone: string, code: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_OTP_SECRET')).update(`${phone}:${code}`).digest('hex');
  }

  // IP ham shaxsiy ma'lumot: sanash uchun uning o'zi emas, kalitli xeshi yetarli.
  private hashIp(ip: string): string {
    return createHmac('sha256', this.config.getOrThrow<string>('JWT_OTP_SECRET')).update(`ip:${ip}`).digest('hex');
  }
}
