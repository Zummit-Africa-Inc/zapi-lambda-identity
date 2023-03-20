import { Controller, Body, Post, Get, Param } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { ZaLaResponse } from 'src/common/helpers/response';
import { SignupOTPDto } from './dto/email-token.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('Email-verification')
@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificatioService: EmailVerificationService,
  ) {}

  @Post('/confirm')
  @ApiOperation({ summary: 'Verify your email' })
  async verifyEmail(@Body() signupOTPDto: SignupOTPDto) {
    const user = await this.emailVerificatioService.decodeEmailToken(
      signupOTPDto,
    );
    return ZaLaResponse.Ok<object>({ user }, 'Profile created', 201);
  }
  @Get('/getotp')
  @ApiOperation({ summary: 'Get all otps' })
  async getOtp() {
    const users = await this.emailVerificatioService.getOtp(
    );
    return ZaLaResponse.Ok(users, 'done', 200);
  }
}
