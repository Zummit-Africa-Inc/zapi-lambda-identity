import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserHistory } from './../entities/user-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserHistory])],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
