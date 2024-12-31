import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './common/catch-everything.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  const port = process.env.PORT;
  await app.listen(port ?? 2000);
}
bootstrap();
