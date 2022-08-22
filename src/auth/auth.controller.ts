import { Controller, Post, Body, Param, Patch } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserSignupDto } from './dto/user-signup.dto';
import { Serialize } from '../common/interceptors/serialize.interceptor';
import { SerializeUserDto } from './dto/serialize-user.dto';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { ZaLaResponse } from 'src/common/helpers/response';


@ApiTags("Auth-Users")
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ){}

  @Serialize(SerializeUserDto)
  @Post('/signup')
  @ApiOperation({description: 'Sign up a User'})
  async signUpUser(@Body() body: UserSignupDto){
    const user = await this.authService.signup(body);
    return user;
  }

  @Post('/signout')
  @ApiOperation({description: 'Sign out a User'})
  async SignOutUser(@Body('refreshToken') refreshToken: string) {
    return await this.authService.signout(refreshToken);
  }
  
  @Serialize(UserDto)
  @Patch('/change-password/:id')
  @ApiOperation({description: 'User password change'})
  async changePassword(@Param('id') id:string, @Body() body:ChangePasswordDto) {
    await this.authService.changepassword(id, body)
    return ZaLaResponse.Ok('Password updated', '200');
  }

}
