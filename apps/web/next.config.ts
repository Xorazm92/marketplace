
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // React Strict Mode
  reactStrictMode: true,
  
  // Performance optimizatsiyalari
  poweredByHeader: false,
  compress: true,
  
  // Experimental features
  experimental: {
    optimizePackageImports: ['@tabler/icons-react', 'react-icons'],
    webVitalsAttribution: ['CLS', 'LCP'],
  },



  // Server external packages
  serverExternalPackages: ['@apollo/client'],

  // Image optimizatsiyasi
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '0.0.0.0',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      }
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack konfiguratsiyasi
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // GraphQL konfiguratsiyasi
    config.module.rules.push({
      test: /\.(graphql|gql)$/,
      exclude: /node_modules/,
      loader: 'graphql-tag/loader',
    });

    // SVG konfiguratsiyasi
    config.module.rules.push({
      test: /\.svg$/i,
      issuer: /\.[jt]sx?$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // API rewrites
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
      {
        source: '/graphql',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/graphql`,
      },
      {
        source: '/health',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/health`,
      }
    ];
  },

  // Security headers
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/profile/index',
        permanent: true,
      }
    ];
  },

  // Environment variables
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3002',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'INBOLA Kids Marketplace',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // ESLint konfiguratsiyasi
  eslint: {
    dirs: [
      'pages',
      'components',
      'layout',
      'store',
      'hooks',
      'types',
      'utils',
      'app',
      'endpoints'
    ],
    ignoreDuringBuilds: true,
  },

  // TypeScript konfiguratsiyasi
  typescript: {
    ignoreBuildErrors: true,
    tsconfigPath: './tsconfig.json',
  },

  // Output konfiguratsiyasi
  output: 'standalone',
  
  // Trailing slash
  trailingSlash: false,

  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Development konfiguratsiyasi
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
};

export default nextConfig;
