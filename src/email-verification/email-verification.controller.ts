import { Controller, Param, Get } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { EmailTokenDto } from './dto/email-token.dto';
import { ZaLaResponse } from 'src/common/helpers/response';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(
    private readonly emailVerificatioService: EmailVerificationService,
  ) {}

  @Get('/:token')
  async verifyEmail(@Param('token') emailTokenDto: string) {
    const user = await this.emailVerificatioService.decodeEmailToken(emailTokenDto);
    return ZaLaResponse.Ok<object>({user} , 'Profile created', 201);
  }
}
