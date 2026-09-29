import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { OtpService } from './otp.service';
import { TokenService } from './token.service';
import { normalizeUzPhone } from './phone';
import { UpdateProfileDto, VerifyOtpDto } from './dto';

// Javobga faqat shu maydonlar chiqadi: ilgari butun `user` qaytarilardi,
// jumladan `hashed_refresh_token` va `password`.
export const PUBLIC_USER_SELECT = {
  id: true,
  phone_number: true,
  first_name: true,
  last_name: true,
  email: true,
  profile_img: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UserAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
  ) {}

  sendOtp(rawPhone: string) {
    return this.otp.send(normalizeUzPhone(rawPhone));
  }

  // Kirish va ro'yxatdan o'tish bitta qadam: kod tasdiqlansa, hisob bo'lmasa ochiladi.
  async verifyOtp(dto: VerifyOtpDto) {
    const phone = normalizeUzPhone(dto.phone_number);
    await this.otp.verify(phone, dto.code);

    let user = await this.prisma.user.findUnique({ where: { phone_number: phone } });
    const isNew = !user;
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          phone_number: phone,
          first_name: dto.first_name?.trim() || '',
          last_name: dto.last_name?.trim() || '',
          is_verified: true,
        },
      });
    }
    if (!user.is_active) throw new ForbiddenException('Hisob bloklangan');

    const pair = await this.issue(user.id);
    const profile = await this.prisma.user.findUnique({ where: { id: user.id }, select: PUBLIC_USER_SELECT });
    return { user: profile, is_new: isNew, ...pair };
  }

  async refresh(refreshToken: string) {
    const principal = this.tokens.verifyRefresh(refreshToken, 'user');
    const user = await this.prisma.user.findUnique({ where: { id: principal.sub } });
    if (!user || !user.is_active || !TokenService.matches(refreshToken, user.hashed_refresh_token)) {
      throw new UnauthorizedException('Qaytadan kiring');
    }
    return this.issue(user.id);
  }

  async logout(userId: number) {
    await this.prisma.user.update({ where: { id: userId }, data: { hashed_refresh_token: null } });
    return { success: true };
  }

  me(userId: number) {
    return this.prisma.user.findUniqueOrThrow({ where: { id: userId }, select: PUBLIC_USER_SELECT });
  }

  updateMe(userId: number, dto: UpdateProfileDto) {
    return this.prisma.user.update({ where: { id: userId }, data: dto, select: PUBLIC_USER_SELECT });
  }

  // Har kirishda eski refresh token bekor bo'ladi (rotatsiya).
  private async issue(userId: number) {
    const pair = this.tokens.issue({ sub: userId, kind: 'user' });
    await this.prisma.user.update({
      where: { id: userId },
      data: { hashed_refresh_token: TokenService.fingerprint(pair.refresh_token), last_online: new Date() },
    });
    return pair;
  }
}
