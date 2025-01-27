import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './common/filters/catch-everything.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const httpAdapterHost = app.get(HttpAdapterHost);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Automatically transform payload to DTO types
      whitelist: true, // Automatically strip properties that do not exist in the DTO class
      forbidNonWhitelisted: true, // Throw an error if non-whitelisted properties are passed
      skipMissingProperties: false, // Ensures validation even if properties are missing
    }),
  );
  app.setGlobalPrefix('api/v1');
  app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

  const port = process.env.PORT;
  await app.listen(port ?? 2000);
}
bootstrap();
