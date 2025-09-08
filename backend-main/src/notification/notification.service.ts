import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateNotificationDto, BulkNotificationDto } from './dto/create-notification.dto';
import { NotificationType, NotificationChannel, Prisma } from '@prisma/client';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createNotification(data: CreateNotificationDto) {
    try {
      const notificationData = {
        user_id: data.user_id,
        scheduled_at: data.scheduled_at,
        sent_at: data.scheduled_at ? null : new Date(),
        title: data.title,
        message: data.message,
        type: data.type as NotificationType,
        channel: data.channel as NotificationChannel,
        action_url: data.action_url,
        metadata: data.metadata || {},
      };

      const notification = await this.prisma.notification.create({
        data: notificationData,
      });

      // Send immediately if not scheduled
      if (!data.scheduled_at) {
        await this.sendNotification(notification);
      }

      return notification;
    } catch (error) {
      this.logger.error(`Error creating notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to create notification');
    }
  }

  async createBulkNotification(bulkNotificationDto: BulkNotificationDto) {
    const { user_ids, scheduled_at, ...notificationData } = bulkNotificationDto;
    const notifications = [];

    try {
      for (const userId of user_ids) {
        try {
          const notification = await this.createNotification({
            ...notificationData,
            user_id: userId,
            scheduled_at,
          });
          notifications.push({ userId, status: 'success', notification });
        } catch (error) {
          notifications.push({
            userId,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }
      return notifications;
    } catch (error) {
      this.logger.error(`Error in bulk notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to create bulk notifications');
    }
  }

  async getUserNotifications(userId: number, { limit = 10, offset = 0, unreadOnly = false } = {}) {
    try {
      const where: any = { user_id: userId };
      
      if (unreadOnly) {
        where.is_read = false;
      }

      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          where,
          take: limit,
          skip: offset,
          orderBy: { created_at: 'desc' },
        }),
        this.prisma.notification.count({ where }),
      ]);

      return {
        data: notifications,
        pagination: {
          total,
          page: Math.floor(offset / limit) + 1,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting user notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to get notifications');
    }
  }

  async markAsRead(notificationId: number, userId: number) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: { id: notificationId, user_id: userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      if (!notification.is_read) {
        return this.prisma.notification.update({
          where: { id: notificationId },
          data: { is_read: true },
        });
      }
      return notification;
    } catch (error) {
      this.logger.error(`Error marking notification as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to mark notification as read');
    }
  }

  async markAllAsRead(userId: number) {
    try {
      return await this.prisma.notification.updateMany({
        where: { 
          user_id: userId, 
          is_read: false 
        },
        data: { is_read: true },
      });
    } catch (error) {
      this.logger.error(`Error marking all notifications as read: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to mark all notifications as read');
    }
  }

  async deleteNotification(notificationId: number, userId: number) {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: { id: notificationId, user_id: userId },
      });

      if (!notification) {
        throw new Error('Notification not found');
      }

      return this.prisma.notification.delete({
        where: { id: notificationId },
      });
    } catch (error) {
      this.logger.error(`Error deleting notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to delete notification');
    }
  }

  async getUnreadCount(userId: number): Promise<number> {
    try {
      return await this.prisma.notification.count({
        where: { user_id: userId, is_read: false },
      });
    } catch (error) {
      this.logger.error(`Error getting unread count: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return 0; // Return 0 instead of failing
    }
  }

  async sendOrderConfirmation(orderId: number) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return await this.createNotification({
        user_id: order.user_id,
        title: 'Order Confirmed',
        message: `Your order #${order.id} has been confirmed and is being processed.`,
        type: 'ORDER_CONFIRMATION' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        action_url: `/orders/${order.id}`,
        metadata: { orderId: order.id },
      });
    } catch (error) {
      this.logger.error(`Error sending order confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to send order confirmation');
    }
  }

  async sendOrderStatusUpdate(orderId: number, newStatus: string) {
    try {
      const order = await this.prisma.order.findUnique({
        where: { id: orderId },
        include: { user: true },
      });

      if (!order) {
        throw new Error('Order not found');
      }

      const statusMessages: Record<string, string> = {
        SHIPPED: 'has been shipped',
        DELIVERED: 'has been delivered',
        CANCELLED: 'has been cancelled',
      };

      const message = statusMessages[newStatus] || `status has been updated to ${newStatus.toLowerCase()}`;
      
      return await this.createNotification({
        user_id: order.user_id,
        title: `Order ${newStatus}`,
        message: `Your order #${order.id} ${message}.`,
        type: 'ORDER_UPDATE' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        action_url: `/orders/${order.id}`,
        metadata: { orderId: order.id, status: newStatus },
      });
    } catch (error) {
      this.logger.error(`Error sending order status update: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to send order status update');
    }
  }

  async sendPaymentConfirmation(paymentId: number) {
    try {
      const payment = await this.prisma.payment.findUnique({
        where: { id: paymentId },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!payment) {
        throw new Error('Payment not found');
      }

      return await this.createNotification({
        user_id: payment.user_id,
        title: 'Payment Received',
        message: `Your payment of $${(Number(payment.amount) / 100).toFixed(2)} has been processed.`,
        type: 'PAYMENT' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        action_url: `/payments/${payment.id}`,
        metadata: { 
          paymentId: payment.id, 
          amount: payment.amount,
        },
      });
    } catch (error) {
      this.logger.error(`Error sending payment confirmation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to send payment confirmation');
    }
  }

  async sendWelcomeNotification(userId: number) {
    try {
      return await this.createNotification({
        user_id: userId,
        title: 'Welcome to Our Marketplace!',
        message: 'Thank you for joining us. Start exploring amazing products for children.',
        type: 'SYSTEM' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        action_url: '/products',
        metadata: { welcome: true },
      });
    } catch (error) {
      this.logger.error(`Error sending welcome notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to send welcome notification');
    }
  }

  async sendProductApprovalNotification(productId: number, approved: boolean) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
        select: {
          id: true,
          title: true,
          user_id: true,
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const status = approved ? 'approved' : 'rejected';
      
      return await this.createNotification({
        user_id: product.user_id,
        title: `Product ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your product "${product.title}" has been ${status}.`,
        type: 'PRODUCT_UPDATE' as NotificationType,
        channel: 'EMAIL' as NotificationChannel,
        action_url: `/products/${product.id}`,
        metadata: { productId: product.id, approved },
      });
    } catch (error) {
      this.logger.error(`Error sending product approval notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to send product approval notification');
    }
  }

  private async sendNotification(notification: any): Promise<boolean> {
    try {
      // Update sent_at timestamp
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: { sent_at: new Date() },
      });
      
      // Emit event for real-time updates
      this.eventEmitter.emit('notification.sent', notification);
      
      return true;
    } catch (error) {
      this.logger.error(`Error sending notification: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async processScheduledNotifications(): Promise<Array<{id: number; status: string; error?: string}>> {
    const now = new Date();
    
    try {
      const notifications = await this.prisma.notification.findMany({
        where: {
          scheduled_at: {
            lte: now,
          },
          sent_at: null,
        },
      });

      const results: Array<{id: number; status: string; error?: string}> = [];
      for (const notification of notifications) {
        try {
          await this.sendNotification(notification);
          results.push({ id: notification.id, status: 'success' });
        } catch (error) {
          results.push({ 
            id: notification.id, 
            status: 'error', 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
        }
      }
      
      return results;
    } catch (error) {
      this.logger.error(`Error processing scheduled notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to process scheduled notifications');
    }
  }

  private async sendEmailNotification(notification: any) {
    // Implement email notification logic
    console.log('Email notification sent:', notification.title);
  }

  private async sendSMSNotification(notification: any) {
    // Implement SMS notification logic
    console.log('SMS notification sent:', notification.title);
  }

  private async sendInAppNotification(notification: any) {
    // Implement in-app notification logic
    console.log('In-app notification sent:', notification.title);
    
    // Emit real-time event for frontend
    this.eventEmitter.emit('notification.inapp', {
      userId: notification.user_id,
      notification,
    });
  }

  async getNotificationStats() {
    try {
      const [total, unread, sent, scheduled] = await Promise.all([
        this.prisma.notification.count(),
        this.prisma.notification.count({ where: { is_read: false } }),
        this.prisma.notification.count({ where: { sent_at: { not: null } } }),
        this.prisma.notification.count({ where: { scheduled_at: { not: null }, sent_at: null } }),
      ]);

      return {
        total,
        unread,
        sent,
        scheduled,
        readRate: total > 0 ? ((total - unread) / total * 100).toFixed(2) : 0,
      };
    } catch (error) {
      this.logger.error(`Error getting notification stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to get notification stats');
    }
  }

  async getAllNotifications(page: number = 1, limit: number = 20) {
    try {
      const offset = (page - 1) * limit;
      
      const [notifications, total] = await Promise.all([
        this.prisma.notification.findMany({
          take: limit,
          skip: offset,
          orderBy: { created_at: 'desc' },
          include: {
            user: {
              select: { id: true, email: true, first_name: true, last_name: true },
            },
          },
        }),
        this.prisma.notification.count(),
      ]);

      return {
        data: notifications,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      this.logger.error(`Error getting all notifications: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw new Error('Failed to get all notifications');
    }
  }
}
