
import { Injectable } from '@nestjs/common';
import { Permission, ROLE_PERMISSIONS } from './permissions.enum';

export enum UserRole {
  ADMIN = 'admin',
  SELLER = 'seller',
  PARENT = 'parent',
  CHILD = 'child',
  GUEST = 'guest',
  MODERATOR = 'moderator'
}

export enum AdminRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

@Injectable()
export class RBACService {
  // Admin permission checking
  hasAdminPermission(adminRole: AdminRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[adminRole];
    return permissions ? permissions.includes(permission) : false;
  }

  hasAnyAdminPermission(adminRole: AdminRole, permissions: Permission[]): boolean {
    return permissions.some(permission => this.hasAdminPermission(adminRole, permission));
  }

  hasAllAdminPermissions(adminRole: AdminRole, permissions: Permission[]): boolean {
    return permissions.every(permission => this.hasAdminPermission(adminRole, permission));
  }

  getAdminPermissions(adminRole: AdminRole): Permission[] {
    return ROLE_PERMISSIONS[adminRole] || [];
  }

  // Check if admin can access specific resource
  canAccessDashboard(adminRole: AdminRole): boolean {
    return this.hasAdminPermission(adminRole, Permission.VIEW_DASHBOARD);
  }

  canManageUsers(adminRole: AdminRole): boolean {
    return this.hasAnyAdminPermission(adminRole, [
      Permission.VIEW_USERS,
      Permission.UPDATE_USER,
      Permission.DELETE_USER,
      Permission.BLOCK_USER,
      Permission.UNBLOCK_USER
    ]);
  }

  canManageProducts(adminRole: AdminRole): boolean {
    return this.hasAnyAdminPermission(adminRole, [
      Permission.VIEW_PRODUCTS,
      Permission.APPROVE_PRODUCT,
      Permission.REJECT_PRODUCT,
      Permission.UPDATE_PRODUCT,
      Permission.DELETE_PRODUCT
    ]);
  }

  canManageOrders(adminRole: AdminRole): boolean {
    return this.hasAnyAdminPermission(adminRole, [
      Permission.VIEW_ORDERS,
      Permission.UPDATE_ORDER_STATUS,
      Permission.CANCEL_ORDER,
      Permission.REFUND_ORDER
    ]);
  }

  canManageAdmins(adminRole: AdminRole): boolean {
    return this.hasAnyAdminPermission(adminRole, [
      Permission.VIEW_ADMINS,
      Permission.CREATE_ADMIN,
      Permission.UPDATE_ADMIN,
      Permission.DELETE_ADMIN,
      Permission.ASSIGN_ROLES
    ]);
  }

  canViewReports(adminRole: AdminRole): boolean {
    return this.hasAnyAdminPermission(adminRole, [
      Permission.VIEW_REPORTS,
      Permission.VIEW_ANALYTICS,
      Permission.EXPORT_DATA
    ]);
  }

  // Legacy user role permissions (for backward compatibility)
  private readonly rolePermissions: Record<UserRole, string[]> = {
    [UserRole.ADMIN]: ['access:admin', 'manage:system'],
    [UserRole.MODERATOR]: ['moderate:content'],
    [UserRole.SELLER]: ['create:product', 'read:product', 'update:product'],
    [UserRole.PARENT]: ['read:product', 'create:order', 'manage:child'],
    [UserRole.CHILD]: ['read:product'],
    [UserRole.GUEST]: ['read:product'],
  };

  // Legacy methods for user roles
  hasPermission(userRole: UserRole, permission: string): boolean {
    const permissions = this.rolePermissions[userRole];
    return permissions ? permissions.includes(permission) : false;
  }

  hasAnyPermission(userRole: UserRole, permissions: string[]): boolean {
    return permissions.some(permission => this.hasPermission(userRole, permission));
  }

  hasAllPermissions(userRole: UserRole, permissions: string[]): boolean {
    return permissions.every(permission => this.hasPermission(userRole, permission));
  }

  getRolePermissions(userRole: UserRole): string[] {
    return this.rolePermissions[userRole] || [];
  }
}
