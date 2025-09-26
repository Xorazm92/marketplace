import { toast } from "react-toastify";

export enum NotificationType {
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_SHIPPED = 'order_shipped',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed'
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

class NotificationService {
  private readonly STORAGE_KEY = 'inbola_notifications';

  getStoredNotifications(): Notification[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  showNotification(type: NotificationType, title: string, message: string): void {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };

    const notifications = this.getStoredNotifications();
    notifications.unshift(notification);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notifications.slice(0, 50)));

    // Show toast
    switch (type) {
      case NotificationType.ORDER_CONFIRMED:
        toast.success(message);
        break;
      case NotificationType.PAYMENT_FAILED:
        toast.error(message);
        break;
      default:
        toast.info(message);
    }
  }

  async sendSMS(phone: string, message: string): Promise<boolean> {
    try {
      // Mock SMS sending
      console.log(`SMS to ${phone}: ${message}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async notifyOrderConfirmed(orderId: string, phone: string): Promise<void> {
    const message = `Buyurtma #${orderId} tasdiqlandi`;
    this.showNotification(NotificationType.ORDER_CONFIRMED, 'Buyurtma tasdiqlandi', message);
    await this.sendSMS(phone, `INBOLA: ${message}`);
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  }
}

export const notificationService = new NotificationService();

// Notification service functions
export const requestPermission = async (): Promise<void> => {
  try {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      console.log('Notification permission:', permission);
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
  }
};

export const getNotificationCount = async (): Promise<number> => {
  try {
    // Mock implementation
    return 0;
  } catch (error) {
    console.error('Error getting notification count:', error);
    return 0;
  }
};

export default notificationService;
