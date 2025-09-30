// @ts-nocheck
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { RedisService } from '../../redis/redis.service';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests: boolean;
  skipFailedRequests: boolean;
  keyGenerator?: (request: Request) => string;
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const config = this.getRateLimitConfig(context);
    
    if (!config) {
      return true;
    }

    const key = this.generateKey(request, config);
    const current = await this.getCurrentCount(key, config.windowMs);
    
    if (current >= config.maxRequests) {
      throw new ForbiddenException(
        `Rate limit exceeded. Maximum ${config.maxRequests} requests per ${config.windowMs}ms`,
      );
    }

    await this.incrementCount(key, config.windowMs);
    return true;
  }

  private getRateLimitConfig(context: ExecutionContext): RateLimitConfig | null {
    return this.reflector.get<RateLimitConfig>('rate-limit', context.getHandler());
  }

  private generateKey(request: Request, config: RateLimitConfig): string {
    if (config.keyGenerator) {
      return config.keyGenerator(request);
    }

    const identifier = this.getIdentifier(request);
    const endpoint = `${request.method}:${request.route?.path || request.url}`;
    return `rate-limit:${endpoint}:${identifier}`;
  }

  private getIdentifier(request: Request): string {
    // Try to get user ID from authenticated request
    if (request.user?.id) {
      return `user:${request.user.id}`;
    }

    // Use IP address for unauthenticated requests
    const ip = this.getClientIp(request);
    return `ip:${ip}`;
  }

  private getClientIp(request: Request): string {
    const forwarded = request.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return request.ip || request.connection.remoteAddress || 'unknown';
  }

  private async getCurrentCount(key: string, windowMs: number): Promise<number> {
    const count = await this.redis.get(key);
    return count ? parseInt(count, 10) : 0;
  }

  private async incrementCount(key: string, windowMs: number): Promise<void> {
    const multi = this.redis.multi();
    multi.incr(key);
    multi.expire(key, Math.ceil(windowMs / 1000));
    await multi.exec();
  }
}

// Rate limit decorators
export const RateLimit = (config: RateLimitConfig) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const reflector = new Reflector();
    reflector.set('rate-limit', config, descriptor.value);
  };
};

// Predefined rate limits
export const RateLimits = {
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  register: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  passwordReset: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  otp: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 3,
    skipSuccessfulRequests: false,
    skipFailedRequests: false,
  },
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    skipSuccessfulRequests: true,
    skipFailedRequests: false,
  },
};
