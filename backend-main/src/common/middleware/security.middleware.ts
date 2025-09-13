import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigService } from '@nestjs/config';
import { ValidationService } from '../services/validation.service';
import { WinstonLoggerService } from '../services/winston-logger.service';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private rateLimiter: any;
  private speedLimiter: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly validationService: ValidationService,
    private readonly loggerService: WinstonLoggerService,
  ) {
    this.setupRateLimiting();
  }

  private setupRateLimiting() {
    // Rate limiting
    this.rateLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        error: 'Too many requests',
        message: 'Please try again later',
        statusCode: 429,
      },
      standardHeaders: true,
      legacyHeaders: false,
    });

    // Speed limiting (progressive delay)
    this.speedLimiter = slowDown({
      windowMs: 15 * 60 * 1000, // 15 minutes
      delayAfter: 50, // allow 50 requests per windowMs without delay
      delayMs: 500, // add 500ms delay per request after delayAfter
      maxDelayMs: 20000, // max delay of 20 seconds
    });
  }

  use(req: Request, res: Response, next: NextFunction): void {
    try {
      // Apply rate limiting
      this.rateLimiter(req, res, (err) => {
        if (err) {
          this.logSecurityEvent('Rate Limit Exceeded', req);
          return;
        }

        // Apply speed limiting
        this.speedLimiter(req, res, (err) => {
          if (err) {
            this.logSecurityEvent('Speed Limit Exceeded', req);
            return;
          }

          // Security headers
          this.setSecurityHeaders(res);

          // Input validation and sanitization
          this.validateAndSanitizeRequest(req);

          // Security monitoring
          this.monitorSecurityThreats(req);

          next();
        });
      });
    } catch (error) {
      this.logger.error('Security middleware error:', error);
      this.logSecurityEvent('Security Middleware Error', req, { error: error.message });
      next();
    }
  }

  private setSecurityHeaders(res: Response): void {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // XSS Protection
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' https:; " +
      "font-src 'self' https:; " +
      "object-src 'none'; " +
      "media-src 'self'; " +
      "frame-src 'none';"
    );

    // HSTS (HTTP Strict Transport Security)
    if (this.configService.get('NODE_ENV') === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    // Permissions Policy
    res.setHeader('Permissions-Policy', 
      'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()'
    );
  }

  private validateAndSanitizeRequest(req: Request): void {
    // Sanitize query parameters
    if (req.query) {
      for (const [key, value] of Object.entries(req.query)) {
        if (typeof value === 'string') {
          req.query[key] = this.validationService.validateInput(value, 'text');
        }
      }
    }

    // Sanitize URL parameters
    if (req.params) {
      for (const [key, value] of Object.entries(req.params)) {
        if (typeof value === 'string') {
          req.params[key] = this.validationService.validateInput(value, 'text');
        }
      }
    }

    // Sanitize request body (for non-file uploads)
    if (req.body && typeof req.body === 'object' && !req.files) {
      this.sanitizeObject(req.body);
    }
  }

  private sanitizeObject(obj: any): void {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        obj[key] = this.validationService.validateInput(value, 'text');
      } else if (typeof value === 'object' && value !== null) {
        this.sanitizeObject(value);
      }
    }
  }

  private monitorSecurityThreats(req: Request): void {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const userId = (req as any).user?.id;

    // Detect SQL injection attempts
    const urlToCheck = req.url + JSON.stringify(req.query) + JSON.stringify(req.body);
    if (this.validationService.detectSqlInjection(urlToCheck)) {
      this.logSecurityEvent('SQL Injection Attempt', req, {
        url: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
      });
    }

    // Detect XSS attempts
    if (this.validationService.detectXss(urlToCheck)) {
      this.logSecurityEvent('XSS Attempt', req, {
        url: req.url,
        method: req.method,
        query: req.query,
        body: req.body,
      });
    }

    // Detect suspicious user agents
    const suspiciousUserAgents = [
      /bot/i, /crawler/i, /spider/i, /scraper/i,
      /curl/i, /wget/i, /python/i, /php/i,
    ];

    if (suspiciousUserAgents.some(pattern => pattern.test(userAgent))) {
      this.logSecurityEvent('Suspicious User Agent', req, {
        url: req.url,
        method: req.method,
      });
    }

    // Detect path traversal attempts
    if (/\.\.\/|\.\.\\|%2e%2e%2f|%2e%2e%5c/i.test(req.url)) {
      this.logSecurityEvent('Path Traversal Attempt', req);
    }

    // Detect unusual request patterns
    if (req.url.length > 2000) {
      this.logSecurityEvent('Unusually Long URL', req);
    }

    // Monitor for brute force attempts
    if (req.url.includes('/auth/') && req.method === 'POST') {
      this.monitorBruteForceAttempts(ip, userId);
    }
  }

  private monitorBruteForceAttempts(ip: string, userId?: number): void {
    // This would typically use Redis or a similar store
    // For now, we'll just log the attempt
    this.loggerService.security('Potential Brute Force', 'medium', {
      ip,
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  private logSecurityEvent(event: string, req: Request, additionalData?: any): void {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || '';
    const userId = (req as any).user?.id;

    this.loggerService.security(event, 'medium', {
      ip,
      userAgent,
      userId,
      url: req.url,
      method: req.method,
      timestamp: new Date().toISOString(),
      ...additionalData,
    });

    this.logger.warn(`Security Event: ${event}`, {
      ip,
      userAgent,
      userId,
      url: req.url,
      method: req.method,
    });
  }
}