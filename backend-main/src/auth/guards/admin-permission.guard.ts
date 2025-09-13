import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { RBACService, AdminRole } from '../rbac/rbac.service';
import { Permission } from '../rbac/permissions.enum';

export const PERMISSIONS_KEY = 'permissions';
export const Permissions = (permissions: Permission[]) => {
  return (target: any, propertyKey?: string, descriptor?: PropertyDescriptor) => {
    Reflect.defineMetadata(PERMISSIONS_KEY, permissions, descriptor?.value || target);
  };
};

@Injectable()
export class AdminPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private jwtService: JwtService,
    private rbacService: RBACService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true; // No permissions required
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new ForbiddenException('Token topilmadi');
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_KEY,
      });

      // Check if this is an admin token
      if (payload.type !== 'admin') {
        throw new ForbiddenException('Admin tokeni kerak');
      }

      const adminRole: AdminRole = payload.role;
      
      // Check if admin has required permissions
      const hasPermission = this.rbacService.hasAllAdminPermissions(adminRole, requiredPermissions);
      
      if (!hasPermission) {
        throw new ForbiddenException('Bu amalni bajarish uchun ruxsat yo\'q');
      }

      // Add admin info to request
      request.admin = {
        id: payload.sub,
        phone_number: payload.phone_number,
        role: payload.role,
      };

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new ForbiddenException('Noto\'g\'ri token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
