import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../identity/token.service';
import { PrismaService } from '../prisma/prisma.service';
import { bearerToken } from './bearer';

// Faqat xaridor tokeni o'tadi; admin tokeni bu yerda 401 oladi.
//
// Holat har so'rovda bazadan tekshiriladi (AdminGuard kabi): aks holda bloklangan
// xaridor access token muddati (15 daqiqa) tugaguncha buyurtma bera olardi.
// Narxi — har himoyalangan so'rovga birlamchi kalit bo'yicha bitta o'qish.
@Injectable()
export class UserGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const principal = this.tokens.verifyAccess(bearerToken(req), 'user');
    const user = await this.prisma.user.findUnique({ where: { id: principal.sub }, select: { is_active: true } });
    if (!user?.is_active) {
      throw new UnauthorizedException('Hisob bloklangan yoki mavjud emas');
    }
    // `id` — GetCurrentUserId dekoratori o'qiydigan maydon.
    req.user = { id: principal.sub, ...principal };
    return true;
  }
}
