import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class PermissionGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}

@Injectable()
export class RoleGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}

@Injectable()
export class RoleLevelGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    return true;
  }
}

export const RequirePermissions = (...permissions: any[]) => {
  return () => {};
};

export const RequireRoles = (...roles: string[]) => {
  return () => {};
};

export const RequireRoleLevel = (level: number) => {
  return () => {};
};
