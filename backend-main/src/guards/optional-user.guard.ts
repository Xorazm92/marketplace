import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from '../identity/token.service';

// Ochiq endpoint'lar uchun: token bo'lsa va yaroqli bo'lsa `req.user` to'ldiriladi,
// bo'lmasa so'rov mehmon sifatida davom etadi.
@Injectable()
export class OptionalUserGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const [scheme, token] = req.headers?.authorization?.split(' ') ?? [];
    if (scheme === 'Bearer' && token) {
      try {
        const principal = this.tokens.verifyAccess(token, 'user');
        req.user = { id: principal.sub, ...principal };
      } catch {
        // Eskirgan token mehmon sifatida ko'rilishi kerak, 401 emas.
      }
    }
    return true;
  }
}
