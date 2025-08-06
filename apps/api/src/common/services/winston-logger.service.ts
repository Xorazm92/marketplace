
import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WinstonLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.logger = winston.createLogger({
      level: this.configService.get<string>('LOG_LEVEL') || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.metadata({
          fillExcept: ['message', 'level', 'timestamp', 'stack']
        })
      ),
      defaultMeta: {
        service: 'inbola-backend',
        version: process.env.npm_package_version || '1.0.0',
        environment: this.configService.get<string>('NODE_ENV') || 'development'
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
              let log = `${timestamp} [${level}] ${message}`;
              if (stack) log += `\n${stack}`;
              if (Object.keys(meta).length > 0) {
                log += `\n${JSON.stringify(meta, null, 2)}`;
              }
              return log;
            })
          )
        }),

        // File transport for all logs
        new winston.transports.File({
          filename: 'logs/app.log',
          maxsize: 5242880, // 5MB
          maxFiles: 5,
        }),

        // Separate file for errors
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 10,
        }),

        // Separate file for audit logs
        new winston.transports.File({
          filename: 'logs/audit.log',
          level: 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            winston.format.metadata()
          ),
          maxsize: 5242880, // 5MB
          maxFiles: 30,
        })
      ],
    });

    // Add Elasticsearch transport for production (disabled for now)
    if (this.configService.get<string>('NODE_ENV') === 'production' && this.configService.get<string>('ELASTICSEARCH_URL')) {
      try {
        const { ElasticsearchTransport } = require('winston-elasticsearch');

        this.logger.add(new ElasticsearchTransport({
          level: 'info',
          clientOpts: {
            node: this.configService.get<string>('ELASTICSEARCH_URL')
          },
          index: 'inbola-logs',
          transformer: (logData) => {
            return {
              '@timestamp': new Date().toISOString(),
              severity: logData.level,
              message: logData.message,
              fields: logData.meta,
              service: 'inbola-backend'
            };
          }
        }));
      } catch (error) {
        console.warn('Elasticsearch transport not available:', error.message);
      }
    }

    this.createLogDirectory();
  }

  private createLogDirectory() {
    const fs = require('fs');
    const path = require('path');
    
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  log(message: string, context?: any) {
    this.logger.info(message, { context });
  }

  error(message: string, stack?: string, context?: any) {
    this.logger.error(message, { stack, context });
  }

  warn(message: string, context?: any) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: any) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: any) {
    this.logger.verbose(message, { context });
  }

  // Audit logging for important business events
  audit(event: string, userId?: string, details?: any) {
    this.logger.info('AUDIT_EVENT', {
      event,
      userId,
      details,
      timestamp: new Date().toISOString(),
      type: 'audit'
    });
  }

  // Performance logging
  performance(operation: string, duration: number, metadata?: any) {
    this.logger.info('PERFORMANCE_METRIC', {
      operation,
      duration,
      metadata,
      timestamp: new Date().toISOString(),
      type: 'performance'
    });
  }

  // Security logging
  security(event: string, risk: 'low' | 'medium' | 'high', details?: any) {
    this.logger.warn('SECURITY_EVENT', {
      event,
      risk,
      details,
      timestamp: new Date().toISOString(),
      type: 'security'
    });
  }

  // Business metrics logging
  businessMetric(metric: string, value: number, tags?: Record<string, string>) {
    this.logger.info('BUSINESS_METRIC', {
      metric,
      value,
      tags,
      timestamp: new Date().toISOString(),
      type: 'business_metric'
    });
  }
}
