import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
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
    try {
      // Query userHistories relation from user Table
      const user = await this.usersRepo.findOne({
        where: { id: id },
        relations: ['histories'],
      });

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
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }
}
