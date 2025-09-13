
import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import * as validator from 'validator';
import * as DOMPurify from 'isomorphic-dompurify';

@Injectable()
export class ValidationService {
  
  // Sanitize HTML input
  sanitizeHtml(input: string): string {
    if (!input) return '';
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  }

  // Sanitize and validate text input
  sanitizeText(input: string, maxLength = 500): string {
    if (!input) return '';
    
    // Remove HTML tags and special characters
    let sanitized = this.sanitizeHtml(input);
    
    // Trim whitespace
    sanitized = sanitized.trim();
    
    // Check length
    if (sanitized.length > maxLength) {
      throw new BadRequestException(`Text exceeds maximum length of ${maxLength} characters`);
    }
    
    return sanitized;
  }

  // Validate and sanitize email
  validateEmail(email: string): string {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    
    const sanitized = validator.normalizeEmail(email);
    if (!sanitized || !validator.isEmail(sanitized)) {
      throw new BadRequestException('Invalid email format');
    }
    
    return sanitized;
  }

  // Validate phone number (Uzbek format)
  validatePhoneNumber(phone: string): string {
    if (!phone) {
      throw new BadRequestException('Phone number is required');
    }
    
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Check Uzbek phone format
    const uzbekPhoneRegex = /^998[0-9]{9}$/;
    if (!uzbekPhoneRegex.test(cleaned)) {
      throw new BadRequestException('Invalid Uzbek phone number format');
    }
    
    return `+${cleaned}`;
  }

  // Validate and sanitize URL
  validateUrl(url: string): string {
    if (!url) return '';
    
    if (!validator.isURL(url, { require_protocol: true })) {
      throw new BadRequestException('Invalid URL format');
    }
    
    return url;
  }

  // Validate numeric input
  validateNumber(value: any, min?: number, max?: number): number {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      throw new BadRequestException('Invalid number format');
    }
    
    if (min !== undefined && num < min) {
      throw new BadRequestException(`Number must be at least ${min}`);
    }
    
    if (max !== undefined && num > max) {
      throw new BadRequestException(`Number must not exceed ${max}`);
    }
    
    return num;
  }

  // Validate password strength
  validatePassword(password: string): void {
    if (!password) {
      throw new BadRequestException('Password is required');
    }
    
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter');
    }
    
    if (!/[a-z]/.test(password)) {
      throw new BadRequestException('Password must contain at least one lowercase letter');
    }
    
    if (!/\d/.test(password)) {
      throw new BadRequestException('Password must contain at least one number');
    }
  }

  // Check for SQL injection patterns
  detectSqlInjection(input: string): boolean {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
      /(\'|\"|;|--|\*|\/\*|\*\/)/,
      /(\bOR\b|\bAND\b).*(\=|\<|\>)/i,
      /(SCRIPT|IFRAME|OBJECT|EMBED|ONLOAD|ONERROR)/i
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input));
  }

  // Check for XSS patterns
  detectXss(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /<link/gi,
      /<meta/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Comprehensive input validation
  validateInput(input: string, type: 'text' | 'email' | 'phone' | 'url' | 'html' = 'text'): string {
    if (!input) return '';
    
    // Check for malicious patterns
    if (this.detectSqlInjection(input) || this.detectXss(input)) {
      throw new BadRequestException('Input contains potentially malicious content');
    }
    
    switch (type) {
      case 'email':
        return this.validateEmail(input);
      case 'phone':
        return this.validatePhoneNumber(input);
      case 'url':
        return this.validateUrl(input);
      case 'html':
        return this.sanitizeHtml(input);
      default:
        return this.sanitizeText(input);
    }
  }

  // Validate file upload
  validateFile(file: Express.Multer.File, allowedTypes: string[], maxSize: number): void {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    
    // Check file type
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    if (!fileExtension || !allowedTypes.includes(fileExtension)) {
      throw new BadRequestException(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
    }
    
    // Check file size
    if (file.size > maxSize) {
      throw new BadRequestException(`File size exceeds limit of ${maxSize / (1024 * 1024)}MB`);
    }
    
    // Check for malicious file names
    if (/[<>:"/\\|?*]/.test(file.originalname)) {
      throw new BadRequestException('Invalid file name');
    }
  }
}
