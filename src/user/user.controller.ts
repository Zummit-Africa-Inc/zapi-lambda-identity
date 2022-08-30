import { Controller, Get, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation } from '@nestjs/swagger';
import { UserHistory } from './../entities/user-history.entity';
import { ZaLaResponse, Ok } from 'src/common/helpers/response';

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
}
