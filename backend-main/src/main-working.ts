// @ts-nocheck
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app-working.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS configuration
  app.enableCors({
    origin: ['http://localhost:3000', 'https://inbola.uz'],
    credentials: true,
  });

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('INBOLA Marketplace API')
    .setDescription('Complete marketplace API for INBOLA platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  
  console.log(`🚀 INBOLA Marketplace API running on port ${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api-docs`);
}

bootstrap();
