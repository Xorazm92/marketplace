import React, { useEffect, useState } from 'react';
import { Notification, useMantineTheme } from '@mantine/core';
import { IconWifiOff, IconWifi } from '@tabler/icons-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showNotification, setShowNotification] = useState(false);
  const theme = useMantineTheme();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    // Initial check
    setIsOnline(navigator.onLine);

    // Listen for connection changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showNotification) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
      <Notification
        icon={isOnline ? <IconWifi size={18} /> : <IconWifiOff size={18} />}
        color={isOnline ? 'green' : 'yellow'}
        title={isOnline ? 'Tarmoqga ulangan' : 'Tarmoq ulanmagan'}
        onClose={() => setShowNotification(false)}
        style={{ margin: 0, borderRadius: 0 }}
      >
        {isOnline 
          ? 'Internet ulanishi tiklandi'
          : 'Internet ulanmagan. Iltimos, ulanishingizni tekshiring.'}
      </Notification>
    </div>
  );
};
