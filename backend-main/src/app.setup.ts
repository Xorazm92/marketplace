import { INestApplication, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { join } from 'path';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

// main.ts va e2e testlar aynan bir xil sozlamani ishlatsin: test boshqa prefiks yoki
// boshqa ValidationPipe bilan ishlasa, u prod xatti-harakatini tekshirmagan bo'ladi.
export function configureApp(app: INestApplication): void {
  const express = app as NestExpressApplication;
  // nginx ortida: rate limit haqiqiy mijoz IP'si bo'yicha ishlashi uchun.
  express.set('trust proxy', 1);

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(compression());

  // Rasmlar /uploads da (API prefiksidan tashqarida). Fayl nomlari UUID, turi rasm.
  express.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
    prefix: '/uploads',
    maxAge: '7d',
    index: false,
    dotfiles: 'deny',
  });

  const origins = (process.env.CORS_ORIGIN || 'http://localhost:5000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({ origin: origins, methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], maxAge: 600 });

  app.setGlobalPrefix('api', { exclude: ['health'] });
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      validationError: { target: false },
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  if (process.env.NODE_ENV !== 'production' || process.env.SWAGGER_ENABLED === 'true') {
    const config = new DocumentBuilder().setTitle('INBOLA API').setVersion('1.0').addBearerAuth().build();
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));
  }
}
