import { ApiProperty } from '@nestjs/swagger'
import {IsEmail, IsString, MinLength, Matches, MaxLength, IsNotEmpty} from 'class-validator'

export class UserSignupDto {
    @IsString()
    @IsNotEmpty({message: 'fullName cannot be empty'})
    @ApiProperty()
    fullName: string

    @IsEmail()
    @IsString()
    @ApiProperty()
    email: string

    @IsString()
    @IsNotEmpty({message: 'password cannot be empty'})
    @ApiProperty()
    @MinLength(8, 
        {message: 'Password is too short. Minimal length is $constraint1 characters, but actual is $value'}
    )
    @MaxLength(20, 
        { message: 'password is too long. Maximal length is $constraint1 characters, but actual is $value'}
    )
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?!.*\s).{8,20}$/, 
        {message: 'password must contain the following: a capital letter, a small letter, and a number'}
    )
    password: string
}
export class DeleteUserDto {
    @IsEmail()
    @IsString()
    @ApiProperty()
    email: string
}
