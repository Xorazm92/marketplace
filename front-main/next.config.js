
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  compress: true,
  generateEtags: true,

  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeCss: false,
    scrollRestoration: true,
  },

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

  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:4000',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://0.0.0.0:4000',
    NEXT_PUBLIC_FRONTEND_URL: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://0.0.0.0:5000',
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || 'INBOLA Kids Marketplace',
    NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  },

  // Additional safety measures
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP'],
    optimizeCss: false,
    scrollRestoration: true,
    // Disable problematic features that might cause path issues
    turbo: undefined,
    serverComponentsExternalPackages: undefined,
  },

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
    ignoreDuringBuilds: false,
  },

  output: 'standalone',
  trailingSlash: false,
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // API rewrites
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://0.0.0.0:4000';
    
    // Validate backend URL
    if (!backendUrl || typeof backendUrl !== 'string') {
      console.warn('Backend URL is not properly configured, using default');
      const defaultUrl = 'http://0.0.0.0:4000';
      return [
        {
          source: '/api/auth/:path*',
          destination: '/api/auth/:path*',
        },
        {
          source: '/api/:path*',
          destination: `${defaultUrl}/api/:path*`,
        },
        {
          source: '/uploads/:path*',
          destination: `${defaultUrl}/uploads/:path*`,
        },
        {
          source: '/graphql',
          destination: `${defaultUrl}/graphql`,
        },
        {
          source: '/health',
          destination: `${defaultUrl}/health`,
        }
      ];
    }
    
    return [
      // Keep NextAuth routes handled by Next.js
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
      {
        source: '/graphql',
        destination: `${backendUrl}/graphql`,
      },
      {
        source: '/health',
        destination: `${backendUrl}/health`,
      }
    ];
  },

  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
    reactStrictMode: false,
  }),

  // Webpack konfiguratsiyasi
  webpack: (config, { dev, isServer }) => {
    // SVG support
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Development da cache ni o'chirish
    if (dev) {
      config.cache = false;
    }

    return config;
  },
};

module.exports = nextConfig;
