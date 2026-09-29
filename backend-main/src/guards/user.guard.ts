import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { TokenService } from '../identity/token.service';
import { bearerToken } from './bearer';

// Faqat xaridor tokeni o'tadi; admin tokeni bu yerda 401 oladi.
@Injectable()
export class UserGuard implements CanActivate {
  constructor(private readonly tokens: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const principal = this.tokens.verifyAccess(bearerToken(req), 'user');
    // `id` — GetCurrentUserId dekoratori o'qiydigan maydon.
    req.user = { id: principal.sub, ...principal };
    return true;
  }
}
