/**
 * Centralized configuration for INBOLA Kids Marketplace
 * Consolidates all environment variables and configuration settings
 */

export const config = {
  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // URLs and Endpoints
  urls: {
    frontend: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    backend: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000',
    api: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1',
    graphql: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || 'http://localhost:4000/graphql',
    cdn: process.env.NEXT_PUBLIC_CDN_URL || 'http://localhost:4000/uploads',
  },
  
  // Authentication
  auth: {
    jwtSecret: process.env.NEXT_PUBLIC_JWT_SECRET || 'default-secret',
    jwtExpires: process.env.NEXT_PUBLIC_JWT_EXPIRES || '7d',
  },
  
  // Analytics and Monitoring
  analytics: {
    googleAnalyticsId: process.env.NEXT_PUBLIC_ANALYTICS_ID,
    enableTracking: !!process.env.NEXT_PUBLIC_ANALYTICS_ID,
  },
  
  // Feature Flags
  features: {
    enablePWA: process.env.NEXT_PUBLIC_ENABLE_PWA === 'true',
    enableChat: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
    enableNotifications: process.env.NEXT_PUBLIC_ENABLE_NOTIFICATIONS === 'true',
    enablePayments: process.env.NEXT_PUBLIC_PAYMENT_ENABLED === 'true',
    mockApi: process.env.NEXT_PUBLIC_MOCK_API === 'true',
    showDevTools: process.env.NEXT_PUBLIC_SHOW_DEV_TOOLS === 'true',
  },
  
  // Business Settings
  business: {
    name: 'INBOLA Kids Marketplace',
    currency: process.env.NEXT_PUBLIC_CURRENCY_DEFAULT || 'UZS',
    supportedLanguages: ['uz', 'ru', 'en'],
    defaultLanguage: 'uz',
  },
  
  // Contact Information
  contact: {
    phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+998711234567',
    email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@inbola.uz',
    address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'Tashkent, Uzbekistan',
  },
  
  // Social Media
  social: {
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || 'https://facebook.com/inbola.uz',
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || 'https://instagram.com/inbola.uz',
    telegram: process.env.NEXT_PUBLIC_SOCIAL_TELEGRAM || 'https://t.me/inbola_uz',
  },
  
  // Performance and SEO
  seo: {
    defaultTitle: 'INBOLA Kids Marketplace',
    defaultDescription: 'Bolalar va ota-onalar uchun xavfsiz va ta\'limiy elektron tijorat platformasi',
    defaultKeywords: 'bolalar, o\'yinchoq, kitob, ta\'lim, xavfsiz, marketplace',
    ogImage: '/img/og-inbola-marketplace.jpg',
  },
  
  // Debug and Development
  debug: {
    enabled: process.env.NEXT_PUBLIC_DEBUG_MODE === 'true',
    logLevel: process.env.NEXT_PUBLIC_LOG_LEVEL || 'info',
  },
  
  // Images and Media
  images: {
    domains: [
      'localhost',
      'inbola.uz',
      process.env.NEXT_PUBLIC_IMAGES_DOMAIN,
    ].filter(Boolean),
    placeholder: '/img/placeholder.jpg',
  },
  
  // API Configuration
  api: {
    timeout: 30000,
    retries: 3,
    rateLimit: {
      requests: 1000,
      window: 60000, // 1 minute
    },
  },
  
  // Cache Configuration
  cache: {
    defaultTTL: 3600, // 1 hour
    staticTTL: 86400, // 24 hours
    apiTTL: 300, // 5 minutes
  },
} as const;

// Helper functions
export const getApiUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.urls.api}${cleanPath}`;
};

export const getImageUrl = (path: string): string => {
  if (!path) return config.images.placeholder;
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${config.urls.cdn}${cleanPath}`;
};

export const isFeatureEnabled = (feature: keyof typeof config.features): boolean => {
  return config.features[feature] === true;
};

export default config;