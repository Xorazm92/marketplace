import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  try {
    console.log('Starting INBOLA Backend...');
    
    const app = await NestFactory.create(AppModule, {
      logger: ['log', 'error', 'warn', 'debug', 'verbose'],
    });

    // CORS configuration
    app.enableCors({
      origin: ['http://localhost:3000', 'http://localhost:3001'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Set global prefix
    app.setGlobalPrefix('api');

    const port = process.env.PORT || 4000;
    await app.listen(port, '0.0.0.0');

    console.log(`🚀 INBOLA Backend running on port ${port}`);
    console.log(`📊 Health check: http://localhost:${port}/api`);
    console.log(`📚 GraphQL Playground: http://localhost:${port}/graphql`);

  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
}

bootstrap();
