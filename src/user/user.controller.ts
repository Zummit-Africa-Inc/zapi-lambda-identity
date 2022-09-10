import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation } from '@nestjs/swagger';
import { UserHistory } from './../entities/user-history.entity';
import { ZaLaResponse, Ok } from 'src/common/helpers/response';
import { AxiosResponse } from 'axios';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('history/:userId')
  @ApiOperation({ description: 'Get user login histories' })
  async getLoginHistory(
    @Param('userId') userId: string,
  ): Promise<Ok<UserHistory[]>> {
    const histories = await this.userService.getLoginHistories(userId);

    return ZaLaResponse.Ok(histories, 'Ok', 200);
  }

  @Get('subscription-test')
  @ApiOperation({ description: 'test api hosted event'})
  async testSubscription(): Promise<AxiosResponse<any>>{
    return await (await this.userService.testSubscription()).data
  }
}
