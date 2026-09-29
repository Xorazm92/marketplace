import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

// AdminGuard dan KEYIN qo'yiladi: u tokenni tekshirib `req.admin` ga payload yozadi.
// Payload'da `is_creator` yo'q (admin-phone-auth.service generateTokens), shuning
// uchun oldingi tekshiruv hammani rad etardi; rol esa payload'da bor.
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    if (req.admin?.role !== 'SUPER_ADMIN') {
      throw new ForbiddenException();
    }

    return true;
  }
}
