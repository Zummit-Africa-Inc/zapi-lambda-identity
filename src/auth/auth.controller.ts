import { Controller, Post, Body, Req, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { SerializeUserDto } from './dto/serialize-user.dto';
import { UserSigninDto } from './dto/user-signin.dto';
import { UserDto } from '../user/dto/user.dto';
import { Request } from 'express';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { userSignInType } from 'src/common/types';

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
  async signInUser(
    @Body() dto: UserSigninDto,
    @Req() req: Request,
  ): Promise<Ok<userSignInType>> {
    const userSignIn = await this.authService.signin(dto, {
      userAgent: req.headers['user-agent'],
      ipAddress: req.ip,
    });

    return ZaLaResponse.Ok(userSignIn, 'Successfully logged in', 201);
  }

  @Post('/signout')
  @ApiOperation({description: 'Sign out a user'})
  async signOutUser(@Body('refreshToken') refresToken:string) {
    await this.authService.signout(refresToken);
    return ZaLaResponse.Ok('', 'Logged out successfully', '201')
  }

  @Serialize(UserDto)
  @Patch('/change-password/:id')
  @ApiOperation({description: 'User password change'})
  async changePassword(@Param('id') id:string, @Body() body:ChangePasswordDto) {
    await this.authService.changepassword(id, body)
    return ZaLaResponse.Ok('Password updated', '200');
  }

  @Post('/token')
  @ApiOperation({ description: 'Get new access token' })
  getAccess(@Body('refreshToken') token: string) {
    return this.authService.getNewTokens(token);
  }
}
