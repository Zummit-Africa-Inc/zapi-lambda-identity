import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtHelperService } from './jwtHelper.service';
import { JwtModule } from '@nestjs/jwt';
import { UserHistory } from './../entities/user-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserHistory]),
    JwtModule.register({
      publicKey: 'PUBLIC_KEY',
      privateKey: 'PRIVATE_KEY',
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtHelperService],
})
export class AuthModule {}
