import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EmailVerificationController } from './email-verification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { UserService } from '../user/user.service';
import { AuthService } from '../auth/auth.service';
import { LoginHistory } from '../entities/loginHistory.entity';
import { JwtHelperService } from './../auth/jwtHelper.service';
import { OneTimePassword } from '../entities/otp.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LoginHistory, OneTimePassword]),
    JwtModule.register({ publicKey: 'PUBLIC_KEY', privateKey: 'PRIVATE_KEY' }),
    HttpModule,
    ConfigModule,
  ],
  providers: [
    EmailVerificationService,
    JwtHelperService,
    UserService,
    AuthService,
  ],
  controllers: [EmailVerificationController],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
