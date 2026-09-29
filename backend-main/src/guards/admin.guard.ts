import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../identity/token.service';
import { PrismaService } from '../prisma/prisma.service';
import { bearerToken } from './bearer';

// Admin amallari nozik, shuning uchun token muddatini kutmasdan o'chirilgan
// admin darhol to'xtatiladi: har so'rovda holati bazadan tekshiriladi.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const principal = this.tokens.verifyAccess(bearerToken(req), 'admin');
    const admin = await this.prisma.admin.findUnique({
      where: { id: principal.sub },
      select: { id: true, role: true, is_active: true },
    });
    if (!admin?.is_active) {
      throw new UnauthorizedException('Admin hisobi faol emas');
    }
    req.admin = { id: admin.id, sub: admin.id, role: admin.role };
    return true;
  }
}
