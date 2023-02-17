import { Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { LoginHistory } from '../entities/loginHistory.entity';
import { User } from '../entities/user.entity';
import { ZaLaResponse, Ok } from 'src/common/helpers/response';
import { AxiosResponse } from 'axios';
import { DefaultValuePipe, ParseIntPipe } from '@nestjs/common/pipes';

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
  @ApiQuery({ name: 'start_date', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiQuery({ name: 'limit', required: false, type: String })
  async getAllUsers(
    @Query('page', new DefaultValuePipe(1)) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('start_date') start_date?: string,
  ): Promise<Ok<any>> {
    const allUsers = await this.userService.getallUsers(
      page,
      limit,
      start_date,
    );
    return ZaLaResponse.Ok(allUsers, 'Users Retreived Successfully', 200);
  }
}
