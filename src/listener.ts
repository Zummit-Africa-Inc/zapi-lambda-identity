import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_QUEUE],
            queue: process.env.RABBITMQ_URL,
            queueOptions: {
                durable: false
            },
        },
    })

    app.listen()
}

bootstrap();
  