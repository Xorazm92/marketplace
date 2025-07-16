import React from 'react';
import { Navbar } from './Header/Navbar';
import styles from './layout.module.scss';
import Head from 'next/head';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({ children,  title = 'INBOLA - Kids Marketplace',
  description = 'Safe and fun marketplace for children and families',
  keywords = 'kids marketplace, children products, safe shopping, family' }) => {
  return (
    <div className={styles.layout}>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://inbola.uz" />
        <meta property="og:image" content="/img/hero-kids.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content="/img/hero-kids.jpg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/AppStore.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#f56500" />
      </Head>
      <Navbar />
      <main className={styles.main}>
        {children}
      </main>
    </div>
  );
};

export default Layout;