import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  // app.enableVersioning({
  //   type: VersioningType.URI,
  // });
  app.setGlobalPrefix('api/v1');
  const port = process.env.PORT;
  await app.listen(port ?? 2000);
}
bootstrap();
