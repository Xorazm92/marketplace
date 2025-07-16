import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable React strict mode
  reactStrictMode: true,

  // Enable SWC minification
  swcMinify: true,

  // Optimize images
  images: {
    domains: ['localhost', '0.0.0.0', 'inbola.uz'],
    formats: ['image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://0.0.0.0:4000/api/:path*',
      },
    ];
  },

  // Compression
  compress: true,

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