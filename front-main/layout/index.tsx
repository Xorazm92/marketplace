
import React, { ReactNode, useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { Navbar } from './Header/Navbar';
import { Footer } from '../components/marketplace/Footer';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { Toast } from '../components/ui/Toast';
import styles from './layout.module.scss';

// Types
interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  showHeader?: boolean;
  showFooter?: boolean;
  className?: string;
}

interface SEOProps {
  title: string;
  description: string;
}

// Components
const SEOHead: React.FC<SEOProps> = ({ title, description }) => (
  <Head>
    <title>{title}</title>
    <meta name="description" content={description} />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="index, follow" />
    <meta name="keywords" content="bolalar, o'yinchoqlar, kitoblar, ta'lim, xavfsizlik" />
    
    {/* Open Graph tags */}
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="INBOLA Kids" />
    
    {/* Twitter Card tags */}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    
    {/* Favicon */}
    <link rel="icon" href="/favicon.ico" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    
    {/* Fonts */}
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
  </Head>
);

const LoadingOverlay: React.FC = () => (
  <div className={styles.loadingOverlay}>
    <LoadingSpinner size="large" />
    <p>Yuklanmoqda...</p>
  </div>
);

// Main Layout Component
export const Layout: React.FC<LayoutProps> = ({
  children,
  title = 'INBOLA Kids - Bolalar uchun xavfsiz marketplace',
  description = 'Bolalar va ularning ota-onalari uchun mo\'ljallangan ta\'limiy va xavfsiz elektron tijorat platformasi',
  showHeader = true,
  showFooter = true,
  className = '',
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Router events handling
  useEffect(() => {
    const handleStart = () => setIsLoading(true);
    const handleComplete = () => setIsLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // PWA install prompt
  useEffect(() => {
    let deferredPrompt: any;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const layoutClasses = `${styles.layout} ${className}`;

  return (
    <ErrorBoundary>
      <SEOHead title={title} description={description} />
      
      <div className={layoutClasses}>
        {/* Loading Overlay */}
        {isLoading && <LoadingOverlay />}
        
        {/* Header */}
        {showHeader && (
          <header className={styles.header}>
            <Navbar />
          </header>
        )}
        
        {/* Main Content */}
        <main className={styles.main} role="main">
          {children}
        </main>
        
        {/* Footer */}
        {showFooter && (
          <footer className={styles.footer}>
            <Footer />
          </footer>
        )}
        
        {/* Toast Notifications */}
        <Toast />
        
        {/* Skip to main content for accessibility */}
        <a href="#main-content" className={styles.skipLink}>
          Asosiy mazmun
        </a>
      </div>
    </ErrorBoundary>
  );
};

export default Layout;
