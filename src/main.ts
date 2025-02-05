import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './common/filters/catch-everything.filter';
import * as express from 'express'; // Fix import to avoid issues

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  // Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, 
      whitelist: true, 
      forbidNonWhitelisted: true, 
      skipMissingProperties: false, 
    }),
  );

  // Global Prefix
  app.setGlobalPrefix('api/v1');

  // Global Exception Filter
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  // ✅ Ensure Express raw body middleware is applied BEFORE body-parsing middleware
  const expressInstance = app.getHttpAdapter().getInstance();
  expressInstance.use('/api/v1/order/webhook-checkout/', express.raw({ type: 'application/json' }));

  const port = process.env.PORT || 2000;
  await app.listen(port);
  console.log(`🚀 Server is running on http://localhost:${port}`);
}

bootstrap();
