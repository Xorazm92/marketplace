
import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Navbar from './Header/Navbar';
import Footer from '../components/marketplace/Footer';
import { checkApiHealth } from '../endpoints/instance';
import styles from './layout.module.scss';

// Dynamic imports for better performance
const AdminLayout = dynamic(() => import('../components/admin/AdminLayout'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Admin panel yuklanmoqda...</div>
});

const KidsInterface = dynamic(() => import('../components/child-interface/KidsInterface'), {
  ssr: false,
  loading: () => <div className={styles.loading}>Bolalar interfeysi yuklanmoqda...</div>
});

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  noIndex?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'INBOLA Kids Marketplace',
  description = 'Bolalar va ota-onalar uchun xavfsiz va ta\'limiy elektron tijorat platformasi',
  keywords = 'bolalar, o\'yinchoq, kitob, ta\'lim, xavfsiz, marketplace',
  noIndex = false
}) => {
  const router = useRouter();
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

  // Page title generation
  const pageTitle = title !== 'INBOLA Kids Marketplace' 
    ? `${title} | INBOLA Kids Marketplace`
    : title;

  // Meta tags
  const metaTags = {
    title: pageTitle,
    description,
    keywords,
    'og:title': pageTitle,
    'og:description': description,
    'og:type': 'website',
    'og:url': typeof window !== 'undefined' ? window.location.href : '',
    'og:image': '/img/hero-kids.jpg',
    'twitter:card': 'summary_large_image',
    'twitter:title': pageTitle,
    'twitter:description': description,
    'twitter:image': '/img/hero-kids.jpg',
  };

  // API status indicator
  const ApiStatusIndicator = () => (
    <div className={`${styles.apiStatus} ${styles[apiStatus]}`}>
      <span className={styles.indicator}></span>
      <span className={styles.text}>
        {apiStatus === 'checking' && 'API tekshirilmoqda...'}
        {apiStatus === 'connected' && 'Server ulanган'}
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
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={description} />
          {noIndex && <meta name="robots" content="noindex,nofollow" />}
        </Head>
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
        <Head>
          <title>{pageTitle}</title>
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords} />
          {Object.entries(metaTags).map(([key, value]) => (
            <meta key={key} property={key} content={value} />
          ))}
        </Head>
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
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#FF6B6B" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Open Graph tags */}
        {Object.entries(metaTags).map(([key, value]) => (
          <meta key={key} property={key} content={value} />
        ))}
        
        {/* PWA meta tags */}
        <meta name="application-name" content="INBOLA" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="INBOLA" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {noIndex && <meta name="robots" content="noindex,nofollow" />}
      </Head>

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
    </>
  );
};

export default Layout;
