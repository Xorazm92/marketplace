/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  // Webpack konfiguratsiya - ERR_INVALID_ARG_TYPE fix
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/.next/**',
          '**/app_backup/**'
        ],
      };
    }
    
    // Path aliaslar
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/pages': path.resolve(__dirname, './pages'),
      '@/styles': path.resolve(__dirname, './styles'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/utils': path.resolve(__dirname, './utils'),
      '@/services': path.resolve(__dirname, './services'),
      '@/types': path.resolve(__dirname, './types'),
    };
    
    // Path fallback
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      os: false,
    };
    
    return config;
  },
  
  // Pages Router sozlamalari
  swcMinify: false,
  
  // Images
  images: {
    domains: ['localhost', '127.0.0.1', 'api.inbola.uz'],
    unoptimized: true,
  },
  
  // Environment
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:4000',
  },
  
  // Development
  devIndicators: {
    buildActivity: false,
  },
  
  // Experimental
  experimental: {
    // turbo: false, // olib tashlandi
  },
}

module.exports = nextConfig;
