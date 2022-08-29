import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'ormconfig';
import { UserModule } from './user/user.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { configConstant } from './common/constants/config.constant';

// Create rabbitMQ service to be used in other module
const RabbitMQService = {
  provide: 'IDENTITY_SERVICE',
  useFactory: (configService: ConfigService) => {
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [configService.get(configConstant.amq.url)],
        queue: configService.get(configConstant.amq.queue),
        queueOptions: {
          durable: true,
        },
      },
    })
  },
  inject: [ConfigService]
}
@Global()
@Module({
  imports: [
    UserModule, 
    AuthModule,
    TypeOrmModule.forRoot(AppDataSource.options),
    ConfigModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, RabbitMQService],
  exports: [RabbitMQService],
})
export class AppModule {}
