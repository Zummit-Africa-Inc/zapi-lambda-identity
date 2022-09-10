import {
  Controller,
  Post,
  Body,
  Req,
  Patch,
  Headers,
  Inject,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserSigninDto } from './dto/user-signin.dto';
import { Request } from 'express';
import { Ok, ZaLaResponse } from 'src/common/helpers/response';
import { userSignInType } from 'src/common/types';
import { PasswordForgotEmailDto } from 'src/user/dto/password-email.dto';
import { PasswordResetDto } from 'src/user/dto/password-reset.dto';
import { User } from 'src/entities/user.entity';
import { ClientProxy } from '@nestjs/microservices';
import { DeleteUserDto, UserSignupDto } from './dto/user-signup.dto';
import { TestDto } from './dto/test.dto';

@ApiTags('Auth-Users')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject('NOTIFY_SERVICE') private readonly n_client: ClientProxy,
    @Inject('IDENTITY_SERVICE') private readonly i_client: ClientProxy,
  ) {}

  @Post('/signup')
  @ApiOperation({ description: 'Sign up a User' })
  async signUpUser(@Body() body: UserSignupDto) {
    const response = await this.authService.signup(body);
    return ZaLaResponse.Ok(response, 'user created successfully', '201');
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
  @ApiOperation({ description: 'Sign out a user' })
  async signOutUser(@Headers('authorization') refreshToken: string) {
    await this.authService.signout(refreshToken);
    return ZaLaResponse.Ok('success', 'Logged out successfully', '200');
  }

  @Patch('/change-password')
  @ApiOperation({ description: 'User password change' })
  async changePassword(
    @Headers('authorization') refreshToken: string,
    @Body() body: ChangePasswordDto,
  ) {
    await this.authService.changepassword(refreshToken, body);
    return ZaLaResponse.Ok('Password updated', '200');
  }

  @Post('/token')
  @ApiOperation({ description: 'Get new access token' })
  getAccess(@Body('refreshToken') token: string) {
    return this.authService.getNewTokens(token);
  }
  @Post('/forgot')
  @ApiOperation({ description: 'submit registered email for password reset' })
  async forgotPassword(
    @Body() body: PasswordForgotEmailDto,
  ): Promise<Ok<string[]>> {
    const resetResponse = await this.authService.forgotPassword(body.email);
    return ZaLaResponse.Ok(
      resetResponse,
      "A Reset Link has been sent to the user's registered email",
      '200',
    );
  }

  @Post('/reset')
  @ApiOperation({ description: 'Password reset function' })
  async resetPassword(
    @Headers('authorization') authorizationToken,
    @Body() body: PasswordResetDto,
  ): Promise<Ok<User>> {
    const updatedUser = await this.authService.resetPassword(
      authorizationToken,
      body,
    );
    return ZaLaResponse.Ok(
      updatedUser,
      'user password reset successful',
      '200',
    );
  }

  //Endpoints for communication testing
  @Post('/send_to_core')
  @ApiOperation({ description: 'Core test endpoint' })
  async testIdentity(@Body() body: TestDto): Promise<any> {
    this.i_client.emit('identity_test', body);
  }

  @Post('/send_to_notification')
  @ApiOperation({ description: 'Notification test endpoint' })
  async testNotify(@Body() body: TestDto): Promise<any> {
    this.n_client.emit('notify_test', body);
  }

  @Post('/delete-user')
  @ApiOperation({ description: 'Delete a user' })
  async deleteUserr(@Body() {email}: DeleteUserDto) {
    const response = await this.authService.deleteUser(email);
    return ZaLaResponse.Ok(response, 'user deleted successfully', '200');
  }
}
