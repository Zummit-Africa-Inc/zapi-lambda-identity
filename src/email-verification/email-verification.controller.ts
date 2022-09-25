import { Controller, Body, Post } from '@nestjs/common';
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
}
