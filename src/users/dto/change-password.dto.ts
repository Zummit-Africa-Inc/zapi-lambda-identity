import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Input your current password'})
    @ApiProperty()
    oldPassword: string;

    @IsString()
    @IsNotEmpty({ message: 'Input your new password'})
    @MinLength(8, {message: 'Password is too short. Minimum length is $constraint1 characters, but actual is $value'})
    @MaxLength(20, { message: 'Password is too long. Maximum length is $constraint1 characters, but actual is $value'})
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 
        {message: 'Password must contain the following: a capital letter, a number and a special character'}
    )
    @ApiProperty()
    newPassword: string;
}