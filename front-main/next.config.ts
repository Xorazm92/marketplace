
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React Strict Mode yoqish
  reactStrictMode: true,
  
  // Performance optimizatsiyalari
  poweredByHeader: false,
  compress: true,
  
  // Image optimizatsiyasi
  images: {
    domains: ['localhost', '0.0.0.0'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // API konfiguratsiyasi
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:4000'}/api/:path*`,
      },
    ];
  },
  
  // Headers xavfsizlik uchun
  async headers() {
    return [
      {
        source: '/(.*)',
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
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:4000',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://0.0.0.0:3000',
  },
  
  // Build konfiguratsiyasi
  experimental: {
    optimizeCss: true,
  },
  
  // ESLint konfiguratsiyasi
  eslint: {
    dirs: ['pages', 'components', 'layout', 'store', 'hooks', 'types', 'utils'],
  },
  
  // TypeScript konfiguratsiyasi
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
