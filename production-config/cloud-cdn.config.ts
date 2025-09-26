// Production Cloud Storage & CDN Configuration
// AWS S3 + CloudFront + Cloudinary

export const cloudStorage = {
  // AWS S3 Configuration
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    bucket: process.env.AWS_S3_BUCKET || 'inbola-production',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || 'YOUR_AWS_ACCESS_KEY',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || 'YOUR_AWS_SECRET_KEY',
    cloudFront: {
      distributionId: process.env.CLOUDFRONT_DISTRIBUTION_ID || 'YOUR_DISTRIBUTION_ID',
      domain: process.env.CLOUDFRONT_DOMAIN || 'cdn.inbola.uz'
    },
    folders: {
      products: 'products/',
      avatars: 'avatars/',
      kyc: 'kyc/',
      categories: 'categories/',
      banners: 'banners/'
    },
    lifecycle: {
      standard: 30, // days to IA
      infrequent: 90, // days to Glacier
      archive: 365 // days to Deep Archive
    }
  },

  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'inbola',
    apiKey: process.env.CLOUDINARY_API_KEY || 'YOUR_CLOUDINARY_KEY',
    apiSecret: process.env.CLOUDINARY_API_SECRET || 'YOUR_CLOUDINARY_SECRET',
    baseUrl: 'https://res.cloudinary.com/inbola/',
    transformations: {
      thumbnail: 'w_300,h_300,c_fill',
      medium: 'w_600,h_600,c_fill',
      large: 'w_1200,h_1200,c_fill',
      hero: 'w_1920,h_1080,c_fill',
      avatar: 'w_200,h_200,c_fill,r_max'
    },
    formats: ['webp', 'avif', 'jpg', 'png'],
    quality: {
      auto: 'auto',
      eco: 'eco',
      good: 'good',
      best: 'best'
    }
  },

  // Image Optimization Settings
  optimization: {
    responsive: {
      breakpoints: [320, 480, 768, 1024, 1280, 1920],
      formats: ['webp', 'avif', 'jpg'],
      quality: 85
    },
    lazy: {
      threshold: 0.1,
      placeholder: 'blur',
      blurDataURL: true
    },
    compression: {
      jpeg: 85,
      png: 90,
      webp: 80,
      avif: 75
    }
  },

  // CDN Configuration
  cdn: {
    providers: {
      cloudflare: {
        zoneId: process.env.CLOUDFLARE_ZONE_ID || 'YOUR_ZONE_ID',
        apiToken: process.env.CLOUDFLARE_API_TOKEN || 'YOUR_API_TOKEN',
        cacheLevel: 'aggressive',
        browserCacheTtl: 31536000, // 1 year
        edgeCacheTtl: 86400 // 1 day
      },
      keycdn: {
        apiKey: process.env.KEYCDN_API_KEY || 'YOUR_KEYCDN_KEY',
        zoneId: process.env.KEYCDN_ZONE_ID || 'YOUR_KEYCDN_ZONE'
      }
    },
    domains: {
      images: 'https://cdn.inbola.uz',
      static: 'https://static.inbola.uz',
      api: 'https://api.inbola.uz'
    }
  }
};

// Image Upload Configuration
export const uploadConfig = {
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    fileCount: 10,
    supportedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
  },
  validation: {
    minWidth: 300,
    minHeight: 300,
    maxWidth: 4000,
    maxHeight: 4000,
    aspectRatio: {
      product: [1, 1],
      banner: [16, 9],
      avatar: [1, 1]
    }
  },
  processing: {
    resize: true,
    optimize: true,
    watermark: {
      enabled: true,
      text: 'INBOLA',
      position: 'bottom-right',
      opacity: 0.3
    }
  }
};

// Production Environment Variables
export const cloudEnvTemplate = `
# AWS S3 & CloudFront
AWS_REGION=us-east-1
AWS_S3_BUCKET=inbola-production
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
CLOUDFRONT_DISTRIBUTION_ID=your_distribution_id
CLOUDFRONT_DOMAIN=cdn.inbola.uz

# Cloudinary
CLOUDINARY_CLOUD_NAME=inbola
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Cloudflare
CLOUDFLARE_ZONE_ID=your_zone_id
CLOUDFLARE_API_TOKEN=your_api_token

# KeyCDN
KEYCDN_API_KEY=your_keycdn_api_key
KEYCDN_ZONE_ID=your_keycdn_zone

# Image Processing
IMAGE_QUALITY=85
IMAGE_COMPRESSION_LEVEL=8
WATERMARK_ENABLED=true
WATERMARK_TEXT=INBOLA
`;

// CDN Integration Functions
export const getOptimizedImageUrl = (imagePath: string, options: any = {}) => {
  const { width, height, format, quality, crop } = options;
  
  // Cloudinary URL construction
  if (process.env.NODE_ENV === 'production') {
    const transformations = [];
    
    if (width && height) {
      transformations.push(`w_${width},h_${height}`);
    }
    
    if (crop) {
      transformations.push(`c_${crop}`);
    }
    
    if (format) {
      transformations.push(`f_${format}`);
    }
    
    if (quality) {
      transformations.push(`q_${quality}`);
    }
    
    return `${cloudStorage.cloudinary.baseUrl}${transformations.join(',')}/${imagePath}`;
  }
  
  // Development fallback
  return `/uploads/${imagePath}`;
};

// Cache Invalidation
export const invalidateCache = async (paths: string[]) => {
  // CloudFront invalidation
  if (cloudStorage.s3.cloudFront.distributionId) {
    // AWS SDK implementation for cache invalidation
  }
  
  // Cloudinary cache invalidation
  if (cloudStorage.cloudinary.cloudName) {
    // Cloudinary API implementation
  }
  
  // Cloudflare cache purge
  if (cloudStorage.cdn.providers.cloudflare.zoneId) {
    // Cloudflare API implementation
  }
};

// Monitoring Configuration
export const monitoring = {
  storage: {
    alerts: {
      bucketSize: 80, // Alert at 80% capacity
      requestRate: 1000, // requests per minute
      errorRate: 5 // percentage
    },
    metrics: {
      bandwidth: true,
      requests: true,
      cacheHitRate: true,
      latency: true
    }
  },
  cdn: {
    uptime: {
      target: 99.9,
      checkInterval: 60 // seconds
    },
    performance: {
      ttfb: 200, // ms
      download: 1000, // ms
      cacheHit: 95 // percentage
    }
  }
};
