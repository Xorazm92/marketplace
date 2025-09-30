// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WinstonLoggerService } from './winston-logger.service';
import { PrometheusMetricsService } from './prometheus-metrics.service';

interface SecurityEvent {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  ip: string;
  userAgent?: string;
  details: any;
  timestamp: Date;
}

interface RiskAssessment {
  score: number; // 0-100
  factors: string[];
  recommendation: string;
}

@Injectable()
export class SecurityMonitorService {
  private readonly logger = new Logger(SecurityMonitorService.name);
  private readonly suspiciousIPs = new Set<string>();
  private readonly rateLimitTracker = new Map<string, number[]>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly winstonLogger: WinstonLoggerService,
    private readonly metricsService: PrometheusMetricsService,
  ) {
    this.startSecurityMonitoring();
  }

  private startSecurityMonitoring() {
    // Clean up old rate limit data every minute
    setInterval(() => {
      this.cleanupRateLimitData();
    }, 60000);

    // Analyze security patterns every 5 minutes
    setInterval(() => {
      this.analyzeSecurityPatterns();
    }, 300000);
  }

  // Authentication Security
  async recordAuthAttempt(
    method: string,
    success: boolean,
    ip: string,
    userAgent: string,
    userId?: string,
    failureReason?: string
  ) {
    const status = success ? 'success' : 'failed';
    const ipCountry = await this.getIPCountry(ip);

    // Record metrics
    this.metricsService.recordAuthAttempt(method, status, ipCountry);

    // Log the event
    if (success) {
      this.winstonLogger.logBusinessEvent('auth_success', {
        method,
        userId,
        ip,
        ipCountry,
      });
    } else {
      this.winstonLogger.logAuthFailure(method, ip, failureReason || 'unknown');
      
      // Check for brute force attempts
      await this.checkBruteForceAttempt(ip, method);
    }

    // Risk assessment for failed attempts
    if (!success) {
      const riskScore = await this.assessAuthRisk(ip, method, failureReason);
      if (riskScore > 70) {
        await this.handleHighRiskAuth(ip, method, riskScore);
      }
    }
  }

  // Suspicious Activity Detection
  async detectSuspiciousActivity(
    activityType: string,
    userId: string,
    ip: string,
    details: any
  ) {
    const event: SecurityEvent = {
      type: activityType,
      severity: 'medium',
      userId,
      ip,
      details,
      timestamp: new Date(),
    };

    // Analyze activity patterns
    const riskAssessment = await this.assessActivityRisk(event);
    event.severity = this.getRiskSeverity(riskAssessment.score);

    // Log suspicious activity
    this.winstonLogger.logSuspiciousActivity(
      activityType,
      userId,
      ip,
      details
    );

    // Record metrics
    this.metricsService.recordSuspiciousActivity(activityType, event.severity);

    // Handle high-risk activities
    if (riskAssessment.score > 80) {
      await this.handleHighRiskActivity(event, riskAssessment);
    }

    return riskAssessment;
  }

  // Rate Limiting and DDoS Protection
  async checkRateLimit(ip: string, endpoint: string, limit: number = 100): Promise<boolean> {
    const key = `${ip}:${endpoint}`;
    const now = Date.now();
    const windowMs = 60000; // 1 minute window

    if (!this.rateLimitTracker.has(key)) {
      this.rateLimitTracker.set(key, []);
    }

    const requests = this.rateLimitTracker.get(key)!;
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= limit) {
      // Rate limit exceeded
      await this.handleRateLimitExceeded(ip, endpoint, validRequests.length);
      return false;
    }

    // Add current request
    validRequests.push(now);
    this.rateLimitTracker.set(key, validRequests);

    return true;
  }

  // SQL Injection Detection
  async detectSQLInjection(query: string, params: any[], ip: string, userId?: string) {
    const sqlInjectionPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC)\b)/i,
      /(UNION\s+SELECT)/i,
      /(\bOR\b\s+\d+\s*=\s*\d+)/i,
      /(\bAND\b\s+\d+\s*=\s*\d+)/i,
      /(--|\#|\/\*|\*\/)/,
      /(\bxp_cmdshell\b)/i,
    ];

    const queryString = JSON.stringify({ query, params });
    
    for (const pattern of sqlInjectionPatterns) {
      if (pattern.test(queryString)) {
        await this.handleSQLInjectionAttempt(queryString, ip, userId, pattern.toString());
        return true;
      }
    }

    return false;
  }

  // XSS Detection
  async detectXSS(input: string, ip: string, userId?: string): Promise<boolean> {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi,
      /eval\s*\(/gi,
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(input)) {
        await this.handleXSSAttempt(input, ip, userId, pattern.toString());
        return true;
      }
    }

    return false;
  }

  // Payment Security
  async monitorPaymentSecurity(
    orderId: string,
    amount: number,
    paymentMethod: string,
    ip: string,
    userId: string
  ) {
    // Check for unusual payment patterns
    const recentPayments = await // @ts-ignore
    this.prisma.order.findMany({
      where: {
        user_id: (userId as any),
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      select: {
        total_amount: true,
        payment_method: true,
        createdAt: true,
      },
    });

    const riskFactors = [];
    let riskScore = 0;

    // Multiple high-value transactions
    if (recentPayments.length > 5 && amount > 1000000) { // 1M UZS
      riskFactors.push('Multiple high-value transactions');
      riskScore += 30;
    }

    // Rapid successive payments
    const rapidPayments = recentPayments.filter(
      p => Date.now() - p.createdAt.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );
    if (rapidPayments.length > 3) {
      riskFactors.push('Rapid successive payments');
      riskScore += 25;
    }

    // Different payment methods
    const uniquePaymentMethods = new Set(recentPayments.map(p => p.payment_method));
    if (uniquePaymentMethods.size > 2) {
      riskFactors.push('Multiple payment methods used');
      riskScore += 15;
    }

    if (riskScore > 50) {
      await this.handlePaymentSecurityAlert(orderId, riskScore, riskFactors, ip, userId);
    }

    return { riskScore, riskFactors };
  }

  // Security Analytics
  async getSecurityAnalytics(timeRange: string = '24h'): Promise<any> {
    const hours = timeRange === '24h' ? 24 : timeRange === '7d' ? 168 : 1;
    const startTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    // This would typically query your logging system
    // For now, we'll return mock data structure
    return {
      authFailures: await this.getAuthFailureStats(startTime),
      suspiciousActivities: await this.getSuspiciousActivityStats(startTime),
      blockedIPs: Array.from(this.suspiciousIPs),
      securityEvents: await this.getSecurityEventStats(startTime),
      riskAssessment: await this.getOverallRiskAssessment(),
    };
  }

  // Private helper methods
  private async checkBruteForceAttempt(ip: string, method: string) {
    const key = `brute_force:${ip}:${method}`;
    const attempts = this.rateLimitTracker.get(key) || [];
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes

    // Clean old attempts
    const recentAttempts = attempts.filter(time => now - time < windowMs);
    
    if (recentAttempts.length >= 5) {
      this.suspiciousIPs.add(ip);
      
      await this.detectSuspiciousActivity(
        'brute_force_attempt',
        'unknown',
        ip,
        { method, attempts: recentAttempts.length }
      );
    }

    recentAttempts.push(now);
    this.rateLimitTracker.set(key, recentAttempts);
  }

  private async assessAuthRisk(ip: string, method: string, reason?: string): Promise<number> {
    let riskScore = 0;

    // IP reputation
    if (this.suspiciousIPs.has(ip)) {
      riskScore += 40;
    }

    // Method-based risk
    if (method === 'password' && reason === 'invalid_credentials') {
      riskScore += 20;
    }

    // Geographic risk (simplified)
    const ipCountry = await this.getIPCountry(ip);
    if (['CN', 'RU', 'KP'].includes(ipCountry)) {
      riskScore += 15;
    }

    return Math.min(riskScore, 100);
  }

  private async assessActivityRisk(event: SecurityEvent): Promise<RiskAssessment> {
    let score = 0;
    const factors = [];

    // IP-based risk
    if (this.suspiciousIPs.has(event.ip)) {
      score += 30;
      factors.push('Known suspicious IP');
    }

    // Activity type risk
    const highRiskActivities = ['sql_injection', 'xss_attempt', 'brute_force'];
    if (highRiskActivities.includes(event.type)) {
      score += 40;
      factors.push('High-risk activity type');
    }

    // Time-based patterns
    const hour = event.timestamp.getHours();
    if (hour < 6 || hour > 22) {
      score += 10;
      factors.push('Unusual time activity');
    }

    let recommendation = 'Monitor';
    if (score > 80) recommendation = 'Block immediately';
    else if (score > 60) recommendation = 'Increase monitoring';
    else if (score > 40) recommendation = 'Flag for review';

    return { score: Math.min(score, 100), factors, recommendation };
  }

  private getRiskSeverity(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= 80) return 'critical';
    if (score >= 60) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }

  private async handleHighRiskAuth(ip: string, method: string, riskScore: number) {
    this.logger.warn(`High-risk authentication attempt from ${ip} (score: ${riskScore})`);
    
    // Add to suspicious IPs
    this.suspiciousIPs.add(ip);
    
    // Log security event
    this.winstonLogger.logSecurityEvent('high_risk_auth', {
      ip,
      method,
      riskScore,
    });
  }

  private async handleHighRiskActivity(event: SecurityEvent, assessment: RiskAssessment) {
    this.logger.error(`High-risk activity detected: ${event.type} from ${event.ip}`);
    
    if (assessment.recommendation === 'Block immediately') {
      this.suspiciousIPs.add(event.ip);
    }
  }

  private async handleRateLimitExceeded(ip: string, endpoint: string, requestCount: number) {
    this.winstonLogger.logSecurityEvent('rate_limit_exceeded', {
      ip,
      endpoint,
      requestCount,
    });

    if (requestCount > 200) {
      this.suspiciousIPs.add(ip);
    }
  }

  private async handleSQLInjectionAttempt(query: string, ip: string, userId?: string, pattern?: string) {
    this.winstonLogger.logSecurityEvent('sql_injection_attempt', {
      ip,
      userId,
      query: query.substring(0, 200),
      pattern,
    });

    this.suspiciousIPs.add(ip);
    this.metricsService.recordSuspiciousActivity('sql_injection', 'critical');
  }

  private async handleXSSAttempt(input: string, ip: string, userId?: string, pattern?: string) {
    this.winstonLogger.logSecurityEvent('xss_attempt', {
      ip,
      userId,
      input: input.substring(0, 200),
      pattern,
    });

    this.metricsService.recordSuspiciousActivity('xss_attempt', 'high');
  }

  private async handlePaymentSecurityAlert(
    orderId: string,
    riskScore: number,
    riskFactors: string[],
    ip: string,
    userId: string
  ) {
    this.winstonLogger.logSecurityEvent('payment_security_alert', {
      orderId,
      riskScore,
      riskFactors,
      ip,
      userId,
    });

    if (riskScore > 70) {
      this.metricsService.recordSuspiciousActivity('payment_fraud', 'high');
    }
  }

  private cleanupRateLimitData() {
    const now = Date.now();
    const windowMs = 60000;

    for (const [key, requests] of this.rateLimitTracker.entries()) {
      const validRequests = requests.filter(time => now - time < windowMs);
      if (validRequests.length === 0) {
        this.rateLimitTracker.delete(key);
      } else {
        this.rateLimitTracker.set(key, validRequests);
      }
    }
  }

  private async analyzeSecurityPatterns() {
    // This would analyze patterns in your security logs
    // For now, just clean up old suspicious IPs
    // In a real implementation, you'd analyze actual threat intelligence
  }

  private async getIPCountry(ip: string): Promise<string> {
    // This would use a GeoIP service
    // For now, return a default
    return 'UZ';
  }

  private async getAuthFailureStats(startTime: Date) {
    // Mock implementation - would query actual logs
    return {
      total: 45,
      byMethod: { password: 30, otp: 15 },
      topIPs: ['192.168.1.100', '10.0.0.50'],
    };
  }

  private async getSuspiciousActivityStats(startTime: Date) {
    return {
      total: 12,
      byType: { brute_force: 8, sql_injection: 2, xss_attempt: 2 },
    };
  }

  private async getSecurityEventStats(startTime: Date) {
    return {
      total: 67,
      bySeverity: { low: 40, medium: 20, high: 5, critical: 2 },
    };
  }

  private async getOverallRiskAssessment() {
    return {
      level: 'medium',
      score: 45,
      factors: ['Multiple auth failures', 'Suspicious IP activity'],
      recommendations: ['Enable 2FA', 'Implement IP blocking'],
    };
  }
}
