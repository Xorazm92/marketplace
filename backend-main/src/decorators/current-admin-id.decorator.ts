import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// AdminGuard bilan birga ishlatiladi.
export const CurrentAdminId = createParamDecorator(
  (_: undefined, context: ExecutionContext): number => context.switchToHttp().getRequest().admin.id,
);
