import { getAuthToken } from './auth';

export class PushNotificationService {
  private registration: ServiceWorkerRegistration | null = null;
  private permission: NotificationPermission = 'default';

  constructor() {
    this.initializeServiceWorker();
  }

  async initializeServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker registered:', this.registration);
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return 'denied';
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  async subscribeToPushNotifications() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Push notifications not supported');
      return null;
    }

    if (this.permission !== 'granted') {
      await this.requestNotificationPermission();
    }

    if (this.permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    try {
      const subscription = await this.registration?.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      if (subscription) {
        await this.saveSubscription(subscription);
        return subscription;
      }
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw error;
    }

    return null;
  }

  private async saveSubscription(subscription: PushSubscription) {
    const token = getAuthToken();
    
    await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
      }),
    });
  }

  async unsubscribeFromPushNotifications() {
    if (!this.registration) return;

    const subscription = await this.registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      
      const token = getAuthToken();
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
    }
  }

  async showNotification(title: string, options: NotificationOptions) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    if ('serviceWorker' in navigator && this.registration) {
      this.registration.showNotification(title, {
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        ...options,
      });
    } else {
      new Notification(title, {
        icon: '/icons/icon-192x192.png',
        ...options,
      });
    }
  }

  async sendTestNotification() {
    await this.showNotification('INBOLA', {
      body: 'Push notifications are working!',
      tag: 'test-notification',
      actions: [
        {
          action: 'view',
          title: 'View App',
        },
      ],
    });
  }

  async handlePushMessage(event: PushEvent) {
    const data = event.data?.json() || {};
    
    const options = {
      body: data.body || 'New notification',
      icon: data.icon || '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: data.tag || 'general',
      data: data.data || {},
      actions: data.actions || [],
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'INBOLA', options)
    );
  }

  async isSubscribed(): Promise<boolean> {
    if (!this.registration) return false;
    
    const subscription = await this.registration.pushManager.getSubscription();
    return subscription !== null;
  }
}

export const pushNotificationService = new PushNotificationService();
