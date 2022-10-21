import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { JwtHelperService } from './jwtHelper.service';
import { JwtModule } from '@nestjs/jwt';
import { LoginHistory } from '../entities/loginHistory.entity';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationModule } from 'src/email-verification/email-verification.module';
import { HttpModule } from '@nestjs/axios';
import { OneTimePassword } from 'src/entities/otp.entity';
import { APP_GUARD } from '@nestjs/core';
import { GoogleAuthGuard } from 'src/common/guards/google-auth.guard';
import { GoogleStrategy } from 'src/common/strategy/google.strategy';
import { SessionSerializer } from 'src/common/serializer/serilizer';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, LoginHistory, OneTimePassword]),
    EmailVerificationModule,
    HttpModule,
    JwtModule.register({
      publicKey: 'PUBLIC_KEY',
      privateKey: 'PRIVATE_KEY',
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    EmailVerificationService,
    JwtHelperService,
    JwtService,
    ConfigService,
    GoogleStrategy,
    SessionSerializer,
    {
      provide: APP_GUARD,
      useClass: GoogleAuthGuard,
    },
  ],
})
export class AuthModule {}
