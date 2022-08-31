import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class UserInfo {
  @ApiProperty()
  @IsString()
  login_time: string;

  @IsObject()
  @ApiProperty()
  country: { longitude: string; latitude: string };

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
