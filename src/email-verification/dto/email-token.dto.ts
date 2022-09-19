import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class SignupOTPDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  otp: string;
}
