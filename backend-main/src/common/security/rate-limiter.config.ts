import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const rateLimiterConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      ttl: 3600000, // 1 hour
      limit: 1000, // 1000 requests per hour
    },
    {
      ttl: 86400000, // 1 day
      limit: 10000, // 10000 requests per day
    },
  ],
  ignoreUserAgents: [
    // Health check bots
    /health-check/i,
    /ping/i,
    // Search engine bots
    /googlebot/i,
    /bingbot/i,
    /yandex/i,
  ],
  storage: undefined, // Use default in-memory storage
};

// Specific rate limits for different endpoints
export const endpointRateLimits = {
  auth: {
    login: { ttl: 300000, limit: 5 }, // 5 attempts per 5 minutes
    register: { ttl: 3600000, limit: 3 }, // 3 registrations per hour
    forgotPassword: { ttl: 3600000, limit: 3 }, // 3 requests per hour
    resetPassword: { ttl: 300000, limit: 5 }, // 5 attempts per 5 minutes
  },
  api: {
    default: { ttl: 60000, limit: 100 }, // 100 requests per minute
    upload: { ttl: 60000, limit: 10 }, // 10 uploads per minute
    payment: { ttl: 60000, limit: 20 }, // 20 payment requests per minute
  },
  admin: {
    default: { ttl: 60000, limit: 200 }, // 200 requests per minute for admins
  },
};
