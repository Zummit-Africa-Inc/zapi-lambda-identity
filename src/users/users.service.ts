import { Injectable, NotFoundException } from '@nestjs/common';
import { UserInfoDto } from './dto/user-info.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserSignupDto } from '../auth/dto/user-signup.dto';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async getLoginHistories(id: string) {
    const user = await this.usersRepo.findOne({ where: { id: id } });
    if (!user) {
      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest(
          'Internal server error',
          'user not found',
          '404',
        ),
      );
    }

    return user.histories;
  }
}
