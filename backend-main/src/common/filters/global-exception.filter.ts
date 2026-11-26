import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { reportError } from '../error-reporter';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let error: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      
      if (typeof errorResponse === 'object' && errorResponse !== null) {
        message = (errorResponse as any).message || exception.message;
        error = (errorResponse as any).error || 'Http Exception';
      } else {
        message = errorResponse as string;
        error = 'Http Exception';
      }
    } else if (exception instanceof PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';
      
      switch (exception.code) {
        case 'P2002':
          status = HttpStatus.CONFLICT;
          message = 'Bu ma\'lumot allaqachon mavjud';
          break;
        case 'P2025':
          status = HttpStatus.NOT_FOUND;
          message = 'Ma\'lumot topilmadi';
          break;
        case 'P2003':
          message = 'Bog\'liq ma\'lumotlar mavjud';
          break;
        case 'P2014':
          message = 'Ma\'lumotlar o\'rtasida ziddiyat';
          break;
        default:
          // Noma'lum baza xatosi mijozning emas, serverning aybi.
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          message = 'Ma\'lumotlar bazasida xatolik yuz berdi';
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Ichki server xatosi';
      error = 'Internal Server Error';
    }

    // So'rov satri logga tushmaydi: unda qidiruv matni bo'ladi (admin xaridorni telefon
    // raqami bo'yicha qidiradi). Stek faqat server xatosida kerak.
    const path = request.url.split('?')[0];
    const userId: number | null = (request as any).user?.id ?? null;
    const errorLog = {
      event: 'http_error',
      path,
      method: request.method,
      statusCode: status,
      message,
      error,
      userAgent: request.get('User-Agent'),
      ip: request.ip,
      userId,
      adminId: (request as any).admin?.id ?? null,
      ...(status >= 500 ? { stack: exception instanceof Error ? exception.stack : null } : {}),
    };

    if (status >= 500) {
      this.logger.error(errorLog);
      reportError(exception, { method: request.method, path, status, userId });
    } else if (status >= 400) {
      this.logger.warn(errorLog);
    }

    // Send error response
    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : null,
      }),
    });
  }
}
