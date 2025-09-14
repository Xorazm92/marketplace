
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  
  try {
    console.log('🚀 Starting INBOLA Backend...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // Static files serving
    const uploadsPath = join(process.cwd(), 'public', 'uploads');
    app.use('/uploads', express.static(uploadsPath, {
      setHeaders: (res) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      }
    }));

    // CORS configuration
    app.enableCors({
      origin: [
        'http://localhost:5000',
        'http://0.0.0.0:5000',
        'http://127.0.0.1:5000',
        'https://*.replit.dev',
        'https://*.repl.co'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Global pipes
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
    );

    // Global filters
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Set global prefix
    app.setGlobalPrefix('api');

    // Health check
    app.getHttpAdapter().get('/health', (req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        message: 'INBOLA Backend is running!',
        version: '1.0.0'
      });
    });

    // Root endpoint
    app.getHttpAdapter().get('/', (req, res) => {
      res.json({
        message: '🎯 INBOLA Kids Marketplace API',
        version: '1.0.0',
        health: '/health',
        api: '/api',
        timestamp: new Date().toISOString(),
      });
    });

    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');

    logger.log(`🚀 INBOLA Backend server running on port ${port}`);
    logger.log(`📊 Health check: http://0.0.0.0:${port}/health`);
    logger.log(`🔗 API: http://0.0.0.0:${port}/api`);
    logger.log(`📚 GraphQL: http://0.0.0.0:${port}/graphql`);

  } catch (error) {
    logger.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
