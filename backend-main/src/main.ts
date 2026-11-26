// Ba'zi modullar env'ni import paytida o'qiydi, ConfigModule esa .env ni undan
// keyin yuklaydi. Shuning uchun .env eng birinchi yuklanadi.
import 'dotenv/config';
import { ConsoleLogger, Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  // Prodda har log satri — bitta JSON obyekt (docker logs → istalgan log yig'uvchi).
  // Dev'da odatdagi rangli matn qoladi.
  const production = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: production ? new ConsoleLogger({ json: true }) : undefined,
  });
  configureApp(app);
  // SIGTERM (deploy, docker stop): yangi ulanish qabul qilinmaydi, baza ulanishi yopiladi.
  app.enableShutdownHooks();

  // Osilib qolgan mijoz ulanishni cheksiz ushlab turmasin. 120 s — sekin tarmoqda 10 ta rasm
  // (55 MB gacha) yuklashga yetadi; nginx proxy_read_timeout 60 s.
  const server = app.getHttpServer();
  server.requestTimeout = 120_000;
  server.headersTimeout = 30_000;
  server.keepAliveTimeout = 65_000;

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, process.env.HOST || '0.0.0.0');
  new Logger('Bootstrap').log(`INBOLA API :${port} (${process.env.NODE_ENV || 'development'})`);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error(error);
  process.exit(1);
});
