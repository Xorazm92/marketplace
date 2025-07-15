import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonLoggerService } from './common/services/winston-logger.service';
import { SentryService } from './common/services/sentry.service';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import * as compression from 'compression';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: false, // We'll use our custom logger
  });

  const configService = app.get(ConfigService);
  const logger = app.get(WinstonLoggerService);
  const sentryService = app.get(SentryService);

  // Use custom logger
  app.useLogger(logger);

  // Security middleware
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: false,
  }));

  // Compression
  app.use(compression());

  // CORS configuration
  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://inbola.uz', 'https://www.inbola.uz']
      : ['http://localhost:3000', 'http://0.0.0.0:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(sentryService, logger));

  // Swagger documentation (only in development)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('INBOLA Kids E-Commerce API')
      .setDescription('Safe e-commerce platform for children and parents')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  // Health check endpoint
  app.use('/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    });
  });

  // Set global prefix
  app.setGlobalPrefix('api', {
    exclude: ['/health'],
  });

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 INBOLA Backend running on port ${port}`);
  logger.log(`📱 Environment: ${process.env.NODE_ENV}`);
  logger.log(`📊 Health check: http://0.0.0.0:${port}/health`);

  if (process.env.NODE_ENV !== 'production') {
    logger.log(`📚 API Documentation: http://0.0.0.0:${port}/api-docs`);
  }

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    logger.log('SIGTERM received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('SIGINT received, shutting down gracefully');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch(error => {
  console.error('Failed to start application:', error);
  process.exit(1);
});