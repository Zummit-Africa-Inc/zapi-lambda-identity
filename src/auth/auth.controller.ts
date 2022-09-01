import { Controller, Post, Body, Req, Param, Patch, Headers } from '@nestjs/common';
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
import { PasswordForgotEmailDto } from 'src/user/dto/password-email.dto';
import { PasswordResetDto } from 'src/user/dto/password-reset.dto';
import { User } from 'src/entities/user.entity';

@ApiTags('Auth-Users')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

 @Post('/signup')
  @ApiOperation({ description: 'Sign up a User' })
  async signUpUser(@Body() body: UserSignupDto) {
    const user = await this.authService.signup(body);
    return ZaLaResponse.Ok(user, "user created successfully", "201")
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
  async signOutUser(@Body('refreshToken') refreshToken:string) {
    await this.authService.signout(refreshToken);
    return ZaLaResponse.Ok('', 'Logged out successfully', '201')
  }

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
  @Post('/forgot')
  @ApiOperation({description: 'submit registered email for password reset'})
  async forgotPassword(
    @Body() body: PasswordForgotEmailDto
  ):Promise<Ok<string[]>> {
    const resetResponse = await this.authService.forgotPassword(body.email)
    return ZaLaResponse.Ok(resetResponse, "A Reset Link has been sent to the user's registered email", "200")
  }
 
  @Post('/reset')
  @ApiOperation({description: "Password reset function"})
  async resetPassword(
    @Headers('authorization') authorizationToken,
    @Body() body: PasswordResetDto
  ): Promise<Ok<User>>{
    const updatedUser = await this.authService.resetPassword(authorizationToken, body)
    return ZaLaResponse.Ok(updatedUser, "user password reset successful", "200")
  }

}
