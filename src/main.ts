import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrorResponseInterceptor } from './shared/interceptors/error-response.interceptor';
import { SuccessResponseInterceptor } from './shared/interceptors/serialize.interceptor';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = process.env.PORT;

  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
  app.enableCors({
    origin: [
      process.env.FRONTEND_URL, // Your frontend URL
      'http://localhost:3000', // Local development
      // Add other allowed origins as needed
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Access-Control-Allow-Headers',
      'Access-Control-Request-Headers',
      'Access-Control-Allow-Origin',
    ],
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalInterceptors(
    new SuccessResponseInterceptor(),
    new ErrorResponseInterceptor(),
  );
  app.setGlobalPrefix('api/v1');
  const swaggerOption = new DocumentBuilder()
    .setTitle(' API Documentation')
    .setDescription(' API Documention')
    .setVersion('1.0.0')
    .build();

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerOption, {
    // ignoreGlobalPrefix: false,
  });

  SwaggerModule.setup('docs', app, swaggerDoc, {
    customSiteTitle: 'Backend Generator',
    customfavIcon: 'https://avatars.githubusercontent.com/u/6936373?s=200&v=4',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.js',
    ],
    customCssUrl: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.min.css',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.css',
    ],
  });

  app.enableShutdownHooks();

  await app.listen(port);
}
bootstrap();
