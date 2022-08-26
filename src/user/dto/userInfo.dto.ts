import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserInfo {
  @ApiProperty()
  @IsString()
  login_time: string;

  @IsString()
  @ApiProperty()
  country: string;

  @IsString()
  @ApiProperty()
  ip_address: string;

  @IsString()
  @ApiProperty()
  browser_name: string;

  @IsString()
  @ApiProperty()
  os_name: string;
}
