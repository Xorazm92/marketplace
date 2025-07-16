
import React, { ReactNode } from 'react';
import Head from 'next/head';
import Header from '../components/marketplace/Header';
import Footer from '../components/marketplace/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'INBOLA - Kids Marketplace',
  description = 'Safe and fun marketplace for children and families',
  keywords = 'kids marketplace, children products, safe shopping, family'
}) => {
  return (
    <>
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
      
      <div id="layout-wrapper">
        <Header />
        <main id="main-content" role="main">
          {children}
        </main>
        <Footer />
        
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </>
  );
};

export default Layout;
