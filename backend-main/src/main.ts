// Ba'zi modullar env'ni import paytida o'qiydi, ConfigModule esa .env ni undan
// keyin yuklaydi. Shuning uchun .env eng birinchi yuklanadi.
import 'dotenv/config';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  configureApp(app);
  app.enableShutdownHooks();

  const port = Number(process.env.PORT) || 4000;
  await app.listen(port, process.env.HOST || '0.0.0.0');
  new Logger('Bootstrap').log(`INBOLA API :${port} (${process.env.NODE_ENV || 'development'})`);
}

bootstrap().catch((error) => {
  new Logger('Bootstrap').error(error);
  process.exit(1);
});
