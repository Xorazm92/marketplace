import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

// AdminGuard dan KEYIN qo'yiladi: rol `req.admin` ga bazadan yozilgan.
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
