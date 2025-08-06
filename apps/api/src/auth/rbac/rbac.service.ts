
import { Injectable } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  PARENT = 'parent',
  CHILD = 'child',
  GUEST = 'guest',
  MODERATOR = 'moderator'
}

export enum Permission {
  // Product permissions
  CREATE_PRODUCT = 'create:product',
  READ_PRODUCT = 'read:product',
  UPDATE_PRODUCT = 'update:product',
  DELETE_PRODUCT = 'delete:product',
  MODERATE_PRODUCT = 'moderate:product',
  
  // Order permissions
  CREATE_ORDER = 'create:order',
  READ_ORDER = 'read:order',
  UPDATE_ORDER = 'update:order',
  CANCEL_ORDER = 'cancel:order',
  
  // Review permissions
  CREATE_REVIEW = 'create:review',
  READ_REVIEW = 'read:review',
  MODERATE_REVIEW = 'moderate:review',
  
  // User permissions
  READ_USER = 'read:user',
  UPDATE_USER = 'update:user',
  MANAGE_CHILD = 'manage:child',
  
  // Admin permissions
  ACCESS_ADMIN = 'access:admin',
  MANAGE_SYSTEM = 'manage:system',
}

@Injectable()
export class RBACService {
  private readonly rolePermissions: Record<UserRole, Permission[]> = {
    [UserRole.ADMIN]: [
      Permission.CREATE_PRODUCT,
      Permission.READ_PRODUCT,
      Permission.UPDATE_PRODUCT,
      Permission.DELETE_PRODUCT,
      Permission.MODERATE_PRODUCT,
      Permission.READ_ORDER,
      Permission.UPDATE_ORDER,
      Permission.MODERATE_REVIEW,
      Permission.READ_USER,
      Permission.UPDATE_USER,
      Permission.ACCESS_ADMIN,
      Permission.MANAGE_SYSTEM,
    ],
    [UserRole.MODERATOR]: [
      Permission.READ_PRODUCT,
      Permission.MODERATE_PRODUCT,
      Permission.MODERATE_REVIEW,
      Permission.READ_ORDER,
      Permission.READ_USER,
    ],
    [UserRole.SELLER]: [
      Permission.CREATE_PRODUCT,
      Permission.READ_PRODUCT,
      Permission.UPDATE_PRODUCT,
      Permission.READ_ORDER,
      Permission.READ_REVIEW,
    ],
    [UserRole.PARENT]: [
      Permission.READ_PRODUCT,
      Permission.CREATE_ORDER,
      Permission.READ_ORDER,
      Permission.UPDATE_ORDER,
      Permission.CANCEL_ORDER,
      Permission.CREATE_REVIEW,
      Permission.READ_REVIEW,
      Permission.MANAGE_CHILD,
      Permission.READ_USER,
      Permission.UPDATE_USER,
    ],
    [UserRole.CHILD]: [
      Permission.READ_PRODUCT,
      Permission.READ_REVIEW,
    ],
    [UserRole.GUEST]: [
      Permission.READ_PRODUCT,
      Permission.READ_REVIEW,
    ],
  };

  hasPermission(userRole: UserRole, permission: Permission): boolean {
    const permissions = this.rolePermissions[userRole];
    return permissions.includes(permission);
  }

  hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  getRolePermissions(userRole: UserRole): Permission[] {
    return this.rolePermissions[userRole] || [];
  }
}
