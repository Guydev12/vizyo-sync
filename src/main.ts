import { NestFactory } from '@nestjs/core';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ValidationPipe,ClassSerializerInterceptor } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
// app.useInterceptor(ClassSerializerInterceptor)
  app.useGlobalPipes(new ValidationPipe())
  

  // Enable CORS with specific options
  const corsOptions: CorsOptions = {
    origin: 'http://your-frontend-domain.com', // Replace with your frontend domain
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };

  app.enableCors(corsOptions);
  await app.listen(3000);
  console.log("server is running")
}
bootstrap();
