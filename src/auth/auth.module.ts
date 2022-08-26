import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailVerificationModule } from 'src/email-verification/email-verification.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    EmailVerificationModule,
    HttpModule
  ],
  controllers: [AuthController],
  providers: [AuthService, EmailVerificationService, JwtService, ConfigService],
  exports:[AuthService]
})
export class AuthModule {}
