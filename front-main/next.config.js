/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: ['localhost', '127.0.0.1', 'api.inbola.uz']
  },
  
  // Webpack konfiguratsiyasi - asosiy yechim
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      }
    }
    
    // Path muammosini hal qilish
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      path: false,
      net: false,
      tls: false,
      crypto: false,
      stream: false,
      os: false,
    }
    
    return config
  },
  
  // Experimental sozlamalar
  experimental: {
    turbo: false,
    serverComponentsExternalPackages: [],
  },
  
  // Development sozlamalari
  devIndicators: {
    buildActivity: false,
  },
  
  // Build sozlamalari
  swcMinify: false,
  
  // Env variables
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:4000',
  },
}

module.exports = nextConfig
