import { PartialType } from '@nestjs/swagger';
import { UserInfoDto } from './user-info.dto';

export class UpdateUserDto extends PartialType(UserInfoDto) {}
