
// Service Worker registration and PWA utilities
export class PWAService {
  private static instance: PWAService;
  private swRegistration: ServiceWorkerRegistration | null = null;

  public static getInstance(): PWAService {
    if (!PWAService.instance) {
      PWAService.instance = new PWAService();
    }
    return PWAService.instance;
  }

  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.swRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('SW registered: ', this.swRegistration);
        
        // Check for updates
        this.swRegistration.addEventListener('updatefound', () => {
          this.handleUpdateFound();
        });
      } catch (registrationError) {
        console.log('SW registration failed: ', registrationError);
      }
    }
  }

  private handleUpdateFound(): void {
    const newWorker = this.swRegistration?.installing;
    if (newWorker) {
      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available
            this.showUpdateBanner();
          }
        }
      });
    }
  }

  private showUpdateBanner(): void {
    // Create update notification
    const banner = document.createElement('div');
    banner.id = 'update-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #4CAF50;
        color: white;
        padding: 16px;
        text-align: center;
        z-index: 9999;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
      ">
        <span>📱 Yangi versiya mavjud! </span>
        <button onclick="window.location.reload()" style="
          background: white;
          color: #4CAF50;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          margin-left: 10px;
          cursor: pointer;
        ">Yangilash</button>
        <button onclick="this.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 1px solid white;
          padding: 8px 16px;
          border-radius: 4px;
          margin-left: 10px;
          cursor: pointer;
        ">Keyinroq</button>
      </div>
    `;
    document.body.appendChild(banner);
  }

  // Push notification setup
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      return false;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.swRegistration) {
      console.log('Service worker not registered');
      return null;
    }

    try {
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Send subscription to backend
      await this.sendSubscriptionToServer(subscription);
      return subscription;
    } catch (error) {
      console.log('Error subscribing to push notifications:', error);
      return null;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.log('Error sending subscription to server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Install prompt handling
  private deferredPrompt: any = null;

  setupInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallBanner();
    });
  }

  private showInstallBanner(): void {
    const banner = document.createElement('div');
    banner.id = 'install-banner';
    banner.innerHTML = `
      <div style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 15px;
        text-align: center;
        z-index: 9999;
        box-shadow: 0 8px 25px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease-out;
      ">
        <div style="margin-bottom: 15px;">
          <span style="font-size: 24px;">📱</span>
          <strong style="display: block; margin-top: 8px;">Ilovani o'rnating!</strong>
          <p style="margin: 5px 0; opacity: 0.9;">Tezroq kirish va offline rejim uchun</p>
        </div>
        <button onclick="this.parentElement.dataset.action='install'" style="
          background: white;
          color: #667eea;
          border: none;
          padding: 12px 24px;
          border-radius: 25px;
          margin: 0 10px;
          cursor: pointer;
          font-weight: bold;
        ">O'rnatish</button>
        <button onclick="this.parentElement.remove()" style="
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 10px 20px;
          border-radius: 25px;
          margin: 0 10px;
          cursor: pointer;
        ">Yo'q, rahmat</button>
      </div>
    `;

    banner.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' && banner.dataset.action === 'install') {
        this.installApp();
        banner.remove();
      }
    });

    document.body.appendChild(banner);
  }

  async installApp(): Promise<void> {
    if (!this.deferredPrompt) return;

    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    this.deferredPrompt = null;
  }

  // Offline detection
  setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.showConnectionStatus('online');
    });

    window.addEventListener('offline', () => {
      this.showConnectionStatus('offline');
    });
  }

  private showConnectionStatus(status: 'online' | 'offline'): void {
    const banner = document.createElement('div');
    banner.innerHTML = `
      <div style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: ${status === 'online' ? '#4CAF50' : '#f44336'};
        color: white;
        padding: 12px;
        text-align: center;
        z-index: 9999;
        transition: transform 0.3s ease;
      ">
        ${status === 'online' ? '✅ Internet qayta ulandi' : '❌ Internet yo\'q - Offline rejim'}
      </div>
    `;
    
    document.body.appendChild(banner);
    
    setTimeout(() => {
      banner.remove();
    }, 3000);
  }

  // Cache management
  async clearCache(): Promise<void> {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }
  }

  async getCacheSize(): Promise<number> {
    if (!('storage' in navigator && 'estimate' in navigator.storage)) {
      return 0;
    }
    
    const estimate = await navigator.storage.estimate();
    return estimate.usage || 0;
  }
}

// Auto-initialize PWA features
if (typeof window !== 'undefined') {
  const pwaService = PWAService.getInstance();
  
  // Register service worker
  pwaService.registerServiceWorker();
  
  // Setup install prompt
  pwaService.setupInstallPrompt();
  
  // Setup offline detection
  pwaService.setupOfflineDetection();
  
  // Request notification permission after user interaction
  document.addEventListener('click', async () => {
    await pwaService.requestNotificationPermission();
  }, { once: true });
}

export default PWAService;
