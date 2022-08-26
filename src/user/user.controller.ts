import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserDto } from '../user/dto/user.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Serialize(UserDto)
  @Get('/:userId')
  @ApiOperation({ description: 'Find a user by Id' })
  async findUserById(@Param('userId') userId: string) {
    return await this.userService.findById(userId);
  }

 
}
