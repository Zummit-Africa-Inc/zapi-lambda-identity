import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { UserInfoDto } from './dto/user-info.dto';
import { ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserHistory } from './../entities/user-history.entity';
import { ZaLaResponse, Ok } from 'src/common/helpers/response';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get('history/:userId')
  @ApiOkResponse({
    type: [UserInfoDto],
    description: 'Get all histories',
    isArray: true,
  })
  @ApiOperation({ description: 'Get user login histories' })
  async getLoginHistory(
    @Param('userId') userId: string,
  ): Promise<Ok<UserHistory[]>> {
    const histories = await this.userService.getLoginHistories(userId);

    return ZaLaResponse.Ok(histories, 'User logged in histories', 201);
  }
}
