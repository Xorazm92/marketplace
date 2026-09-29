import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash, randomUUID } from 'crypto';
import { safeEqual } from '../common/security/safe-equal';

export type PrincipalKind = 'user' | 'admin';

export interface Principal {
  sub: number;
  kind: PrincipalKind;
  role?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
}

// Foydalanuvchi va admin tokenlari bitta secret bilan imzolanadi; ularni `kind`
// ajratadi. Ilgari 5 xil env nomi (JWT_ACCESS_SECRET, ACCESS_TOKEN_KEY, ...) bor
// edi va guard qaysi birini tekshirishi @nestjs/jwt default'iga tasodifan bog'liq edi.
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  issue(principal: Principal): TokenPair {
    const payload = { sub: principal.sub, kind: principal.kind, role: principal.role };
    return {
      access_token: this.jwt.sign(payload, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') || '15m',
      }),
      // jti: bir soniyada ikki marta berilgan refresh token ham har xil bo'lsin —
      // aks holda rotatsiyadan keyin eski token ham xeshga mos kelib qolardi.
      refresh_token: this.jwt.sign(
        { ...payload, jti: randomUUID() },
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
          expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') || '30d',
        },
      ),
    };
  }

  verifyAccess(token: string, kind: PrincipalKind): Principal {
    return this.verify(token, this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), kind);
  }

  verifyRefresh(token: string, kind: PrincipalKind): Principal {
    return this.verify(token, this.config.getOrThrow<string>('JWT_REFRESH_SECRET'), kind);
  }

  // bcrypt emas: u faqat birinchi 72 baytni xeshlaydi, JWT'ning bu qismi esa
  // bir foydalanuvchining barcha tokenlarida bir xil — ya'ni har qanday eski
  // refresh token mos kelardi.
  static fingerprint(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  static matches(token: string, storedFingerprint: string | null | undefined): boolean {
    return !!storedFingerprint && safeEqual(TokenService.fingerprint(token), storedFingerprint);
  }

  private verify(token: string, secret: string, kind: PrincipalKind): Principal {
    let payload: any;
    try {
      payload = this.jwt.verify(token, { secret });
    } catch {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati tugagan');
    }
    if (payload?.kind !== kind || !Number.isInteger(payload?.sub)) {
      throw new UnauthorizedException('Token yaroqsiz yoki muddati tugagan');
    }
    return { sub: payload.sub, kind: payload.kind, role: payload.role };
  }
}
