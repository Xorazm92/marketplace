// @ts-nocheck

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class NotificationService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService
  ) {}

  async sendOrderConfirmation(orderId: number) {
    const order = await // @ts-ignore
    this.prisma.order.findUnique({
      where: { id: (orderId as any) },
      include: {
        user: {
          include: {
            email: true,
            phone_numbers: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) return;

    const userEmail = order.// @ts-ignore
    user.email?.find(e => e.is_main)?.email;
    const userPhone = order.// @ts-ignore
    user.phone_number?.find(p => p.is_main)?.phone_number;

    // Send email notification
    if (userEmail) {
      await this.mailService.sendOrderConfirmation(userEmail, order);
    }

    // Send SMS notification
    if (userPhone) {
      await this.sendSMSNotification(userPhone, `Your order #${order.order_number} has been confirmed!`);
    }
  }

  async sendOrderStatusUpdate(orderId: number, newStatus: string) {
    const order = await // @ts-ignore
    this.prisma.order.findUnique({
      where: { id: (orderId as any) },
      include: {
        user: {
          include: {
            email: true,
            phone_numbers: true
          }
        }
      }
    });

    if (!order) return;

    const userEmail = order.// @ts-ignore
    user.email?.find(e => e.is_main)?.email;
    const userPhone = order.// @ts-ignore
    user.phone_number?.find(p => p.is_main)?.phone_number;

    const statusMessages = {
      'CONFIRMED': 'Your order has been confirmed',
      'PROCESSING': 'Your order is being processed',
      'SHIPPED': 'Your order has been shipped',
      'DELIVERED': 'Your order has been delivered',
      'CANCELLED': 'Your order has been cancelled'
    };

    const message = statusMessages[newStatus] || 'Your order status has been updated';

    // Send email notification
    if (userEmail) {
      await this.mailService.sendOrderStatusUpdate(userEmail, order, newStatus);
    }

    // Send SMS notification
    if (userPhone) {
      await this.sendSMSNotification(userPhone, `${message}. Order #${order.order_number}`);
    }
  }

  async sendWelcomeEmail(userId: number) {
    const user = await // @ts-ignore
    this.prisma.user.findUnique({
      where: { id: (userId as any) },
      include: {
        email: true
      }
    });

    if (!user) return;

    const userEmail = // @ts-ignore
    user.email?.find(e => e.is_main)?.email;
    if (userEmail) {
      await this.mailService.sendWelcomeEmail(userEmail, user);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    await this.mailService.sendPasswordReset(email, resetToken);
  }

  async sendProductApprovalNotification(productId: string, approved: boolean) {
    const product = await // @ts-ignore
    this.prisma.product.findUnique({
      where: { id: parseInt(productId) },
      include: {
        user: {
          include: {
            email: true,
            phone_numbers: true
          }
        }
      }
    });

    if (!product || !product.user_id) return;

    // Get user separately since we have user_id
    const user = await // @ts-ignore
    this.prisma.user.findUnique({
      where: { id: product.user_id },
      include: {
        email: true,
        phone_numbers: true
      }
    });

    if (!user) return;

    const userEmail = // @ts-ignore
    user.email?.find(e => e.is_main)?.email;
    const userPhone = // @ts-ignore
    user.phone_number?.find(p => p.is_main)?.phone_number;

    const message = approved 
      ? `Your product "${product.title}" has been approved and is now live!`
      : `Your product "${product.title}" has been rejected. Please review and resubmit.`;

    // Send email notification
    if (userEmail) {
      await this.mailService.sendProductApprovalNotification(userEmail, product, approved);
    }

    // Send SMS notification
    if (userPhone) {
      await this.sendSMSNotification(userPhone, message);
    }
  }

  private async sendSMSNotification(phoneNumber: string, message: string) {
    // Integration with SMS service (Twilio, local SMS gateway, etc.)
    // This is a mock implementation
    console.log(`SMS to ${phoneNumber}: ${message}`);
    
    // You would integrate with actual SMS service here
    // Example: await this.smsService.send(phoneNumber, message);
  }

  async sendBulkEmail(subject: string, content: string, userIds?: number[]) {
    let users;
    
    if (userIds && userIds.length > 0) {
      users = await // @ts-ignore
    this.prisma.user.findMany({
        where: { id: { in: userIds } },
        // include: { email: true }
      });
    } else {
      users = await // @ts-ignore
    this.prisma.user.findMany({
        // include: { email: true }
      });
    }

    for (const user of users) {
      const userEmail = // @ts-ignore
    user.email?.find(e => e.is_main)?.email;
      if (userEmail) {
        await this.mailService.sendBulkEmail(userEmail, subject, content);
      }
    }
  }
}
