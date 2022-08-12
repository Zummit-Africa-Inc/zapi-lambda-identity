import { Injectable } from '@nestjs/common';
import { UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignupDto } from '../auth/dto/user-signup.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class UsersService {
  create(userSignupDto: UserSignupDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
