
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      recentOrders,
      topProducts,
      monthlyStats
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.product.count(),
      this.prisma.order.count(),
      this.prisma.order.aggregate({
        _sum: { final_amount: true }
      }),
      this.prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: true,
          items: {
            include: { product: true }
          }
        }
      }),
      this.prisma.product.findMany({
        take: 10,
        orderBy: { view_count: 'desc' },
        include: {
          product_image: true,
          brand: true
        }
      }),
      this.getMonthlyStats()
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue._sum.final_amount || 0,
      recentOrders,
      topProducts,
      monthlyStats
    };
  }

  private async getMonthlyStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [ordersThisMonth, revenueThisMonth] = await Promise.all([
      this.prisma.order.count({
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      }),
      this.prisma.order.aggregate({
        _sum: { final_amount: true },
        where: {
          createdAt: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      })
    ]);

    return {
      ordersThisMonth,
      revenueThisMonth: revenueThisMonth._sum.final_amount || 0
    };
  }

  async getUserManagement(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take: limit,
        include: {
          phone_number: true,
          email: true,
          address: true,
          orders: {
            select: {
              id: true,
              final_amount: true,
              status: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.user.count()
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductManagement(page: number = 1, limit: number = 10, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { is_checked: status } : {};
    
    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        skip,
        take: limit,
        where,
        include: {
          user: true,
          brand: true,
          category: true,
          product_image: true,
          reviews: {
            select: {
              rating: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async approveProduct(productId: number) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { is_checked: 'APPROVED' }
    });
  }

  async rejectProduct(productId: number, reason?: string) {
    return this.prisma.product.update({
      where: { id: productId },
      data: { 
        is_checked: 'REJECTED',
        // Add rejection reason if you have this field
      }
    });
  }
}
