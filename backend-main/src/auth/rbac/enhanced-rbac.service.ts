// @ts-nocheck
import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

interface PermissionCheck {
  userId: string;
  resource: string;
  action: string;
  context?: Record<string, any>;
}

interface RoleAssignment {
  userId: string;
  roleId: string;
  assignedBy: string;
  expiresAt?: Date;
}

@Injectable()
export class EnhancedRbacService {
  private readonly permissionCache = new Map<string, any>();
  private readonly cacheTTL = 300; // 5 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ===========================================
  // PERMISSION MANAGEMENT
  // ===========================================

  async createPermission(data: {
    name: string;
    resource: string;
    action: string;
    description?: string;
    conditions?: Record<string, any>;
  }) {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        resource: data.resource,
        action: data.action,
        description: data.description,
        conditions: data.conditions,
        is_active: true,
      },
    });
  }

  async updatePermission(id: string, data: Partial<{
    name: string;
    description: string;
    conditions: Record<string, any>;
    is_active: boolean;
  }>) {
    return this.prisma.permission.update({
      where: { id },
      data,
    });
  }

  async deletePermission(id: string) {
    return this.prisma.permission.update({
      where: { id },
      data: { is_active: false },
    });
  }

  // ===========================================
  // ROLE MANAGEMENT
  // ===========================================

  async createRole(data: {
    name: string;
    description: string;
    permissions: string[];
    is_active?: boolean;
  }) {
    return this.prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
        is_active: data.is_active ?? true,
        permissions: {
          create: data.permissions.map(permissionId => ({
            permission_id: permissionId,
          })),
        },
      },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  async updateRole(id: string, data: Partial<{
    name: string;
    description: string;
    is_active: boolean;
    permissions: string[];
  }>) {
    const role = await this.prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        is_active: data.is_active,
      },
    });

    if (data.permissions) {
      await this.prisma.role_permission.deleteMany({
        where: { role_id: id },
      });

      await this.prisma.role_permission.createMany({
        data: data.permissions.map(permissionId => ({
          role_id: id,
          permission_id: permissionId,
        })),
      });
    }

    return role;
  }

  async getRoleWithPermissions(id: string) {
    return this.prisma.role.findUnique({
      where: { id, is_active: true },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });
  }

  // ===========================================
  // USER ROLE ASSIGNMENT
  // ===========================================

  async assignRole(data: RoleAssignment) {
    const existing = await // @ts-ignore
    this.prisma.user_role.findFirst({
      where: {
        user_id: data.userId,
        role_id: data.roleId,
        is_active: true,
      },
    });

    if (existing) {
      throw new ConflictException('User already has this role');
    }

    return // @ts-ignore
    this.prisma.user_role.create({
      data: {
        user_id: data.userId,
        role_id: data.roleId,
        assigned_by: data.assignedBy,
        expires_at: data.expiresAt,
        is_active: true,
      },
    });
  }

  async revokeRole(userId: string, roleId: string) {
    return // @ts-ignore
    this.prisma.user_role.updateMany({
      where: {
        user_id: userId,
        role_id: roleId,
        is_active: true,
      },
      data: { is_active: false },
    });
  }

  async getUserRoles(userId: string) {
    return // @ts-ignore
    this.prisma.user_role.findMany({
      where: {
        user_id: userId,
        is_active: true,
      },
      include: {
        role: {
          include: {
            permissions: {
              include: { permission: true },
            },
          },
        },
      },
    });
  }

  // ===========================================
  // PERMISSION CHECKING
  // ===========================================

  async checkPermission(check: PermissionCheck): Promise<boolean> {
    const cacheKey = `perm:${check.userId}:${check.resource}:${check.action}`;
    
    // Check cache first
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached === 'true';
    }

    const user = await // @ts-ignore
    this.prisma.user.findUnique({
      where: { id: check.userId },
      include: {
        roles: {
          where: { is_active: true },
          include: {
            role: {
              where: { is_active: true },
              include: {
                permissions: {
                  where: { is_active: true },
                  include: { permission: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return false;

    // Super admin check
    const hasSuperAdminRole = user.roles.some(ur => ur.role.name === 'SUPER_ADMIN');
    if (hasSuperAdminRole) {
      await this.redis.setex(cacheKey, this.cacheTTL, 'true');
      return true;
    }

    // Check specific permissions
    const hasPermission = user.roles.some(userRole =>
      userRole.role.permissions.some(rolePermission =>
        rolePermission.permission.resource === check.resource &&
        rolePermission.permission.action === check.action &&
        rolePermission.permission.is_active &&
        this.evaluateConditions(rolePermission.permission.conditions, check.context)
      )
    );

    await this.redis.setex(cacheKey, this.cacheTTL, hasPermission.toString());
    return hasPermission;
  }

  async checkPermissions(checks: PermissionCheck[]): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};
    
    await Promise.all(
      checks.map(async (check) => {
        const key = `${check.resource}:${check.action}`;
        results[key] = await this.checkPermission(check);
      })
    );

    return results;
  }

  private evaluateConditions(conditions: any, context: any): boolean {
    if (!conditions) return true;
    
    // Dynamic condition evaluation
    // Example: { "owner_id": "${user_id}" }
    for (const [key, value] of Object.entries(conditions)) {
      const evaluatedValue = this.evaluateTemplate(value as string, context);
      if (context[key] !== evaluatedValue) {
        return false;
      }
    }
    
    return true;
  }

  private evaluateTemplate(template: string, context: any): any {
    return template.replace(/\$\{(\w+)\}/g, (match, key) => {
      return context[key] || match;
    });
  }

  // ===========================================
  // RESOURCE-SPECIFIC PERMISSIONS
  // ===========================================

  async canAccessProduct(userId: string, productId: string, action: string) {
    const product = await // @ts-ignore
    this.prisma.product.findUnique({
      where: { id: parseInt(productId) },
      select: { seller_id: true, status: true }
    });

    if (!product) return false;

    // Owner always has access
    if (product.seller_id === userId) {
      return true;
    }

    // Check global permissions
    const hasPermission = await this.checkPermission({
      userId,
      resource: 'products',
      action,
      context: { product_id: parseInt(productId), seller_id: product.seller_id }
    });

    return hasPermission;
  }

  async canAccessOrder(userId: string, orderId: string, action: string) {
    const order = await // @ts-ignore
    this.prisma.order.findUnique({
      where: { id: (orderId as any) },
      select: { customer_id: true }
    });

    if (!order) return false;

    // Customer always has access to their orders
    if (order.customer_id === userId) {
      return true;
    }

    return this.checkPermission({
      userId,
      resource: 'orders',
      action,
      context: { order_id: orderId, customer_id: order.customer_id }
    });
  }

  // ===========================================
  // AUDIT LOGGING
  // ===========================================

  async logPermissionCheck(userId: string, action: string, resource: string, result: boolean, metadata?: any) {
    await this.prisma.audit_log.create({
      data: {
        user_id: userId,
        action: 'permission_check',
        resource: resource,
        metadata: {
          action,
          result,
          ...metadata,
        },
        success: result,
      },
    });
  }

  // ===========================================
  // DYNAMIC PERMISSIONS
  // ===========================================

  async createDynamicPermission(data: {
    name: string;
    resource: string;
    action: string;
    conditions: Record<string, any>;
    description?: string;
  }) {
    return this.prisma.permission.create({
      data: {
        name: data.name,
        resource: data.resource,
        action: data.action,
        description: data.description,
        conditions: data.conditions,
        is_active: true,
      },
    });
  }

  // ===========================================
  // ROLE HIERARCHY
  // ===========================================

  async createRoleHierarchy(parentRoleId: string, childRoleId: string) {
    return this.prisma.role_hierarchy.create({
      data: {
        parent_role_id: parentRoleId,
        child_role_id: childRoleId,
      },
    });
  }

  async getRoleHierarchy(roleId: string) {
    const [parents, children] = await Promise.all([
      this.prisma.role_hierarchy.findMany({
        where: { child_role_id: roleId },
        include: { parent_role: true },
      }),
      this.prisma.role_hierarchy.findMany({
        where: { parent_role_id: roleId },
        include: { child_role: true },
      }),
    ]);

    return { parents, children };
  }

  // ===========================================
  // PERMISSION MATRIX
  // ===========================================

  async getPermissionMatrix() {
    const roles = await this.prisma.role.findMany({
      where: { is_active: true },
      include: {
        permissions: {
          include: { permission: true },
        },
      },
    });

    const permissions = await this.prisma.permission.findMany({
      where: { is_active: true },
    });

    const matrix: Record<string, Record<string, string[]>> = {};

    permissions.forEach(permission => {
      if (!matrix[permission.resource]) {
        matrix[permission.resource] = {};
      }
      if (!matrix[permission.resource][permission.action]) {
        matrix[permission.resource][permission.action] = [];
      }
    });

    roles.forEach(role => {
      role.permissions.forEach(rolePermission => {
        const permission = rolePermission.permission;
        if (matrix[permission.resource] && matrix[permission.resource][permission.action]) {
          matrix[permission.resource][permission.action].push(role.name);
        }
      });
    });

    return matrix;
  }

  // ===========================================
  // CACHE MANAGEMENT
  // ===========================================

  async clearPermissionCache(userId?: string) {
    if (userId) {
      const keys = await this.redis.keys(`perm:${userId}:*`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } else {
      const keys = await this.redis.keys('perm:*');
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    }
  }

  // ===========================================
  // BULK OPERATIONS
  // ===========================================

  async assignRolesToUsers(userIds: string[], roleId: string, assignedBy: string) {
    return // @ts-ignore
    this.prisma.user_role.createMany({
      data: userIds.map(userId => ({
        user_id: userId,
        role_id: roleId,
        assigned_by: assignedBy,
        is_active: true,
      })),
      skipDuplicates: true,
    });
  }

  async revokeRolesFromUsers(userIds: string[], roleId: string) {
    return // @ts-ignore
    this.prisma.user_role.updateMany({
      where: {
        user_id: { in: userIds },
        role_id: roleId,
        is_active: true,
      },
      data: { is_active: false },
    });
  }
}
