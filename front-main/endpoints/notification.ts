import { ApiClient } from './api-client';
import { toast } from 'react-hot-toast';
import type {
  Notification,
  CreateNotificationDto,
  BulkNotificationDto,
  NotificationResponse,
  NotificationStats,
  UnreadCountResponse,
  NotificationFilters
} from '../types/notification.types';

class NotificationAPI {
  private apiClient: ApiClient;

  constructor() {
    this.apiClient = new ApiClient();
  }

  // User notification methods
  async getMyNotifications(
    page: number = 1,
    limit: number = 20,
    unreadOnly: boolean = false
  ): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        unreadOnly: unreadOnly.toString()
      });

      const response = await this.apiClient.get(`/notifications/my?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch notifications:', error);
      toast.error('Failed to load notifications');
      throw error;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await this.apiClient.get('/notifications/my/unread-count');
      return response.data.count;
    } catch (error: any) {
      console.error('Failed to fetch unread count:', error);
      return 0;
    }
  }

  async markAsRead(notificationId: number): Promise<Notification> {
    try {
      const response = await this.apiClient.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to mark notification as read:', error);
      toast.error('Failed to mark notification as read');
      throw error;
    }
  }

  async markAllAsRead(): Promise<void> {
    try {
      await this.apiClient.put('/notifications/mark-all-read');
      toast.success('All notifications marked as read');
    } catch (error: any) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('Failed to mark all notifications as read');
      throw error;
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    try {
      await this.apiClient.delete(`/notifications/${notificationId}`);
      toast.success('Notification deleted');
    } catch (error: any) {
      console.error('Failed to delete notification:', error);
      toast.error('Failed to delete notification');
      throw error;
    }
  }

  // Admin notification methods
  async createNotification(data: CreateNotificationDto): Promise<Notification> {
    try {
      const response = await this.apiClient.post('/notifications/admin/create', data);
      toast.success('Notification created successfully');
      return response.data;
    } catch (error: any) {
      console.error('Failed to create notification:', error);
      toast.error('Failed to create notification');
      throw error;
    }
  }

  async createBulkNotification(data: BulkNotificationDto): Promise<Notification[]> {
    try {
      const response = await this.apiClient.post('/notifications/admin/bulk', data);
      toast.success(`Bulk notification sent to ${data.user_ids.length} users`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to create bulk notification:', error);
      toast.error('Failed to send bulk notification');
      throw error;
    }
  }

  async getAllNotifications(page: number = 1, limit: number = 20): Promise<NotificationResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await this.apiClient.get(`/notifications/admin/all?${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch all notifications:', error);
      toast.error('Failed to load notifications');
      throw error;
    }
  }

  async getNotificationStats(): Promise<NotificationStats> {
    try {
      const response = await this.apiClient.get('/notifications/admin/stats');
      return response.data;
    } catch (error: any) {
      console.error('Failed to fetch notification stats:', error);
      toast.error('Failed to load notification statistics');
      throw error;
    }
  }

  async processScheduledNotifications(): Promise<{ message: string }> {
    try {
      const response = await this.apiClient.post('/notifications/admin/process-scheduled');
      toast.success(response.data.message);
      return response.data;
    } catch (error: any) {
      console.error('Failed to process scheduled notifications:', error);
      toast.error('Failed to process scheduled notifications');
      throw error;
    }
  }

  // Trigger methods for testing
  async triggerOrderConfirmation(orderId: number): Promise<void> {
    try {
      await this.apiClient.post(`/notifications/trigger/order-confirmation/${orderId}`);
      toast.success('Order confirmation notification triggered');
    } catch (error: any) {
      console.error('Failed to trigger order confirmation:', error);
      toast.error('Failed to trigger notification');
      throw error;
    }
  }

  async triggerOrderStatusUpdate(orderId: number, status: string): Promise<void> {
    try {
      await this.apiClient.post(`/notifications/trigger/order-status/${orderId}`, { status });
      toast.success('Order status notification triggered');
    } catch (error: any) {
      console.error('Failed to trigger order status update:', error);
      toast.error('Failed to trigger notification');
      throw error;
    }
  }

  async triggerPaymentConfirmation(paymentId: number): Promise<void> {
    try {
      await this.apiClient.post(`/notifications/trigger/payment-confirmation/${paymentId}`);
      toast.success('Payment confirmation notification triggered');
    } catch (error: any) {
      console.error('Failed to trigger payment confirmation:', error);
      toast.error('Failed to trigger notification');
      throw error;
    }
  }

  async triggerWelcomeNotification(userId: number): Promise<void> {
    try {
      await this.apiClient.post(`/notifications/trigger/welcome/${userId}`);
      toast.success('Welcome notification triggered');
    } catch (error: any) {
      console.error('Failed to trigger welcome notification:', error);
      toast.error('Failed to trigger notification');
      throw error;
    }
  }

  async triggerProductApprovalNotification(productId: number, approved: boolean): Promise<void> {
    try {
      await this.apiClient.post(`/notifications/trigger/product-approval/${productId}`, { approved });
      toast.success('Product approval notification triggered');
    } catch (error: any) {
      console.error('Failed to trigger product approval notification:', error);
      toast.error('Failed to trigger notification');
      throw error;
    }
  }
}

// Helper functions
export const getNotificationTypeIcon = (type: string): string => {
  const icons = {
    ORDER: '📦',
    PAYMENT: '💳',
    PRODUCT: '🛍️',
    SYSTEM: '⚙️',
    PROMOTION: '🎉',
    SECURITY: '🔒'
  };
  return icons[type as keyof typeof icons] || '📢';
};

export const getNotificationTypeColor = (type: string): string => {
  const colors = {
    ORDER: 'blue',
    PAYMENT: 'green',
    PRODUCT: 'purple',
    SYSTEM: 'gray',
    PROMOTION: 'orange',
    SECURITY: 'red'
  };
  return colors[type as keyof typeof colors] || 'gray';
};

export const formatNotificationTime = (timestamp: string): string => {
  const now = new Date();
  const notificationTime = new Date(timestamp);
  const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return notificationTime.toLocaleDateString();
};

export const getNotificationChannelIcon = (channel: string): string => {
  const icons = {
    PUSH: '📱',
    EMAIL: '📧',
    SMS: '💬',
    IN_APP: '🔔'
  };
  return icons[channel as keyof typeof icons] || '🔔';
};

// Create and export singleton instance
export const notificationAPI = new NotificationAPI();

// Export individual methods for convenience
export const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createNotification,
  createBulkNotification,
  getAllNotifications,
  getNotificationStats,
  processScheduledNotifications,
  triggerOrderConfirmation,
  triggerOrderStatusUpdate,
  triggerPaymentConfirmation,
  triggerWelcomeNotification,
  triggerProductApprovalNotification
} = notificationAPI;
