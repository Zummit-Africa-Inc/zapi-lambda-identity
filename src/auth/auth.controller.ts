import { Controller, Post, Body, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { SerializeUserDto } from './dto/serialize-user.dto';
import { UserSigninDto } from './dto/user-signin.dto';
import { Request } from 'express';

@ApiTags('Auth-Users')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Serialize(SerializeUserDto)
  @Post('/signup')
  @ApiOperation({ description: 'Sign up a User' })
  async signUpUser(@Body() body: UserSignupDto) {
    const user = await this.authService.signup(body);
    return user;
  }

  @Post('/signin')
  @ApiOperation({ description: 'Sign in a User' })
  async signInUser(@Body() dto: UserSigninDto, @Req() req: Request) {
    return this.authService.signin(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });
  }

  @Post('/token')
  @ApiOperation({ description: 'Get new access token' })
  getAccess(@Body('refreshToken') token: string) {
    return this.authService.getNewTokens(token);
  }
}
