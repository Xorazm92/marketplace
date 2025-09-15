"use client";

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '../../layout/Header/Navbar';
import Footer from '../marketplace/Footer';
import { checkApiHealth } from '../../endpoints/instance';
import styles from './AppLayout.module.scss';

// Dynamic imports for better performance
const AdminLayout = dynamic(() => import('../admin/AdminLayout'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Admin panel yuklanmoqda...</div>
});

const KidsInterface = dynamic(() => import('../child-interface/KidsInterface'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Bolalar interfeysi yuklanmoqda...</div>
});

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [isKidsMode, setIsKidsMode] = useState(false);

  // Route-based layout detection
  const isAdminRoute = pathname.startsWith('/admin');
  const isAuthRoute = ['/login', '/sign-up'].includes(pathname);
  const isProfileRoute = pathname.startsWith('/profile');

  // API health check
  useEffect(() => {
    const checkApi = async () => {
      try {
        const isHealthy = await checkApiHealth();
        setApiStatus(isHealthy ? 'connected' : 'disconnected');
      } catch (error) {
        console.error('API health check error:', error);
        setApiStatus('disconnected');
      }
    };

    checkApi();
    
    // Periodic health check
    const interval = setInterval(checkApi, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Kids mode detection
  useEffect(() => {
    const kidsMode = localStorage.getItem('kids_mode') === 'true';
    setIsKidsMode(kidsMode);
  }, []);

  // API status indicator
  const ApiStatusIndicator = () => (
    <div className={`${styles.apiStatus} ${styles[apiStatus]}`}>
      <span className={styles.indicator}></span>
      <span className={styles.text}>
        {apiStatus === 'checking' && 'API tekshirilmoqda...'}
        {apiStatus === 'connected' && 'Server ulangan'}
        {apiStatus === 'disconnected' && 'Server uzilgan'}
      </span>
    </div>
  );

  // Loading component
  if (apiStatus === 'checking') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>INBOLA platformasi yuklanmoqda...</p>
        <ApiStatusIndicator />
      </div>
    );
  }

  // Admin layout
  if (isAdminRoute) {
    return (
      <>
        <AdminLayout>
          {children}
        </AdminLayout>
        <ApiStatusIndicator />
      </>
    );
  }

  // Kids mode layout
  if (isKidsMode && !isAuthRoute) {
    return (
      <>
        <div className="kids-mode-layout">
          <KidsInterface
            userAge={8}
            parentalControls={{
              dailySpendLimit: 100,
              allowedCategories: ['toys', 'books', 'education'],
              timeRestrictions: {
                start: '08:00',
                end: '20:00'
              }
            }}
            onProductSelect={(id) => console.log('Product selected:', id)}
          />
          {children}
        </div>
        <ApiStatusIndicator />
      </>
    );
  }

  // Default layout
  return (
    <div className={styles.layout}>
      {/* API Status Indicator */}
      <ApiStatusIndicator />

      {/* Navigation */}
      {!isAuthRoute && <Navbar />}

      {/* Main Content */}
      <main className={`${styles.main} ${isAuthRoute ? styles.authMain : ''}`}>
        {/* Connection Error Banner */}
        {apiStatus === 'disconnected' && (
          <div className={styles.errorBanner}>
            <span>⚠️ Server bilan aloqa yo'q. Ba'zi funksiyalar ishlamasligi mumkin.</span>
            <button onClick={() => window.location.reload()}>
              🔄 Qayta yuklash
            </button>
          </div>
        )}

        {children}
      </main>

      {/* Footer */}
      {!isAuthRoute && !isAdminRoute && (
        <Footer />
      )}
    </div>
  );
};

export default AppLayout;
