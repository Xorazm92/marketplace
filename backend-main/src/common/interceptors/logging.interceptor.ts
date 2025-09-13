import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    
    const { method, url, ip, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const userId = (request as any).user?.id || null;
    
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (data) => {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const { statusCode } = response;

          const logData = {
            method,
            url,
            statusCode,
            duration: `${duration}ms`,
            ip,
            userAgent,
            userId,
            timestamp: new Date().toISOString(),
          };

          if (statusCode >= 400) {
            this.logger.warn('Request completed with error', logData);
          } else {
            this.logger.log('Request completed successfully', logData);
          }
        },
        error: (error) => {
          const endTime = Date.now();
          const duration = endTime - startTime;

          const logData = {
            method,
            url,
            duration: `${duration}ms`,
            ip,
            userAgent,
            userId,
            error: error.message,
            timestamp: new Date().toISOString(),
          };

          this.logger.error('Request failed', logData);
        },
      }),
    );
  }
}
