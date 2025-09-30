import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMediaQuery } from '@mantine/hooks';
import { MantineProvider } from '@mantine/core';
import { NotificationsProvider } from '@mantine/notifications';
import { theme } from '../../theme';
import { MobileBottomNav } from './MobileBottomNav';
import { MobileHeader } from './MobileHeader';
import { InstallPrompt } from './InstallPrompt';
import { OfflineIndicator } from './OfflineIndicator';
import { usePWA } from '../../hooks/usePWA';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = 'INBOLA Marketplace',
  description = 'O\'zbekistonning eng yaxshi online bozor platformasi',
}) => {
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { isStandalone, installPrompt, showInstallPrompt } = usePWA();

  // PWA installation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Add to home screen prompt
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        installPrompt.current = e;
        showInstallPrompt(true);
      });

      // App installed
      window.addEventListener('appinstalled', () => {
        showInstallPrompt(false);
      });
    }
  }, [installPrompt, showInstallPrompt]);

  // Mobile viewport optimization
  useEffect(() => {
    if (isMobile) {
      // Prevent zoom on input focus
      const inputs = document.querySelectorAll('input, textarea, select');
      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          document.body.style.zoom = '1';
        });
        input.addEventListener('blur', () => {
          document.body.style.zoom = '';
        });
      });
    }
  }, [isMobile]);

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="INBOLA" />
        <link rel="manifest" href="/app-manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="INBOLA" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
        
        {/* iOS specific */}
        <link rel="apple-touch-startup-image" href="/splash/iphone5_splash.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphone6_splash.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphoneplus_splash.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphonex_splash.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/iphonexr_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/iphonexsmax_splash.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash/ipad_splash.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipadpro1_splash.png" media="(device-width: 834px) and (device-height: 1112px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipadpro3_splash.png" media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash/ipadpro2_splash.png" media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)" />
      </Head>

      <MantineProvider theme={theme}>
        <NotificationsProvider>
          <div className="mobile-layout">
            {/* Mobile Header */}
            {isStandalone && <MobileHeader />}
            
            {/* Main Content */}
            <main className="mobile-content">
              {children}
            </main>
            
            {/* Mobile Bottom Navigation */}
            {isMobile && <MobileBottomNav />}
            
            {/* PWA Components */}
            <InstallPrompt />
            <OfflineIndicator />
          </div>
        </NotificationsProvider>
      </MantineProvider>

      <style jsx global>{`
        .mobile-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .mobile-content {
          flex: 1;
          padding-bottom: ${isMobile ? '60px' : '0'};
          padding-top: ${isStandalone ? '60px' : '0'};
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
          html {
            -webkit-text-size-adjust: 100%;
            -webkit-tap-highlight-color: transparent;
          }
          
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            user-select: none;
          }
          
          input, textarea, select {
            -webkit-user-select: text;
            user-select: text;
          }
        }
      `}</style>
    </>
  );
};
