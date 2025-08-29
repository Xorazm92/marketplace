
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
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            email: true,
            // phone_number endi User model'da to'g'ridan-to'g'ri field
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

    const userEmail = order.user?.email?.find(e => e.is_main)?.email;
    const userPhone = order.user?.phone_number;

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
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          include: {
            email: true,
            // phone_number endi User model'da to'g'ridan-to'g'ri field
          }
        }
      }
    });

    if (!order) return;

    const userEmail = order.user?.email?.find(e => e.is_main)?.email;
    const userPhone = order.user?.phone_number;

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
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        email: true
      }
    });

    if (!user) return;

    const userEmail = user.email.find(e => e.is_main)?.email;
    if (userEmail) {
      await this.mailService.sendWelcomeEmail(userEmail, user);
    }
  }

  async sendPasswordResetEmail(email: string, resetToken: string) {
    await this.mailService.sendPasswordReset(email, resetToken);
  }

  async sendProductApprovalNotification(productId: number, approved: boolean) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        user: {
          include: {
            email: true,
            // phone_number endi User model'da to'g'ridan-to'g'ri field
          }
        }
      }
    });

    if (!product || !product.user) return;

    const userEmail = product.user?.email?.find(e => e.is_main)?.email;
    const userPhone = product.user?.phone_number;

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
      users = await this.prisma.user.findMany({
        where: { id: { in: userIds } },
        include: { email: true }
      });
    } else {
      users = await this.prisma.user.findMany({
        include: { email: true }
      });
    }

    for (const user of users) {
      const userEmail = user.email.find(e => e.is_main)?.email;
      if (userEmail) {
        await this.mailService.sendBulkEmail(userEmail, subject, content);
      }
    }
  }
}
