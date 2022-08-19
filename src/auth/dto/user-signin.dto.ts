import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { UserInfoDto } from '../../users/dto/user-info.dto';

export class UserSigninDto {
  @IsString()
  @IsEmail()
  @ApiProperty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  password: string;

  @IsOptional()
  @ApiProperty()
  userInfo: UserInfoDto;
}
