import { createParamDecorator, ExecutionContext } from '@nestjs/common';

// AdminGuard bilan birga ishlatiladi: rol tokendan emas, guard bazadan o'qigan qiymat.
export const CurrentAdminRole = createParamDecorator(
  (_: undefined, context: ExecutionContext): string => context.switchToHttp().getRequest().admin.role,
);
