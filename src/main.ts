import { NestFactory } from '@nestjs/core';
import { ValidationPipe,ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
// app.useInterceptor(ClassSerializerInterceptor)
  app.useGlobalPipes(new ValidationPipe())
  await app.listen(3000);
  console.log("server is running")
}
bootstrap();
