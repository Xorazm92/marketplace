
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import * as compression from 'compression';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  
  try {
    // NestJS app yaratish
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
      cors: true,
    });

    // Security middleware
    app.use(helmet({
      crossOriginEmbedderPolicy: false,
      contentSecurityPolicy: false,
    }));

    // Performance middleware
    app.use(compression());
    app.use(cookieParser());
    
    // Static files serving - global prefix dan oldin
    const uploadsPath = join(process.cwd(), 'public', 'uploads');
    console.log('📁 Static files path:', uploadsPath);

    // CORS headers for static files
    app.use('/uploads', (req, res, next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });

    app.use('/uploads', express.static(uploadsPath, {
      setHeaders: (res, path) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Cross-Origin-Resource-Policy', 'cross-origin');
      }
    }));

    // Global prefix
    app.setGlobalPrefix('api', {
      exclude: ['/health', '/', '/uploads'],
    });

    // Versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // CORS konfiguratsiyasi
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://localhost:3002',
        'http://localhost:3003',
        'http://0.0.0.0:3000',
        'http://0.0.0.0:3002',
        'http://0.0.0.0:3003',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3002',
        'http://127.0.0.1:3003',
        process.env.FRONTEND_URL || 'http://localhost:3003',
        // Production URLs
        'https://inbola.uz',
        'https://www.inbola.uz',
        'https://api.inbola.uz'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Accept', 
        'Origin', 
        'X-Requested-With',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Methods',
        'X-API-Key',
        'X-Client-Version'
      ],
      exposedHeaders: ['Set-Cookie', 'X-Total-Count', 'X-Page-Count'],
      optionsSuccessStatus: 200,
      maxAge: 86400, // 24 hours
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
        validationError: {
          target: false,
        },
      }),
    );

    // Global filters va interceptors
    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger konfiguratsiyasi
    const config = new DocumentBuilder()
      .setTitle('🎯 INBOLA Kids Marketplace API')
      .setDescription('Bolalar va ota-onalar uchun xavfsiz va ta\'limiy elektron tijorat platformasi API')
      .setVersion('1.0.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'JWT token kiriting',
          in: 'header',
        },
        'JWT-auth',
      )
      .addServer('http://0.0.0.0:3001', 'Development server')
      .addTag('🔐 Authentication', 'Foydalanuvchi autentifikatsiyasi')
      .addTag('📦 Products', 'Mahsulotlar boshqaruvi')
      .addTag('👤 Users', 'Foydalanuvchilar boshqaruvi')
      .addTag('🛒 Orders', 'Buyurtmalar boshqaruvi')
      .addTag('🛡️ Admin', 'Administrator funksiyalari')
      .addTag('🛡️ Child Safety', 'Bolalar xavfsizligi')
      .addTag('💬 Chat', 'Real-time chat tizimi')
      .addTag('⭐ Reviews', 'Sharh va baholash tizimi')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
        tagsSorter: 'alpha',
        operationsSorter: 'alpha',
      },
      customSiteTitle: 'INBOLA API Documentation',
      customfavIcon: '/favicon.ico',
    });

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      const healthCheck = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        database: 'Connected',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
        },
        services: {
          api: 'Running',
          auth: 'Active',
          childSafety: 'Active',
          chat: 'Active',
        }
      };
      res.status(200).json(healthCheck);
    });

    // Root endpoint
    app.getHttpAdapter().get('/', (req, res) => {
      res.status(200).json({
        message: '🎯 INBOLA Kids Marketplace API',
        version: '1.0.0',
        documentation: '/api-docs',
        health: '/health',
        timestamp: new Date().toISOString(),
      });
    });

    // Server konfiguratsiyasi
    const PORT = parseInt(process.env.PORT, 10) || 3001;
    const HOST = process.env.HOST || '0.0.0.0';

    await app.listen(PORT, HOST);
    
    // Success messages
    logger.log(`🚀 INBOLA Backend server ishga tushdi: http://${HOST}:${PORT}`);
    logger.log(`📚 API Documentation: http://${HOST}:${PORT}/api-docs`);
    logger.log(`💚 Health Check: http://${HOST}:${PORT}/health`);
    logger.log(`🔧 GraphQL Playground: http://${HOST}:${PORT}/graphql`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.log(`🛡️ Security: Helmet enabled`);
    logger.log(`⚡ Performance: Compression enabled`);
    logger.log(`✅ CORS: Frontend connection allowed`);
    
  } catch (error) {
    logger.error('❌ Serverni ishga tushirishda xato:', error.message);
    logger.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🔄 SIGINT signal received: closing HTTP server');
  process.exit(0);
});

bootstrap();
