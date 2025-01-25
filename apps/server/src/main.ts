/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger, ValidationPipe, ClassSerializerInterceptor } from '@nestjs/common';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import cookieParser from 'cookie-parser';
import cors from 'cors';

import { AppModule } from './app/app.module';
import { AllExceptionsFilter } from './app/utils/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalFilters(new AllExceptionsFilter());
  // app.useGlobalGuards(new LoggedIn());
  // app.useGlobalGuards(new Admin());
  app.use(cookieParser());
  app.use(cors());
  const port = process.env.PORT || 5100;

  // swagger
  // further reading:
  // https://gitlab.com/WaldemarLehner/nestjs-swagger-example/-/tree/main?ref_type=heads
  const config = new DocumentBuilder()
    .setTitle('LinkRoll API')
    .setDescription('LinkRoll API provides an api to manage links and tags.')
    .setVersion('1.0')
    .addTag('api')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
}

bootstrap();
