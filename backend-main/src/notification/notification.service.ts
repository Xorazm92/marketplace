
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
          select: {
            id: true,
            email: true,
            phone_number: true,
            first_name: true,
            last_name: true
          }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order || !('user' in order)) return;

    const userEmail = order.user?.email;
    const userPhone = order.user?.phone_number;

    // Send email notification
    if (userEmail && order) {
      const orderData = {
        id: order.id,
        order_number: order.order_number,
        total_amount: order.total_amount,
        // Add other necessary order fields
      };
      await this.mailService.sendOrderConfirmation(userEmail, orderData);
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
          select: {
            id: true,
            email: true,
            phone_number: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!order || !('user' in order)) return;

    const userEmail = order.user?.email;
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
    if (userEmail && order) {
      const orderData = {
        id: order.id,
        order_number: order.order_number,
        // Add other necessary order fields
      };
      await this.mailService.sendOrderStatusUpdate(userEmail, orderData, newStatus);
    }

    // Send SMS notification
    if (userPhone) {
      await this.sendSMSNotification(userPhone, `${message}. Order #${order.order_number}`);
    }
  }

  async sendWelcomeEmail(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        first_name: true,
        last_name: true,
        phone_number: true
      }
    });

    if (!user || !user.email) return;

    const userEmail = user.email;
    if (userEmail) {
      const userData = {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      };
      await this.mailService.sendWelcomeEmail(userEmail, userData);
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
          select: {
            id: true,
            email: true,
            phone_number: true,
            first_name: true,
            last_name: true
          }
        }
      }
    });

    if (!product || !('user' in product)) return;

    const userEmail = product.user?.email;
    const userPhone = product.user?.phone_number;

    const message = approved 
      ? `Your product "${product.title}" has been approved and is now live!`
      : `Your product "${product.title}" has been rejected. Please review and resubmit.`;

    // Send email notification
    if (userEmail && product) {
      const productData = {
        id: product.id,
        title: product.title,
        // Add other necessary product fields
      };
      await this.mailService.sendProductApprovalNotification(userEmail, productData, approved);
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
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true
        }
      });
    } else {
      users = await this.prisma.user.findMany({
        select: {
          id: true,
          email: true,
          first_name: true,
          last_name: true
        }
      });
    }

    for (const user of users) {
      const userEmail = user.email;
      if (userEmail) {
        await this.mailService.sendBulkEmail(userEmail, subject, content);
      }
    }
  }
}
