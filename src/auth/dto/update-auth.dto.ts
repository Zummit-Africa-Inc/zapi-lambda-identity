import { PartialType } from '@nestjs/swagger';
import { UserSignupDto } from './user-signup.dto';

export class UpdateAuthDto extends PartialType(UserSignupDto) {}
