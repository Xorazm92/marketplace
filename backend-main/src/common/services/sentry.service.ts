
import * as Sentry from '@sentry/node';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SentryService {
  private readonly logger = new Logger(SentryService.name);

  constructor(private configService: ConfigService) {
    this.initializeSentry();
  }

  private initializeSentry() {
    const dsn = this.configService.get<string>('SENTRY_DSN');
    const environment = this.configService.get<string>('NODE_ENV') || 'development';

    if (!dsn) {
      this.logger.warn('Sentry DSN not provided. Error tracking disabled.');
      return;
    }

    Sentry.init({
      dsn,
      environment,
      tracesSampleRate: environment === 'production' ? 0.1 : 1.0,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.Express({ app: undefined }),
      ],
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request?.data) {
          event.request.data = this.sanitizeData(event.request.data);
        }
        return event;
      },
    });

    this.logger.log('Sentry initialized successfully');
  }

  private sanitizeData(data: any): any {
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    
    if (typeof data === 'object' && data !== null) {
      const sanitized = { ...data };
      
      for (const field of sensitiveFields) {
        if (sanitized[field]) {
          sanitized[field] = '[REDACTED]';
        }
      }
      
      return sanitized;
    }
    
    return data;
  }

  captureException(error: Error, context?: any) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional_info', context);
      }
      Sentry.captureException(error);
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: any) {
    Sentry.withScope((scope) => {
      if (context) {
        scope.setContext('additional_info', context);
      }
      Sentry.captureMessage(message, level);
    });
  }

  setUser(user: { id: string; email?: string; username?: string }) {
    Sentry.setUser(user);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb) {
    Sentry.addBreadcrumb(breadcrumb);
  }

  setTag(key: string, value: string) {
    Sentry.setTag(key, value);
  }

  setContext(key: string, context: any) {
    Sentry.setContext(key, context);
  }
}
