import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsEmail,
  MinLength,
  MaxLength,
  Matches,
  IsBIC,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { UserInfo } from 'src/user/dto/userInfo.dto';

export class GoogleSigninDto {
  @IsEmail()
  @IsString()
  @ApiProperty()
  email: string;
  @IsBoolean()
  @ApiProperty()
  emailVerified: boolean;
  @IsString()
  @IsNotEmpty({ message: 'fullName cannot be empty' })
  @ApiProperty()
  fullNmae: string;

  accessToken: string;
  @IsOptional()
  @ApiProperty()
  userInfo: UserInfo;
}

export class GoogleSignupDto {
  @IsString()
  @IsNotEmpty({ message: 'fullName cannot be empty' })
  @ApiProperty()
  fullName: string;

  @IsEmail()
  @IsString()
  @ApiProperty()
  email: string;

  // @IsEmail()

  // @ApiProperty()
  // emailVerified: boolean;

  // @IsString()
  // @IsNotEmpty({message: 'password cannot be empty'})
  // @ApiProperty()
  // @MinLength(8,
  //     {message: 'Password is too short. Minimal length is $constraint1 characters, but actual is $value'}
  // )
  // @MaxLength(20,
  //     { message: 'password is too long. Maximal length is $constraint1 characters, but actual is $value'}
  // )
  // @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,20}$/,
  //     {message: 'password must contain the following: a capital letter, a small letter, and a number'}
  // )
  // password: string
}
