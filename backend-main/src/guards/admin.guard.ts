import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TokenService } from '../identity/token.service';
import { PrismaService } from '../prisma/prisma.service';
import { ALLOW_MODERATOR } from './allow-moderator.decorator';
import { bearerToken } from './bearer';

// Admin amallari nozik, shuning uchun token muddatini kutmasdan o'chirilgan
// admin darhol to'xtatiladi: har so'rovda holati bazadan tekshiriladi.
//
// Rollar (docs/PERMISSIONS.md): SUPER_ADMIN va ADMIN — barcha admin endpoint'lari
// (adminlarni boshqarish qo'shimcha SuperAdminGuard bilan). MODERATOR — faqat
// @AllowModerator() bilan belgilanganlar; qolgan hammasi unga 403.
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
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
    if (admin.role === 'MODERATOR' && !this.reflector.getAllAndOverride<boolean>(ALLOW_MODERATOR, [context.getHandler(), context.getClass()])) {
      throw new ForbiddenException("Bu amal uchun ruxsatingiz yo'q");
    }
    req.admin = { id: admin.id, sub: admin.id, role: admin.role };
    return true;
  }
}
