import { Controller, Get, ServiceUnavailableException, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { PrismaService } from '../prisma/prisma.service';

// Uch savol — uch endpoint:
//   /health/live — jarayon tirikmi (bazaga tegmaydi). Yiqilsa — konteynerni qayta ishga tushirish.
//   /ready       — trafik qabul qila oladimi (baza javob beradi). Yiqilsa — kutish, qayta ishga tushirish emas.
//   /health      — /ready bilan bir xil; deploy.sh, Docker HEALTHCHECK va tashqi monitoring shunga qaraydi.
// Stekda Redis yo'q (rate limit xotirada, OTP byudjeti bazada) — tekshiriladigan yagona bog'liqlik baza.
@ApiTags('Health')
@SkipThrottle()
@Controller({ version: VERSION_NEUTRAL })
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health/live')
  live() {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }

  @Get(['health', 'ready'])
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
    } catch {
      // Sabab (ulanish satri, xost) javobga chiqmaydi — u faqat server logida.
      throw new ServiceUnavailableException({ status: 'error', database: 'down' });
    }
    return { status: 'ok', database: 'up', uptime: Math.round(process.uptime()) };
  }
}
