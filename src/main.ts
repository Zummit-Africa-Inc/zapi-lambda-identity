import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(
    session({
      secret: 'jsdshdkhskdhkshkdks',
      saveUninitialized: false,
      resave: false,
      cookie: {
        maxAge: 60000000,
      },
    }),
  );

  app.use(passport.initialize());
  app.use(passport.session());

  const options = new DocumentBuilder()
    .setTitle('ZA Lambda Identity Service')
    .setDescription('Zummit Africa Lambda User Registration')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-doc', app, document);

  await app.listen(Number(process.env.NODE_PORT) || 3000);
}
bootstrap();
