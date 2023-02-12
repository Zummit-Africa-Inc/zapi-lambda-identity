import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { LoginHistory } from '../entities/loginHistory.entity';
import { User } from '../entities/user.entity';
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

  @Patch('make-admin/:userId')
  @ApiOperation({ summary: 'Convert An Existing User To An Admin' })
  async makeAdmin(@Param('userId') id: string): Promise<Ok<User>> {
    const admin = await this.userService.makeUserAnAdmin(id);
    return ZaLaResponse.Ok(admin, 'Admin Created', 201);
  }

  @Get('all-registered-users')
  @ApiOperation({ summary: 'Get All Registered Users' })
  async getAllUsers(@Param('start_date') start_date: string): Promise<Ok<any>> {
    const allUsers = await this.userService.getallUsers(start_date);
    return ZaLaResponse.Ok(allUsers, 'Users Retreived Successfully', 200);
  }
  @Get('usersInLast30days')
  @ApiOperation({ summary: 'Get all verified users within the last 30 days' })
  async getNewUsers(): Promise<Ok<User[]>> {
    const newUsers = await this.userService.getNewUsers();
    return ZaLaResponse.Ok(newUsers, 'Users Retreived Successfully', 200);
  }
}
