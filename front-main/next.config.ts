
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,
  
  // Enable SWC minification
  swcMinify: true,
  
  // Optimize images
  images: {
    domains: ['localhost', 'inbola.uz', 'api.inbola.uz'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // PWA configuration
  experimental: {
    appDir: true,
  },
  
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://api.inbola.uz/api/:path*'
          : 'http://0.0.0.0:4000/api/:path*',
      },
    ];
  },
  
  // Headers for security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Bundle analyzer (only in development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config: any) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': __dirname,
      };
      return config;
    },
  }),
  
  // Compression
  compress: true,
  
  // Output configuration for production
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Enable static optimization
  trailingSlash: false,
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
