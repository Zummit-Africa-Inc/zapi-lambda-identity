import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHistory } from './../entities/user-history.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([UserHistory]), HttpModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
