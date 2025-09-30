// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats() {
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0
    };
  }

  async getRecentOrders() {
    return [];
  }

  async findAdminByPhone(phone: string) {
    return null;
  }

  async createAdmin(data: any) {
    return this.prisma.admin.create({ data });
  }

  async findAdminByEmail(email: string) {
    return null;
  }

  async updateAdminRefreshToken(id: number, refreshToken: string) {
    return this.prisma.admin.update({
      where: { id },
      data: { hashed_refresh_token: refreshToken }
    });
  }
}
