import { useState, useEffect, useRef } from 'react';

interface PWAState {
  isStandalone: boolean;
  isOnline: boolean;
  installPrompt: React.MutableRefObject<any>;
  showInstallPrompt: boolean;
  deferredPrompt: any;
}

export const usePWA = (): PWAState => {
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const installPrompt = useRef<any>(null);
  const deferredPrompt = useRef<any>(null);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandaloneMode = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                        (window.navigator as any).standalone ||
                        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    checkStandaloneMode();

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    mediaQuery.addEventListener('change', checkStandaloneMode);

    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setShowInstallPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // App installed
    const handleAppInstalled = () => {
      setShowInstallPrompt(false);
      deferredPrompt.current = null;
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      mediaQuery.removeEventListener('change', checkStandaloneMode);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (deferredPrompt.current) {
      deferredPrompt.current.prompt();
      const { outcome } = await deferredPrompt.current.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      deferredPrompt.current = null;
      setShowInstallPrompt(false);
    }
  };

  return {
    isStandalone,
    isOnline,
    installPrompt,
    showInstallPrompt,
    deferredPrompt: deferredPrompt.current,
  };
};
