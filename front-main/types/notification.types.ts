export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  is_read: boolean;
  action_url?: string;
  metadata?: any;
  scheduled_at?: string;
  sent_at?: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
  };
}

export type NotificationType = 'ORDER' | 'PAYMENT' | 'PRODUCT' | 'SYSTEM' | 'PROMOTION' | 'SECURITY';
export type NotificationChannel = 'PUSH' | 'EMAIL' | 'SMS' | 'IN_APP';

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  user_id: number;
  action_url?: string;
  metadata?: any;
  scheduled_at?: string;
}

export interface BulkNotificationDto {
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  user_ids: number[];
  action_url?: string;
  metadata?: any;
  scheduled_at?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationStats {
  total: number;
  sent: number;
  pending: number;
  byType: Record<NotificationType, number>;
}

export interface UnreadCountResponse {
  count: number;
}

// Notification preferences
export interface NotificationPreferences {
  email_enabled: boolean;
  push_enabled: boolean;
  sms_enabled: boolean;
  order_notifications: boolean;
  payment_notifications: boolean;
  product_notifications: boolean;
  system_notifications: boolean;
  promotion_notifications: boolean;
  security_notifications: boolean;
}

// Real-time notification event
export interface NotificationEvent {
  userId: number;
  notification: Notification;
}

// Notification filter options
export interface NotificationFilters {
  type?: NotificationType;
  channel?: NotificationChannel;
  is_read?: boolean;
  date_from?: string;
  date_to?: string;
}
