import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../identity/token.service';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { SuperAdminGuard } from '../guards/superAdmin.guard';
import { AllowModerator } from '../guards/allow-moderator.decorator';
import { normalizeUzPhone } from '../identity/phone';

// Guard'lar va token turlari (bazasiz). HTTP darajasi: test/mvp/*.e2e-spec.ts.

const config = {
  get: (key: string) => ({ JWT_ACCESS_SECRET: 'a'.repeat(40), JWT_REFRESH_SECRET: 'r'.repeat(40) } as Record<string, string>)[key],
  getOrThrow(key: string) {
    return this.get(key);
  },
} as unknown as ConfigService;

const tokens = new TokenService(new JwtService({}), config);

class Handlers {
  adminOnly() {}
  @AllowModerator()
  moderatorToo() {}
}

function ctx(authorization?: string, handler: keyof Handlers = 'adminOnly') {
  const req: any = { headers: { authorization } };
  const context = { switchToHttp: () => ({ getRequest: () => req }), getHandler: () => Handlers.prototype[handler], getClass: () => Handlers };
  return { req, context: context as unknown as ExecutionContext };
}

const activeUser: any = { user: { findUnique: jest.fn().mockResolvedValue({ is_active: true }) } };
const userGuard = (prisma: any = activeUser) => new UserGuard(tokens, prisma);

describe('TokenService va guard\'lar', () => {
  beforeEach(() => jest.clearAllMocks());

  it('user tokeni UserGuard dan o\'tadi va req.user.id ni to\'ldiradi', async () => {
    const { access_token } = tokens.issue({ sub: 7, kind: 'user' });
    const { req, context } = ctx(`Bearer ${access_token}`);
    await expect(userGuard().canActivate(context)).resolves.toBe(true);
    expect(req.user.id).toBe(7);
  });

  it('bloklangan yoki o\'chirilgan xaridorning yaroqli tokeni ham o\'tmaydi', async () => {
    const { access_token } = tokens.issue({ sub: 7, kind: 'user' });
    for (const row of [{ is_active: false }, null]) {
      const prisma: any = { user: { findUnique: jest.fn().mockResolvedValue(row) } };
      await expect(userGuard(prisma).canActivate(ctx(`Bearer ${access_token}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
    }
  });

  it('admin tokeni UserGuard dan o\'tmaydi', async () => {
    const { access_token } = tokens.issue({ sub: 7, kind: 'admin', role: 'SUPER_ADMIN' });
    await expect(userGuard().canActivate(ctx(`Bearer ${access_token}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
    expect(activeUser.user.findUnique).not.toHaveBeenCalled();
  });

  it('refresh token access sifatida ishlamaydi', async () => {
    const { refresh_token } = tokens.issue({ sub: 7, kind: 'user' });
    await expect(userGuard().canActivate(ctx(`Bearer ${refresh_token}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('boshqa secret bilan imzolangan token rad etiladi', async () => {
    const forged = new JwtService({}).sign({ sub: 1, kind: 'user' }, { secret: 'your-access-secret' });
    await expect(userGuard().canActivate(ctx(`Bearer ${forged}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('AdminGuard rolni tokendan emas, bazadan oladi va nofaol adminni to\'xtatadi', async () => {
    const { access_token } = tokens.issue({ sub: 3, kind: 'admin', role: 'SUPER_ADMIN' });
    const prisma: any = { admin: { findUnique: jest.fn().mockResolvedValue({ id: 3, role: 'ADMIN', is_active: true }) } };
    const { req, context } = ctx(`Bearer ${access_token}`);
    await expect(new AdminGuard(tokens, prisma, new Reflector()).canActivate(context)).resolves.toBe(true);
    expect(req.admin.role).toBe('ADMIN');
    expect(() => new SuperAdminGuard().canActivate(context)).toThrow();

    prisma.admin.findUnique.mockResolvedValue({ id: 3, role: 'SUPER_ADMIN', is_active: false });
    await expect(new AdminGuard(tokens, prisma, new Reflector()).canActivate(ctx(`Bearer ${access_token}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('MODERATOR faqat @AllowModerator() bilan belgilangan endpoint\'ga kiradi', async () => {
    const { access_token } = tokens.issue({ sub: 4, kind: 'admin', role: 'MODERATOR' });
    const prisma: any = { admin: { findUnique: jest.fn().mockResolvedValue({ id: 4, role: 'MODERATOR', is_active: true }) } };
    const guard = new AdminGuard(tokens, prisma, new Reflector());
    await expect(guard.canActivate(ctx(`Bearer ${access_token}`, 'adminOnly').context)).rejects.toBeInstanceOf(ForbiddenException);
    await expect(guard.canActivate(ctx(`Bearer ${access_token}`, 'moderatorToo').context)).resolves.toBe(true);
    // Tokendagi rol yolg'on bo'lsa ham (ADMIN deb yozilgan) bazadagi rol hal qiladi.
    const forgedRole = tokens.issue({ sub: 4, kind: 'admin', role: 'ADMIN' }).access_token;
    await expect(guard.canActivate(ctx(`Bearer ${forgedRole}`, 'adminOnly').context)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('refresh fingerprint faqat aynan shu tokenga mos keladi', () => {
    const a = tokens.issue({ sub: 1, kind: 'user' }).refresh_token;
    const b = tokens.issue({ sub: 1, kind: 'user' }).refresh_token;
    const stored = TokenService.fingerprint(a);
    expect(TokenService.matches(a, stored)).toBe(true);
    expect(TokenService.matches(b, stored)).toBe(false);
    expect(TokenService.matches(a, null)).toBe(false);
  });
});

describe('normalizeUzPhone', () => {
  it.each([
    ['+998 90 123-45-67', '+998901234567'],
    ['998901234567', '+998901234567'],
    ['901234567', '+998901234567'],
  ])('%s → %s', (input, expected) => expect(normalizeUzPhone(input)).toBe(expected));

  it.each(['12345', '+7 900 123 45 67', ''])('%s rad etiladi', (input) => expect(() => normalizeUzPhone(input)).toThrow());
});
