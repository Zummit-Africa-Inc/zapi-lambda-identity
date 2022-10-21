import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'ormconfig';
import { UsersModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { queue } from './common/Micoservices/RabbitMqQueues';
import { APP_GUARD } from '@nestjs/core';
import { GoogleAuthGuard } from './common/guards/google-auth.guard';
import { PassportModule } from '@nestjs/passport';

/* Creating a queue for the microservice. */
const IdentityService = queue(
  'IDENTITY_SERVICE',
  process.env.NODE_ENV !== 'production'
    ? process.env.DEV_IDENTITY_QUEUE
    : process.env.IDENTITY_QUEUE,
);
const NotifyService = queue(
  'NOTIFY_SERVICE',
  process.env.NODE_ENV !== 'production'
    ? process.env.DEV_NOTIFY_QUEUE
    : process.env.NOTIFY_QUEUE,
);

@Global()
@Module({
  imports: [
    UsersModule,
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    PassportModule.register({ session: true }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    IdentityService,
    NotifyService,
    {
      provide: APP_GUARD,
      useClass: GoogleAuthGuard,
    },
  ],
  exports: [IdentityService, NotifyService],
})
export class AppModule {}
