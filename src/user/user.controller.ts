import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginHistory } from '../entities/loginHistory.entity';
import { ZaLaResponse, Ok } from 'src/common/helpers/response';
import { AxiosResponse } from 'axios';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('history/:userId')
  @ApiOperation({ summary: 'Get user login histories' })
  async getLoginHistory(
    @Param('userId') userId: string,
  ): Promise<Ok<LoginHistory[]>> {
    const histories = await this.userService.getLoginHistories(userId);

    return ZaLaResponse.Ok(histories, 'Ok', 200);
  }

  @Get('subscription-test')
  @ApiOperation({ summary: 'Test api hosted event' })
  async testSubscription(): Promise<AxiosResponse<any>> {
    return await (
      await this.userService.testSubscription()
    ).data;
  }
}
