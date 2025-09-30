import React, { useEffect } from 'react';
import { Button, Group, Text, Card } from '@mantine/core';
import { IconDownload, IconX } from '@tabler/icons-react';
import { usePWA } from '../../hooks/usePWA';

export const InstallPrompt: React.FC = () => {
  const { isStandalone, showInstallPrompt, deferredPrompt } = usePWA();

  if (isStandalone || !showInstallPrompt) return null;

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
    }
  };

  const handleDismiss = () => {
    // Store in localStorage to not show again for 7 days
    localStorage.setItem('installPromptDismissed', new Date().toISOString());
    // This would typically be handled by the PWA hook
  };

  return (
    <Card
      style={{
        position: 'fixed',
        bottom: 20,
        left: 20,
        right: 20,
        zIndex: 1000,
        background: 'white',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        border: '1px solid #e0e0e0',
      }}
    >
      <Group position="apart" align="center">
        <div>
          <Text weight={600} size="sm">
            INBOLA ni mobil ilova sifatida o‘rnatish
          </Text>
          <Text size="xs" color="dimmed">
            Tezroq va qulay foydalanish uchun
          </Text>
        </div>
        <Group spacing="xs">
          <Button
            size="xs"
            leftIcon={<IconDownload size={14} />}
            onClick={handleInstall}
            variant="filled"
          >
            O‘rnatish
          </Button>
          <Button
            size="xs"
            leftIcon={<IconX size={14} />}
            onClick={handleDismiss}
            variant="subtle"
            color="gray"
          >
            Yopish
          </Button>
        </Group>
      </Group>
    </Card>
  );
};
