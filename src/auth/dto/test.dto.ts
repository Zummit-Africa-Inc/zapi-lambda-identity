import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class TestDto {
  @IsString()
  @IsNotEmpty({ message: 'Firstname cannot be empty' })
  @ApiProperty()
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Lastname cannot be empty' })
  @ApiProperty()
  lastName: string;
}
