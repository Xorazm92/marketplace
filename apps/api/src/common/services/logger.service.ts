import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
  userId?: number;
  ip?: string;
  userAgent?: string;
}

@Injectable()
export class LoggerService {
  private readonly logger = new Logger(LoggerService.name);
  private readonly logPath: string;

  constructor(private readonly configService: ConfigService) {
    this.logPath = this.configService.get<string>('LOG_FILE_PATH') || './logs';
    this.ensureLogDirectory();
  }

  private ensureLogDirectory(): void {
    if (!fs.existsSync(this.logPath)) {
      fs.mkdirSync(this.logPath, { recursive: true });
    }
  }

  private writeToFile(filename: string, entry: LogEntry): void {
    const filePath = path.join(this.logPath, filename);
    const logLine = JSON.stringify(entry) + '\n';
    
    fs.appendFile(filePath, logLine, (err) => {
      if (err) {
        this.logger.error('Failed to write to log file', err);
      }
    });
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: string,
    data?: any,
    userId?: number,
    ip?: string,
    userAgent?: string,
  ): LogEntry {
    return {
      level,
      message,
      context,
      data,
      timestamp: new Date().toISOString(),
      userId,
      ip,
      userAgent,
    };
  }

  info(message: string, context?: string, data?: any, userId?: number, ip?: string, userAgent?: string): void {
    const entry = this.createLogEntry('info', message, context, data, userId, ip, userAgent);
    this.logger.log(message, context);
    this.writeToFile('app.log', entry);
  }

  warn(message: string, context?: string, data?: any, userId?: number, ip?: string, userAgent?: string): void {
    const entry = this.createLogEntry('warn', message, context, data, userId, ip, userAgent);
    this.logger.warn(message, context);
    this.writeToFile('app.log', entry);
  }

  error(message: string, context?: string, data?: any, userId?: number, ip?: string, userAgent?: string): void {
    const entry = this.createLogEntry('error', message, context, data, userId, ip, userAgent);
    this.logger.error(message, context);
    this.writeToFile('error.log', entry);
    this.writeToFile('app.log', entry);
  }

  debug(message: string, context?: string, data?: any, userId?: number, ip?: string, userAgent?: string): void {
    const entry = this.createLogEntry('debug', message, context, data, userId, ip, userAgent);
    this.logger.debug(message, context);
    
    if (this.configService.get<string>('NODE_ENV') === 'development') {
      this.writeToFile('debug.log', entry);
    }
  }

  // Specific logging methods for different types of events
  logUserAction(action: string, userId: number, data?: any, ip?: string, userAgent?: string): void {
    this.info(`User action: ${action}`, 'UserAction', { userId, ...data }, userId, ip, userAgent);
    this.writeToFile('user-actions.log', this.createLogEntry('info', `User action: ${action}`, 'UserAction', { userId, ...data }, userId, ip, userAgent));
  }

  logPayment(action: string, orderId: number, amount: number, method: string, userId: number, data?: any): void {
    const message = `Payment ${action}: Order ${orderId}, Amount: ${amount}, Method: ${method}`;
    this.info(message, 'Payment', { orderId, amount, method, userId, ...data }, userId);
    this.writeToFile('payments.log', this.createLogEntry('info', message, 'Payment', { orderId, amount, method, userId, ...data }, userId));
  }

  logOrder(action: string, orderId: number, userId: number, data?: any): void {
    const message = `Order ${action}: ${orderId}`;
    this.info(message, 'Order', { orderId, userId, ...data }, userId);
    this.writeToFile('orders.log', this.createLogEntry('info', message, 'Order', { orderId, userId, ...data }, userId));
  }

  logSecurity(event: string, ip: string, userAgent?: string, userId?: number, data?: any): void {
    const message = `Security event: ${event}`;
    this.warn(message, 'Security', { ip, userAgent, userId, ...data }, userId, ip, userAgent);
    this.writeToFile('security.log', this.createLogEntry('warn', message, 'Security', { ip, userAgent, userId, ...data }, userId, ip, userAgent));
  }

  logPerformance(operation: string, duration: number, context?: string, data?: any): void {
    const message = `Performance: ${operation} took ${duration}ms`;
    
    if (duration > 1000) {
      this.warn(message, context, { duration, ...data });
    } else {
      this.info(message, context, { duration, ...data });
    }
    
    this.writeToFile('performance.log', this.createLogEntry('info', message, context, { duration, ...data }));
  }

  // Log rotation method (should be called by a cron job)
  async rotateLogFiles(): Promise<void> {
    const files = ['app.log', 'error.log', 'user-actions.log', 'payments.log', 'orders.log', 'security.log', 'performance.log'];
    const date = new Date().toISOString().split('T')[0];

    for (const file of files) {
      const currentPath = path.join(this.logPath, file);
      const archivePath = path.join(this.logPath, 'archive', `${date}-${file}`);

      if (fs.existsSync(currentPath)) {
        // Ensure archive directory exists
        const archiveDir = path.dirname(archivePath);
        if (!fs.existsSync(archiveDir)) {
          fs.mkdirSync(archiveDir, { recursive: true });
        }

        // Move current log to archive
        fs.renameSync(currentPath, archivePath);
        
        // Create new empty log file
        fs.writeFileSync(currentPath, '');
        
        this.info(`Log file rotated: ${file}`, 'LogRotation');
      }
    }

    // Clean up old log files (older than 30 days)
    this.cleanupOldLogs();
  }

  private cleanupOldLogs(): void {
    const archiveDir = path.join(this.logPath, 'archive');
    if (!fs.existsSync(archiveDir)) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    fs.readdir(archiveDir, (err, files) => {
      if (err) {
        this.error('Failed to read archive directory', 'LogCleanup', err);
        return;
      }

      files.forEach((file) => {
        const filePath = path.join(archiveDir, file);
        fs.stat(filePath, (err, stats) => {
          if (err) return;

          if (stats.mtime < thirtyDaysAgo) {
            fs.unlink(filePath, (err) => {
              if (err) {
                this.error(`Failed to delete old log file: ${file}`, 'LogCleanup', err);
              } else {
                this.info(`Deleted old log file: ${file}`, 'LogCleanup');
              }
            });
          }
        });
      });
    });
  }
}
