import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import 'reflect-metadata';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private store: RateLimitStore = {};

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
    // Get rate limit configuration from decorator or use defaults
    const limit = this.reflector.get<number>('rateLimit', context.getHandler()) || 100;
    const windowMs = this.reflector.get<number>('rateLimitWindow', context.getHandler()) || 15 * 60 * 1000; // 15 minutes
    
    const key = this.generateKey(request);
    const now = Date.now();
    
    // Clean up expired entries
    this.cleanup();
    
    if (!this.store[key]) {
      this.store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return true;
    }
    
    const entry = this.store[key];
    
    // Reset if window has expired
    if (now > entry.resetTime) {
      entry.count = 1;
      entry.resetTime = now + windowMs;
      return true;
    }
    
    // Check if limit exceeded
    if (entry.count >= limit) {
      throw new HttpException(
        {
          message: 'So\'rovlar soni limitdan oshdi. Iltimos, keyinroq urinib ko\'ring.',
          error: 'Too Many Requests',
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          retryAfter: Math.ceil((entry.resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    
    entry.count++;
    return true;
  }

  private generateKey(request: Request): string {
    // Use IP address and user ID (if authenticated) to create unique key
    const ip = request.ip || request.connection.remoteAddress;
    const userId = (request as any).user?.id;
    const endpoint = `${request.method}:${request.route?.path || request.path}`;
    
    return `${ip}:${userId || 'anonymous'}:${endpoint}`;
  }

  private cleanup(): void {
    const now = Date.now();
    Object.keys(this.store).forEach(key => {
      if (now > this.store[key].resetTime) {
        delete this.store[key];
      }
    });
  }
}

// Decorator for setting rate limits
export const RateLimit = (limit: number, windowMs?: number) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('rateLimit', limit, descriptor.value);
    if (windowMs) {
      Reflect.defineMetadata('rateLimitWindow', windowMs, descriptor.value);
    }
  };
};
