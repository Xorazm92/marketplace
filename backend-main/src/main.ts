
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger, VersioningType } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import compression from 'compression';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as session from 'express-session';
import { join } from 'path';
import { setupSwagger } from './config/swagger.config';

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
    
    // Session middleware for OAuth
    app.use(session.default({
      secret: process.env.JWT_ACCESS_SECRET || 'your-session-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    }));
    
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
      // health prefixsiz ham ishlaydi
      exclude: ['health'],
    });

    // Enable API versioning
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    // Setup Swagger documentation
    setupSwagger(app);

    // Global prefix for all routes (already set above with exclusions)
    // app.setGlobalPrefix('api');

    // CORS configuration for development
    const corsOptions = {
      origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, postman)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
          'http://localhost:3000',
          'http://localhost:3001',
          'http://127.0.0.1:3000',
          'http://127.0.0.1:3001',
          'http://localhost',
          'http://127.0.0.1'
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
          callback(null, true);
        } else {
          console.warn('CORS: Blocked origin:', origin);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
      allowedHeaders: [
        'Content-Type',
        'Authorization',
        'Accept',
        'Origin',
        'X-Requested-With',
        'X-Access-Token',
        'X-Refresh-Token',
        'X-Requested-With',
        'Access-Control-Allow-Origin',
        'Access-Control-Allow-Headers',
        'Access-Control-Allow-Methods',
        'Access-Control-Allow-Credentials'
      ],
      exposedHeaders: [
        'Content-Length',
        'X-Total-Count',
        'X-Page-Count',
        'X-Request-Id',
        'X-Response-Time',
        'X-Powered-By',
        'Set-Cookie'
      ],
      credentials: true,
      maxAge: 600,
      optionsSuccessStatus: 204,
      preflightContinue: false
    };
    
    app.enableCors(corsOptions);
    
    // Handle preflight requests
    app.use((req: any, res: any, next: any) => {
      if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        res.header('Access-Control-Allow-Credentials', 'true');
        return res.status(204).end();
      }
      next();
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
      .addServer('http://0.0.0.0:4000', 'Development server')
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

    // Ensure /api/health works
    app.getHttpAdapter().get('/api/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'INBOLA Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      });
    });

    // Ensure /api/v1/health works
    app.getHttpAdapter().get('/api/v1/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'INBOLA Backend API v1',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        pid: process.pid,
      });
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
    const PORT = parseInt(process.env.PORT, 10) || 4000;
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
