
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSellerDto, UpdateSellerDto, VerifySellerDto } from './dto/create-seller.dto';
import { isChecked } from '@prisma/client';

@Injectable()
export class SellerService {
  constructor(private readonly prisma: PrismaService) {}

  async registerSeller(userId: number, createSellerDto: CreateSellerDto) {
    // Check if user already has a seller account
    const existingSeller = await this.prisma.seller.findUnique({ where: { user_id: userId } });
    if (existingSeller) {
      throw new BadRequestException('User already has a seller account');
    }

    const seller = await this.prisma.seller.create({
      data: {
        user_id: userId,
        business_name: createSellerDto.company_name,
        business_type: 'company',
        tax_id: createSellerDto.tax_id,
        registration_number: createSellerDto.business_registration,
        phone: createSellerDto.phone,
        email: createSellerDto.email,
        address: createSellerDto.business_address,
        bank_account: createSellerDto.bank_account,
        city: '',
        country: '',
        status: 'pending',
      },
      include: {
        user: {
          select: { id: true, first_name: true, last_name: true, email: true },
        },
      },
    });

    return seller;
  }

  async getSellerProfile(userId: number) {
    const seller = await this.prisma.seller.findUnique({
      where: { user_id: userId },
      include: {
        user: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        products: {
          select: {
            id: true,
            title: true,
            price: true,
            is_active: true,
          },
        },
      },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    return seller;
  }

  async updateSellerProfile(userId: number, updateSellerDto: UpdateSellerDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { user_id: userId },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    return this.prisma.seller.update({
      where: { user_id: userId },
      data: updateSellerDto,
    });
  }

  async getAllSellers(page: number = 1, limit: number = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};

    const [sellers, total] = await Promise.all([
      this.prisma.seller.findMany({
        where,
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              first_name: true,
              last_name: true,
              email: true,
            },
          },
          _count: {
            select: {
              products: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.seller.count({ where }),
    ]);

    return {
      sellers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async verifySeller(sellerId: number, verifySellerDto: VerifySellerDto) {
    const seller = await this.prisma.seller.findUnique({
      where: { id: sellerId },
    });

    if (!seller) {
      throw new NotFoundException('Seller not found');
    }

    return this.prisma.seller.update({
      where: { id: sellerId },
      data: {
        status: verifySellerDto.is_verified ? 'approved' : 'rejected',
      },
    });
  }

  async getSellerAnalytics(userId: number) {
    const seller = await this.prisma.seller.findUnique({
      where: { user_id: userId },
    });

    if (!seller) {
      throw new NotFoundException('Seller profile not found');
    }

    const [
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
    ] = await Promise.all([
      this.prisma.product.count({ where: { seller_id: seller.id } }),
      this.prisma.product.count({ 
        where: { 
          seller_id: seller.id, 
          is_active: true,
          is_checked: isChecked.APPROVED,
        } 
      }),
      this.prisma.orderItem.count({
        where: {
          product: { is: { seller_id: seller.id } },
        },
      }),
      this.prisma.orderItem.count({
        where: {
          product: { is: { seller_id: seller.id } },
          order: { status: 'PENDING' },
        },
      }),
      this.prisma.orderItem.count({
        where: {
          product: { is: { seller_id: seller.id } },
          order: { status: 'DELIVERED' },
        },
      }),
      this.prisma.orderItem.aggregate({
        where: {
          product: { is: { seller_id: seller.id } },
          order: { status: 'DELIVERED' },
        },
        _sum: { total_price: true },
      }),
    ]);

    return {
      totalProducts,
      activeProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total_price || 0,
    };
  }
}
