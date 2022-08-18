import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { ZaLaResponse } from '../common/helpers/response';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';


@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  async checkUserExists(userId) {
    const userExists = await this.usersRepo.findOneBy({ id: userId });
    if (!userExists) {
      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest(
          'Not found',
          `User with id : ${userId} does not exist`,
          '404',
        ),
      );
    }
    return userExists;
  }

  async findById(id: string) {
    //check if user exists
    const user = await this.checkUserExists(id);
    //return user
    return user;
  }
}
