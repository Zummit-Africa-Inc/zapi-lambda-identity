import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from 'ormconfig';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    UserModule, 
    AuthModule,
    TypeOrmModule.forRoot(AppDataSource.options)
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
