import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Matches, MaxLength, MinLength} from "class-validator";

export class ChangePasswordDto {
    @IsString()
    @IsNotEmpty({ message: 'Input your current password'})
    @ApiProperty()
    oldPassword: string;

    @IsString()
    @IsNotEmpty({message: 'Input new password'})
    @ApiProperty()
    @MinLength(8, 
        {message: 'Password is too short. Minimal length is $constraint1 characters, but actual is $value'}
    )
    @MaxLength(20, 
        { message: 'password is too long. Maximal length is $constraint1 characters, but actual is $value'}
    )
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, 
        {message: 'password must contain the following: a capital letter, a number and a special character'}
    )
    newPassword: string
}