import { UnauthorizedException } from '@nestjs/common';

export function bearerToken(req: any): string {
  const header: string | undefined = req.headers?.authorization;
  const [scheme, token] = header?.split(' ') ?? [];
  if (scheme !== 'Bearer' || !token) {
    throw new UnauthorizedException('Avtorizatsiya talab qilinadi');
  }
  return token;
}
