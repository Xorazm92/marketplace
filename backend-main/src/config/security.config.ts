import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';

@Injectable()
export class SecurityConfig {
  constructor(private readonly configService: ConfigService) {}

  // Rate Limiting Configuration
  getRateLimitConfig() {
    return rateLimit({
      windowMs: parseInt(this.configService.get('RATE_LIMIT_WINDOW', '900000')), // 15 minutes
      max: parseInt(this.configService.get('RATE_LIMIT_MAX', '100')), // limit each IP to 100 requests per windowMs
      message: {
        error: 'Juda ko\'p so\'rov yuborildi',
        message: 'Iltimos, bir oz kutib qayta urinib ko\'ring',
        statusCode: 429,
      },
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
      // Skip successful requests
      skipSuccessfulRequests: false,
      // Skip failed requests
      skipFailedRequests: false,
      // Custom key generator
      keyGenerator: (req) => {
        return req.ip || req.connection.remoteAddress || 'unknown';
      },
    });
  }

  // Strict Rate Limiting for Auth endpoints
  getAuthRateLimitConfig() {
    return rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth requests per windowMs
      message: {
        error: 'Juda ko\'p autentifikatsiya urinishi',
        message: 'Xavfsizlik uchun 15 daqiqa kutib qayta urinib ko\'ring',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
  }

  // Helmet Security Headers
  getHelmetConfig() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          scriptSrc: ["'self'"],
          connectSrc: ["'self'", 'https://api.eskiz.uz', 'https://notify.eskiz.uz'],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: this.configService.get('NODE_ENV') === 'production' ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true,
      },
      noSniff: true,
      frameguard: { action: 'deny' },
      xssFilter: true,
      referrerPolicy: { policy: 'same-origin' },
    });
  }

  // CORS Configuration
  getCorsConfig() {
    const allowedOrigins = this.configService.get('CORS_ORIGIN', 'http://localhost:3000').split(',');
    
    return {
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Development mode - allow localhost
        if (this.configService.get('NODE_ENV') === 'development' && 
            origin.includes('localhost')) {
          return callback(null, true);
        }
        
        return callback(new Error('CORS policy violation'), false);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token',
        'X-Forwarded-For',
        'X-Real-IP',
      ],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 86400, // 24 hours
    };
  }

  // Compression Configuration
  getCompressionConfig() {
    return compression({
      filter: (req, res) => {
        if (req.headers['x-no-compression']) {
          return false;
        }
        return compression.filter(req, res);
      },
      level: 6, // Compression level (1-9)
      threshold: 1024, // Only compress if size > 1KB
    });
  }

  // Input Validation Rules
  getValidationConfig() {
    return {
      // Global validation pipe options
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to DTO instances
      disableErrorMessages: this.configService.get('NODE_ENV') === 'production',
      validationError: {
        target: false, // Don't expose target object
        value: false, // Don't expose submitted values
      },
    };
  }

  // File Upload Security
  getFileUploadConfig() {
    return {
      limits: {
        fileSize: parseInt(this.configService.get('MAX_FILE_SIZE', '10485760')), // 10MB
        files: 5, // Maximum 5 files
        fields: 10, // Maximum 10 fields
      },
      fileFilter: (req, file, callback) => {
        const allowedTypes = this.configService.get('ALLOWED_FILE_TYPES', 'jpg,jpeg,png,gif,webp').split(',');
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        
        if (allowedTypes.includes(fileExtension)) {
          return callback(null, true);
        }
        
        return callback(new Error('Fayl turi ruxsat etilmagan'), false);
      },
    };
  }

  // JWT Security Configuration
  getJwtConfig() {
    return {
      secret: this.configService.get('ACCESS_TOKEN_KEY'),
      signOptions: {
        expiresIn: this.configService.get('ACCESS_TOKEN_TIME', '15m'),
        issuer: 'inbola.uz',
        audience: 'inbola-users',
        algorithm: 'HS256',
      },
      verifyOptions: {
        issuer: 'inbola.uz',
        audience: 'inbola-users',
        algorithms: ['HS256'],
        clockTolerance: 60, // 60 seconds tolerance for clock skew
      },
    };
  }

  // Password Security
  getPasswordConfig() {
    return {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false, // For user-friendly experience
      maxAttempts: 5,
      lockoutDuration: 15 * 60 * 1000, // 15 minutes
    };
  }

  // Session Security
  getSessionConfig() {
    return {
      secret: this.configService.get('SESSION_SECRET', 'inbola-session-secret'),
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: this.configService.get('NODE_ENV') === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'strict',
      },
    };
  }

  // Child Safety Configuration
  getChildSafetyConfig() {
    return {
      maxSpending: parseInt(this.configService.get('MAX_CHILD_SPENDING', '500000')), // 500,000 UZS
      maxSessionTime: parseInt(this.configService.get('MAX_SESSION_TIME', '7200')), // 2 hours
      contentFilterEnabled: this.configService.get('CONTENT_FILTER_ENABLED', 'true') === 'true',
      parentalApprovalRequired: this.configService.get('PARENTAL_APPROVAL_REQUIRED', 'true') === 'true',
      allowedCategories: ['toys', 'books', 'clothes', 'educational', 'sports', 'art'],
      blockedKeywords: ['adult', 'violence', 'weapon', 'alcohol', 'tobacco'],
    };
  }
}