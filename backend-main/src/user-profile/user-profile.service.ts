import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UserProfileService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    return { userId, message: 'Profile retrieved' };
  }

  async updateProfile(userId: string, updateProfileDto: any) {
    return { message: 'Profile updated successfully' };
  }

  async uploadAvatar(userId: string, file: any) {
    return { message: 'Avatar uploaded successfully' };
  }

  async changePassword(userId: string, changePasswordDto: any) {
    return { message: 'Password changed successfully' };
  }

  async sendEmailVerification(userId: string) {
    return { message: 'Email verification sent' };
  }

  async confirmEmailVerification(userId: string, code: string) {
    return { message: 'Email verified successfully' };
  }

  async sendPhoneVerification(userId: string) {
    return { message: 'Phone verification sent' };
  }

  async confirmPhoneVerification(userId: string, code: string) {
    return { message: 'Phone verified successfully' };
  }

  async getAddresses(userId: string) {
    return this.prisma.address.findMany({
      where: { user_id: parseInt(userId) },
    });
  }

  async createAddress(userId: string, createAddressDto: any) {
    return this.prisma.address.create({
      data: {
        ...createAddressDto,
        user_id: parseInt(userId),
      },
    });
  }

  async updateAddress(userId: string, addressId: string, updateAddressDto: any) {
    const address = await this.prisma.address.findFirst({
      where: { id: parseInt(addressId), user_id: parseInt(userId) },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    return this.prisma.address.update({
      where: { id: parseInt(addressId) },
      data: updateAddressDto,
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const address = await this.prisma.address.findFirst({
      where: { id: parseInt(addressId), user_id: parseInt(userId) },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.address.delete({ where: { id: parseInt(addressId) } });
    return { message: 'Address deleted successfully' };
  }

  async setDefaultAddress(userId: string, id: string, type: string) {
    return { message: 'Default address set successfully' };
  }

  async getPaymentMethods(userId: string) {
    return [];
  }

  async addPaymentMethod(userId: string, createPaymentMethodDto: any) {
    return { message: 'Payment method added successfully' };
  }

  async deletePaymentMethod(userId: string, paymentMethodId: string) {
    return { message: 'Payment method deleted successfully' };
  }

  async setDefaultPaymentMethod(userId: string, id: string) {
    return { message: 'Default payment method set successfully' };
  }

  async getOrders(userId: string, filters: any) {
    return this.prisma.order.findMany({
      where: { user_id: parseInt(userId) },
    });
  }

  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        id: parseInt(orderId),
        user_id: parseInt(userId),
      },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  async generateInvoice(userId: string, orderId: string) {
    return { message: 'Invoice generated successfully' };
  }

  async reorder(userId: string, orderId: string) {
    return { message: 'Order reordered successfully' };
  }

  async requestReturn(userId: string, orderId: string, reason: string, items: any[]) {
    return { message: 'Return requested successfully' };
  }

  async getWishlist(userId: string) {
    return this.prisma.wishlist.findMany({
      where: { user_id: parseInt(userId) },
    });
  }

  async addToWishlist(userId: string, productId: string) {
    return { message: 'Added to wishlist' };
  }

  async removeFromWishlist(userId: string, productId: string) {
    return { message: 'Removed from wishlist' };
  }

  async getWishlistShareLink(userId: string) {
    return { shareLink: 'https://example.com/wishlist/' + userId };
  }
}
