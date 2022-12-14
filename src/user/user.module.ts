import { Module } from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginHistory } from '../entities/loginHistory.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [TypeOrmModule.forFeature([LoginHistory, User]), HttpModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
