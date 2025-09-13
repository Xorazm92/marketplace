
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Joi from 'joi';

export interface EnvironmentVariables {
  // Database
  DATABASE_URL: string;
  
  // JWT
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_OTP_SECRET: string;
  ACCESS_TOKEN_TIME: string;
  REFRESH_TOKEN_TIME: string;
  
  // Server
  PORT: number;
  HOST: string;
  NODE_ENV: 'development' | 'production' | 'test';
  
  // Frontend
  FRONTEND_URL: string;
  CORS_ORIGIN: string;
  
  // File Upload
  MAX_FILE_SIZE: number;
  ALLOWED_FILE_TYPES: string;
  
  // Security
  RATE_LIMIT_WINDOW: number;
  RATE_LIMIT_MAX: number;
  SESSION_SECRET: string;
  
  // Child Safety
  MAX_CHILD_SPENDING: number;
  MAX_SESSION_TIME: number;
  CONTENT_FILTER_ENABLED: boolean;
  PARENTAL_APPROVAL_REQUIRED: boolean;
  
  // Payment
  STRIPE_SECRET_KEY: string;
  STRIPE_WEBHOOK_SECRET: string;
  PAYME_MERCHANT_ID: string;
  PAYME_SECRET_KEY: string;
  PAYME_BASE_URL: string;
  CLICK_MERCHANT_ID: string;
  CLICK_SECRET_KEY: string;
  CLICK_SERVICE_ID: string;
  CLICK_MERCHANT_USER_ID: string;
  CLICK_BASE_URL: string;
  UZUM_MERCHANT_ID: string;
  UZUM_SECRET_KEY: string;
  UZUM_API_KEY: string;
  UZUM_BASE_URL: string;
  UZUM_WEBHOOK_URL: string;
  
  // SMS
  SMS_API_KEY: string;
  SMS_API_SECRET: string;
  
  // Email
  SMTP_HOST: string;
  SMTP_PORT: number;
  SMTP_USER: string;
  SMTP_PASS: string;
  
  // Monitoring
  SENTRY_DSN: string;
  NEW_RELIC_LICENSE_KEY: string;
  
  // Redis
  REDIS_URL: string;
  
  // Google OAuth
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  
  // Telegram
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_BOT_USERNAME: string;
}

export const validationSchema = Joi.object({
  // Database
  DATABASE_URL: Joi.string().required(),
  
  // JWT
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  JWT_OTP_SECRET: Joi.string().min(32).required(),
  ACCESS_TOKEN_TIME: Joi.string().default('15m'),
  REFRESH_TOKEN_TIME: Joi.string().default('7d'),
  
  // Server
  PORT: Joi.number().port().default(4000),
  HOST: Joi.string().default('0.0.0.0'),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // Frontend
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  CORS_ORIGIN: Joi.string().default('http://localhost:3000'),
  
  // File Upload
  MAX_FILE_SIZE: Joi.number().default(10485760), // 10MB
  ALLOWED_FILE_TYPES: Joi.string().default('jpg,jpeg,png,gif,webp'),
  
  // Security
  RATE_LIMIT_WINDOW: Joi.number().default(900000), // 15 minutes
  RATE_LIMIT_MAX: Joi.number().default(100),
  SESSION_SECRET: Joi.string().min(32).required(),
  
  // Child Safety
  MAX_CHILD_SPENDING: Joi.number().default(500000),
  MAX_SESSION_TIME: Joi.number().default(7200),
  CONTENT_FILTER_ENABLED: Joi.boolean().default(true),
  PARENTAL_APPROVAL_REQUIRED: Joi.boolean().default(true),
  
  // Payment (optional)
  STRIPE_SECRET_KEY: Joi.string().optional(),
  STRIPE_WEBHOOK_SECRET: Joi.string().optional(),
  PAYME_MERCHANT_ID: Joi.string().optional(),
  PAYME_SECRET_KEY: Joi.string().optional(),
  PAYME_BASE_URL: Joi.string().uri().optional().default('https://checkout.paycom.uz'),
  CLICK_MERCHANT_ID: Joi.string().optional(),
  CLICK_SECRET_KEY: Joi.string().optional(),
  CLICK_SERVICE_ID: Joi.string().optional(),
  CLICK_MERCHANT_USER_ID: Joi.string().optional(),
  CLICK_BASE_URL: Joi.string().uri().optional().default('https://api.click.uz/v2'),
  UZUM_MERCHANT_ID: Joi.string().optional(),
  UZUM_SECRET_KEY: Joi.string().optional(),
  UZUM_API_KEY: Joi.string().optional(),
  UZUM_BASE_URL: Joi.string().uri().optional().default('https://api.uzum.uz/v1'),
  UZUM_WEBHOOK_URL: Joi.string().uri().optional(),
  
  // SMS (optional)
  SMS_API_KEY: Joi.string().optional(),
  SMS_API_SECRET: Joi.string().optional(),
  
  // Email (optional)
  SMTP_HOST: Joi.string().optional(),
  SMTP_PORT: Joi.number().port().optional(),
  SMTP_USER: Joi.string().optional(),
  SMTP_PASS: Joi.string().optional(),
  
  // Monitoring (optional)
  SENTRY_DSN: Joi.string().uri().optional(),
  NEW_RELIC_LICENSE_KEY: Joi.string().optional(),
  
  // Redis (optional)
  REDIS_URL: Joi.string().uri().optional(),
  
  // Google OAuth (optional)
  GOOGLE_CLIENT_ID: Joi.string().optional(),
  GOOGLE_CLIENT_SECRET: Joi.string().optional(),
  
  // Telegram (optional)
  TELEGRAM_BOT_TOKEN: Joi.string().optional(),
  TELEGRAM_BOT_USERNAME: Joi.string().optional(),
});

@Injectable()
export class EnvironmentConfig {
  constructor(private configService: ConfigService<EnvironmentVariables>) {}

  get<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] {
    const value = this.configService.get(key);
    if (value === undefined && this.isRequired(key)) {
      throw new Error(`Environment variable ${key} is required but not defined`);
    }
    return value;
  }

  getOptional<K extends keyof EnvironmentVariables>(key: K): EnvironmentVariables[K] | undefined {
    return this.configService.get(key);
  }

  private isRequired(key: keyof EnvironmentVariables): boolean {
    const requiredKeys: (keyof EnvironmentVariables)[] = [
      'DATABASE_URL',
      'JWT_ACCESS_SECRET',
      'JWT_REFRESH_SECRET',
      'JWT_OTP_SECRET',
      'SESSION_SECRET',
    ];
    return requiredKeys.includes(key);
  }

  // Convenience getters
  get isDevelopment(): boolean {
    return this.get('NODE_ENV') === 'development';
  }

  get isProduction(): boolean {
    return this.get('NODE_ENV') === 'production';
  }

  get isTest(): boolean {
    return this.get('NODE_ENV') === 'test';
  }

  get databaseUrl(): string {
    return this.get('DATABASE_URL');
  }

  get serverConfig() {
    return {
      port: this.get('PORT'),
      host: this.get('HOST'),
      environment: this.get('NODE_ENV'),
    };
  }

  get jwtConfig() {
    return {
      accessSecret: this.get('JWT_ACCESS_SECRET'),
      refreshSecret: this.get('JWT_REFRESH_SECRET'),
      otpSecret: this.get('JWT_OTP_SECRET'),
      accessTokenTime: this.get('ACCESS_TOKEN_TIME'),
      refreshTokenTime: this.get('REFRESH_TOKEN_TIME'),
    };
  }

  get corsConfig() {
    return {
      origin: this.get('CORS_ORIGIN').split(','),
      frontendUrl: this.get('FRONTEND_URL'),
    };
  }

  get securityConfig() {
    return {
      rateLimitWindow: this.get('RATE_LIMIT_WINDOW'),
      rateLimitMax: this.get('RATE_LIMIT_MAX'),
      sessionSecret: this.get('SESSION_SECRET'),
    };
  }

  get fileUploadConfig() {
    return {
      maxFileSize: this.get('MAX_FILE_SIZE'),
      allowedFileTypes: this.get('ALLOWED_FILE_TYPES').split(','),
    };
  }

  get childSafetyConfig() {
    return {
      maxSpending: this.get('MAX_CHILD_SPENDING'),
      maxSessionTime: this.get('MAX_SESSION_TIME'),
      contentFilterEnabled: this.get('CONTENT_FILTER_ENABLED'),
      parentalApprovalRequired: this.get('PARENTAL_APPROVAL_REQUIRED'),
    };
  }
}
