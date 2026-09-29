import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../identity/token.service';
import { UserGuard } from '../guards/user.guard';
import { AdminGuard } from '../guards/admin.guard';
import { SuperAdminGuard } from '../guards/superAdmin.guard';
import { normalizeUzPhone } from '../identity/phone';

// Guard'lar va token turlari (bazasiz). HTTP darajasi: test/mvp/*.e2e-spec.ts.

const config = {
  get: (key: string) => ({ JWT_ACCESS_SECRET: 'a'.repeat(40), JWT_REFRESH_SECRET: 'r'.repeat(40) } as Record<string, string>)[key],
  getOrThrow(key: string) {
    return this.get(key);
  },
} as unknown as ConfigService;

const tokens = new TokenService(new JwtService({}), config);

function ctx(authorization?: string) {
  const req: any = { headers: { authorization } };
  return { req, context: { switchToHttp: () => ({ getRequest: () => req }) } as unknown as ExecutionContext };
}

describe('TokenService va guard\'lar', () => {
  it('user tokeni UserGuard dan o\'tadi va req.user.id ni to\'ldiradi', () => {
    const { access_token } = tokens.issue({ sub: 7, kind: 'user' });
    const { req, context } = ctx(`Bearer ${access_token}`);
    expect(new UserGuard(tokens).canActivate(context)).toBe(true);
    expect(req.user.id).toBe(7);
  });

  it('admin tokeni UserGuard dan o\'tmaydi', () => {
    const { access_token } = tokens.issue({ sub: 7, kind: 'admin', role: 'SUPER_ADMIN' });
    expect(() => new UserGuard(tokens).canActivate(ctx(`Bearer ${access_token}`).context)).toThrow(UnauthorizedException);
  });

  it('refresh token access sifatida ishlamaydi', () => {
    const { refresh_token } = tokens.issue({ sub: 7, kind: 'user' });
    expect(() => new UserGuard(tokens).canActivate(ctx(`Bearer ${refresh_token}`).context)).toThrow(UnauthorizedException);
  });

  it('boshqa secret bilan imzolangan token rad etiladi', () => {
    const forged = new JwtService({}).sign({ sub: 1, kind: 'user' }, { secret: 'your-access-secret' });
    expect(() => new UserGuard(tokens).canActivate(ctx(`Bearer ${forged}`).context)).toThrow(UnauthorizedException);
  });

  it('AdminGuard rolni tokendan emas, bazadan oladi va nofaol adminni to\'xtatadi', async () => {
    const { access_token } = tokens.issue({ sub: 3, kind: 'admin', role: 'SUPER_ADMIN' });
    const prisma: any = { admin: { findUnique: jest.fn().mockResolvedValue({ id: 3, role: 'ADMIN', is_active: true }) } };
    const { req, context } = ctx(`Bearer ${access_token}`);
    await expect(new AdminGuard(tokens, prisma).canActivate(context)).resolves.toBe(true);
    expect(req.admin.role).toBe('ADMIN');
    expect(() => new SuperAdminGuard().canActivate(context)).toThrow();

    prisma.admin.findUnique.mockResolvedValue({ id: 3, role: 'SUPER_ADMIN', is_active: false });
    await expect(new AdminGuard(tokens, prisma).canActivate(ctx(`Bearer ${access_token}`).context)).rejects.toBeInstanceOf(UnauthorizedException);
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
