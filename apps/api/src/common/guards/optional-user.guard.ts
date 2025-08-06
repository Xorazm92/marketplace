import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class OptionalUserGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      // Token yo'q bo'lsa, request'ni davom ettirish, lekin user null
      request['user'] = null;
      return true;
    }

    try {
      const payload = this.jwtService.verify(token);
      request['user'] = payload;
    } catch {
      // Token noto'g'ri bo'lsa, user null
      request['user'] = null;
    }
    
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
