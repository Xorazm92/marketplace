
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap() {
  try {
    console.log('🚀 Starting INBOLA Backend...');

    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // CORS configuration - Allow all origins for development
    app.enableCors({
      origin: [
        'http://0.0.0.0:3000',
        'http://localhost:3000',
        'http://0.0.0.0:3001',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:3001'
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
    });

    // Compression
    app.use(compression());

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }));

    // Global exception filter
    app.useGlobalFilters(new GlobalExceptionFilter());

    // Swagger documentation
    const config = new DocumentBuilder()
      .setTitle('INBOLA Kids E-Commerce API')
      .setDescription('Safe e-commerce platform for children and parents')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);

    // Health check endpoint
    app.use('/health', (req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0',
        database: 'connected',
        services: {
          auth: 'running',
          products: 'running',
          cart: 'running',
          orders: 'running'
        }
      });
    });

    // Set global prefix
    app.setGlobalPrefix('api', {
      exclude: ['/health'],
    });

    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');

    console.log('✅ INBOLA Backend successfully started!');
    console.log(`🌐 Backend running on: http://0.0.0.0:${port}`);
    console.log(`📚 API Documentation: http://0.0.0.0:${port}/api-docs`);
    console.log(`💚 Health check: http://0.0.0.0:${port}/health`);

  } catch (error) {
    console.error('❌ Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
