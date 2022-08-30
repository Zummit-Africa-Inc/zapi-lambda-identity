import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHistory } from './../entities/user-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserHistory])],
  controllers: [UserController],
  providers: [UserService],
})
export class UsersModule {}
