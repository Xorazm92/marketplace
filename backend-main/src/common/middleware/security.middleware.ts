import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly loggerService: LoggerService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    // Security headers
    this.setSecurityHeaders(res);
    
    // Log suspicious activities
    this.detectSuspiciousActivity(req);
    
    // Sanitize request
    this.sanitizeRequest(req);
    
    next();
  }

  private setSecurityHeaders(res: Response): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Enable XSS protection
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Strict transport security (HTTPS only)
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Content security policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:; connect-src 'self';"
    );
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Remove server information
    res.removeHeader('X-Powered-By');
  }

  private detectSuspiciousActivity(req: Request): void {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const userId = (req as any).user?.id;

    // Detect SQL injection attempts
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\'|\"|;|--|\*|\/\*|\*\/)/,
      /(\bOR\b|\bAND\b).*(\=|\<|\>)/i,
    ];

    const checkForSqlInjection = (value: string): boolean => {
      return sqlInjectionPatterns.some(pattern => pattern.test(value));
    };

    // Check URL, query parameters, and body for SQL injection
    const urlToCheck = req.url + JSON.stringify(req.query) + JSON.stringify(req.body);
    if (checkForSqlInjection(urlToCheck)) {
      this.loggerService.logSecurity('SQL Injection Attempt', ip, userAgent, userId, {
        url: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
      });
    }

    // Detect XSS attempts
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
    ];

    const checkForXss = (value: string): boolean => {
      return xssPatterns.some(pattern => pattern.test(value));
    };

    if (checkForXss(urlToCheck)) {
      this.loggerService.logSecurity('XSS Attempt', ip, userAgent, userId, {
        url: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
      });
    }

    // Detect suspicious user agents
    const suspiciousUserAgents = [
      /bot/i,
      /crawler/i,
      /spider/i,
      /scraper/i,
      /curl/i,
      /wget/i,
      /python/i,
      /php/i,
    ];

    if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
      this.loggerService.logSecurity('Suspicious User Agent', ip, userAgent, userId, {
        url: req.url,
        method: req.method,
      });
    }

    // Detect rapid requests (basic rate limiting detection)
    const requestKey = `${ip}:${userId || 'anonymous'}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 60; // 60 requests per minute

    if (!this.requestCounts) {
      this.requestCounts = new Map();
    }

    const requestData = this.requestCounts.get(requestKey) || { count: 0, resetTime: now + windowMs };
    
    if (now > requestData.resetTime) {
      requestData.count = 1;
      requestData.resetTime = now + windowMs;
    } else {
      requestData.count++;
    }

    this.requestCounts.set(requestKey, requestData);

    if (requestData.count > maxRequests) {
      this.loggerService.logSecurity('Rapid Requests Detected', ip, userAgent, userId, {
        requestCount: requestData.count,
        timeWindow: windowMs,
        url: req.url,
        method: req.method,
      });
    }

    // Detect unusual request patterns
    if (req.method === 'POST' && req.url.includes('..')) {
      this.loggerService.logSecurity('Directory Traversal Attempt', ip, userAgent, userId, {
        url: req.url,
        method: req.method,
      });
    }

    // Detect large payloads
    const contentLength = parseInt(req.get('Content-Length') || '0');
    if (contentLength > 10 * 1024 * 1024) { // 10MB
      this.loggerService.logSecurity('Large Payload Detected', ip, userAgent, userId, {
        contentLength,
        url: req.url,
        method: req.method,
      });
    }
  }

  private sanitizeRequest(req: Request): void {
    // Sanitize query parameters
    if (req.query) {
      req.query = this.sanitizeObject(req.query);
    }

    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }
  }

  private sanitizeObject(obj: any): any {
    if (typeof obj === 'string') {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = this.sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }

    return obj;
  }

  private sanitizeString(str: string): string {
    // Remove potentially dangerous characters
    return str
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  private requestCounts: Map<string, { count: number; resetTime: number }>;
}
