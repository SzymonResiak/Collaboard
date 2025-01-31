import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

dotenv.config({ path: './.env' });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // swagger
  const config = new DocumentBuilder()
    .setTitle('Task Link API')
    .setDescription('API documentation for Task Link application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const cors = {
    origin: ['http://localhost:3001', /https?:.*/],
    methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    credentials: true,
    allowedHeaders: ['Accept', 'Content-Type', 'Authorization'],
  };
  app.enableCors(cors);
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.listen(3000);
}

bootstrap();
