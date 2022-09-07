import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.setGlobalPrefix('zapi-identity')
  app.useGlobalPipes(new ValidationPipe())

  if(process.env.NODE_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('ZA Lambda Identity Service')
      .setDescription('Zummit Africa Lambda User Registration')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    
    const document = SwaggerModule.createDocument(app, options)
    SwaggerModule.setup('zl-id', app, document)
  }
  await app.listen(Number(process.env.NODE_PORT) ||3000);
}
bootstrap();
