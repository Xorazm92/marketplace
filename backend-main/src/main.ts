
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { SecurityMiddleware } from './common/middleware/security.middleware';

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');
  
  try {
    const app = await NestFactory.create(AppModule, {
      logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });

    // CORS konfiguratsiyasi
    app.enableCors({
      origin: [
        'http://localhost:3000',
        'http://0.0.0.0:3000',
        process.env.FRONTEND_URL || 'http://0.0.0.0:3000'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    });

    // Global pipes va filters
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

    app.useGlobalFilters(new GlobalExceptionFilter());
    app.useGlobalInterceptors(new LoggingInterceptor());

    // Swagger konfiguratsiyasi
    const config = new DocumentBuilder()
      .setTitle('INBOLA Kids Marketplace API')
      .setDescription('Bolalar uchun xavfsiz va ta\'limiy elektron tijorat platformasi')
      .setVersion('1.0')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .addTag('Authentication', 'Foydalanuvchi autentifikatsiyasi')
      .addTag('Products', 'Mahsulotlar boshqaruvi')
      .addTag('Users', 'Foydalanuvchilar boshqaruvi')
      .addTag('Orders', 'Buyurtmalar boshqaruvi')
      .addTag('Admin', 'Administrator funksiyalari')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });

    // Health check endpoint
    app.getHttpAdapter().get('/health', (req, res) => {
      res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
      });
    });

    const PORT = process.env.PORT || 4000;
    const HOST = '0.0.0.0';

    await app.listen(PORT, HOST);
    
    logger.log(`🚀 INBOLA Backend server running on http://${HOST}:${PORT}`);
    logger.log(`📚 API Documentation available at http://${HOST}:${PORT}/api-docs`);
    logger.log(`💚 Health check available at http://${HOST}:${PORT}/health`);
    logger.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    
  } catch (error) {
    logger.error('❌ Serverni ishga tushirishda xato:', error);
    process.exit(1);
  }
}

bootstrap();
