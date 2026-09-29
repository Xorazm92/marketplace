import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';

// UserGuard bilan birga ishlatiladi: guard tokendan `req.user.id` ni yozadi.
export const GetCurrentUserId = createParamDecorator((_: undefined, context: ExecutionContext): number => {
  const user = context.switchToHttp().getRequest().user as { id?: number } | undefined;
  if (!user?.id) {
    throw new ForbiddenException("Token noto'g'ri");
  }
  return user.id;
});
