
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { RateLimiterMemory } from 'rate-limiter-flexible';

@Injectable()
export class SecurityService {
  private rateLimiter: RateLimiterMemory;
  private loginAttemptLimiter: RateLimiterMemory;

  constructor(private configService: ConfigService) {
    // Rate limiting configuration
    this.rateLimiter = new RateLimiterMemory({
      points: 100, // Number of requests
      duration: 900, // Per 15 minutes
    });

    this.loginAttemptLimiter = new RateLimiterMemory({
      points: 5, // Number of attempts
      duration: 900, // Per 15 minutes
      blockDuration: 900, // Block for 15 minutes
    });
  }

  // Password security
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validatePasswordStrength(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // 2FA implementation
  generate2FASecret(userEmail: string): {
    secret: string;
    qrCodeUrl: string;
  } {
    const secret = speakeasy.generateSecret({
      name: `Kids Marketplace (${userEmail})`,
      issuer: 'Kids Marketplace',
    });

    return {
      secret: secret.base32,
      qrCodeUrl: secret.otpauth_url,
    };
  }

  async generateQRCode(secret: string): Promise<string> {
    return QRCode.toDataURL(secret);
  }

  verify2FAToken(token: string, secret: string): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window: 1,
    });
  }

  // Input sanitization
  sanitizeInput(input: string): string {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }

  // XSS Prevention
  escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // SQL Injection Prevention (for raw queries)
  escapeSQL(input: string): string {
    return input.replace(/['";\\]/g, '\\$&');
  }

  // Rate limiting methods
  async checkRateLimit(req: any): Promise<boolean> {
    try {
      await this.rateLimiter.consume(req.ip);
      return true;
    } catch {
      return false;
    }
  }

  async checkLoginAttempt(req: any): Promise<boolean> {
    try {
      await this.loginAttemptLimiter.consume(req.ip);
      return true;
    } catch {
      return false;
    }
  }

  // Session security
  generateSecureSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  // CSRF token generation
  generateCSRFToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }

  // Content filtering for children
  containsInappropriateContent(content: string): boolean {
    const inappropriateWords = [
      'violence', 'weapon', 'scary', 'horror', 'adult',
      'inappropriate', 'mature', 'explicit', 'harmful'
    ];

    const lowerContent = content.toLowerCase();
    return inappropriateWords.some(word => lowerContent.includes(word));
  }

  // Parental PIN validation
  async validateParentalPIN(pin: string, hashedPIN: string): Promise<boolean> {
    return bcrypt.compare(pin, hashedPIN);
  }

  async hashParentalPIN(pin: string): Promise<string> {
    return bcrypt.hash(pin, 10);
  }
}
