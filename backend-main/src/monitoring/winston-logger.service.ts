// @ts-nocheck
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import ElasticsearchTransport from 'winston-elasticsearch';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const esTransportOpts = {
      level: 'info',
      clientOpts: {
        node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
      },
      index: 'inbola-logs',
      indexTemplate: {
        name: 'inbola-logs-template',
        pattern: 'inbola-logs-*',
        settings: {
          number_of_shards: 1,
          number_of_replicas: 0,
        },
        mappings: {
          properties: {
            '@timestamp': { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text' },
            service: { type: 'keyword' },
            userId: { type: 'keyword' },
            requestId: { type: 'keyword' },
            ip: { type: 'ip' },
            userAgent: { type: 'text' },
            method: { type: 'keyword' },
            url: { type: 'text' },
            statusCode: { type: 'integer' },
            responseTime: { type: 'integer' },
            error: {
              type: 'object',
              properties: {
                name: { type: 'keyword' },
                message: { type: 'text' },
                stack: { type: 'text' },
              },
            },
            business: {
              type: 'object',
              properties: {
                orderId: { type: 'keyword' },
                userId: { type: 'keyword' },
                productId: { type: 'keyword' },
                amount: { type: 'float' },
                paymentMethod: { type: 'keyword' },
                category: { type: 'keyword' },
              },
            },
            security: {
              type: 'object',
              properties: {
                authMethod: { type: 'keyword' },
                failureReason: { type: 'keyword' },
                ipCountry: { type: 'keyword' },
                riskScore: { type: 'integer' },
              },
            },
          },
        },
      },
    };

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
          return JSON.stringify({
            '@timestamp': timestamp,
            level,
            message,
            service: service || 'inbola-marketplace',
            ...meta,
          });
        })
      ),
      defaultMeta: {
        service: 'inbola-marketplace',
        environment: process.env.NODE_ENV || 'development',
        version: process.env.APP_VERSION || '1.0.0',
      },
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),
        new (ElasticsearchTransport as any)(esTransportOpts),
      ],
    });
  }

  log(message: string, context?: string, meta?: any) {
    this.logger.info(message, { context, ...meta });
  }

  error(message: string, trace?: string, context?: string, meta?: any) {
    this.logger.error(message, {
      context,
      trace,
      error: {
        message,
        stack: trace,
      },
      ...meta,
    });
  }

  warn(message: string, context?: string, meta?: any) {
    this.logger.warn(message, { context, ...meta });
  }

  debug(message: string, context?: string, meta?: any) {
    this.logger.debug(message, { context, ...meta });
  }

  verbose(message: string, context?: string, meta?: any) {
    this.logger.verbose(message, { context, ...meta });
  }

  // Business Intelligence Logging
  logBusinessEvent(event: string, data: any) {
    this.logger.info(`Business Event: ${event}`, {
      eventType: 'business',
      business: data,
    });
  }

  logOrder(orderId: string, userId: string, amount: number, status: string, paymentMethod: string) {
    this.logBusinessEvent('order_event', {
      orderId,
      userId,
      amount,
      status,
      paymentMethod,
    });
  }

  logProductView(productId: string, userId?: string, category?: string) {
    this.logBusinessEvent('product_view', {
      productId,
      userId,
      category,
    });
  }

  logUserRegistration(userId: string, method: string, ipCountry?: string) {
    this.logBusinessEvent('user_registration', {
      userId,
      method,
      ipCountry,
    });
  }

  // Security Logging
  logSecurityEvent(event: string, data: any) {
    this.logger.warn(`Security Event: ${event}`, {
      eventType: 'security',
      security: data,
    });
  }

  logAuthFailure(method: string, ip: string, reason: string, riskScore?: number) {
    this.logSecurityEvent('auth_failure', {
      authMethod: method,
      ip,
      failureReason: reason,
      riskScore: riskScore || 0,
    });
  }

  logSuspiciousActivity(activity: string, userId: string, ip: string, details: any) {
    this.logSecurityEvent('suspicious_activity', {
      activity,
      userId,
      ip,
      details,
      riskScore: 8,
    });
  }

  // Performance Logging
  logPerformanceEvent(event: string, data: any) {
    this.logger.info(`Performance Event: ${event}`, {
      eventType: 'performance',
      performance: data,
    });
  }

  logSlowQuery(query: string, duration: number, params?: any) {
    this.logPerformanceEvent('slow_query', {
      query,
      duration,
      params,
    });
  }

  logCacheEvent(operation: string, key: string, hit: boolean, duration?: number) {
    this.logPerformanceEvent('cache_operation', {
      operation,
      key,
      hit,
      duration,
    });
  }

  // HTTP Request Logging
  logHttpRequest(req: any, res: any, responseTime: number) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id,
      requestId: req.id,
    };

    if (res.statusCode >= 400) {
      this.error(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, undefined, 'HttpRequest', logData);
    } else {
      this.log(`HTTP ${res.statusCode} - ${req.method} ${req.url}`, 'HttpRequest', logData);
    }
  }

  // Error Logging with Context
  logApplicationError(error: Error, context: string, userId?: string, additionalData?: any) {
    this.error(error.message, error.stack, context, {
      userId,
      errorName: error.name,
      ...additionalData,
    });
  }

  // Structured Query Logging
  logDatabaseQuery(query: string, duration: number, rowCount?: number) {
    this.logPerformanceEvent('database_query', {
      query: query.substring(0, 200), // Truncate long queries
      duration,
      rowCount,
    });
  }

  // Payment Logging
  logPaymentEvent(event: string, orderId: string, amount: number, method: string, status: string) {
    this.logBusinessEvent('payment_event', {
      event,
      orderId,
      amount,
      paymentMethod: method,
      status,
    });
  }

  // Search Logging
  logSearchEvent(query: string, userId?: string, results?: number, filters?: any) {
    this.logBusinessEvent('search_event', {
      query,
      userId,
      resultCount: results,
      filters,
    });
  }
}
