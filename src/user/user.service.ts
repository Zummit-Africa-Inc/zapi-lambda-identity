import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import * as moment from 'moment';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { configConstant } from 'src/common/constants/config.constant';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Between, Repository } from 'typeorm';
import { LoginHistory } from '../entities/loginHistory.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/enums/userRole.enum';
import { subDays } from 'date-fns';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepo: Repository<LoginHistory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * it get the login history of a user by Id
   * @param {string} id - string - The Id of the user whose login history we want to retrive.
   * @returns an array of UserHistory objects
   */
  async getLoginHistories(id: string): Promise<LoginHistory[]> {
    try {
      const history = await this.loginHistoryRepo.find({
        where: { userId: id },
      });

      if (!history) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Internal server error',
            'user not found',
            '404',
          ),
        );
      }

      return history;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }
  ///ws-notify/subscription-event
  async testSubscription(): Promise<AxiosResponse<any>> {
    try {
      const payload = {
        apiId: 'api',
        profileId: 'profile',
        developerId: 'b77dc7ec-74df-4fa5-ba32-b50fede35785',
      };
      const url = this.configService.get(
        configConstant.baseUrls.notificationService,
      );
      return await lastValueFrom(
        this.httpService.post(`${url}/ws-notify/subscription-event`, payload),
      );
    } catch (err) {
      console.log(err);
    }
  }

  async makeUserAnAdmin(id: string): Promise<User> {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
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
      await this.userRepo.update(user.id, {
        user_role: UserRole.admin,
        isAdmin: true,
      });
      const updatedUser = await this.userRepo.findOne({ where: { id } });
      return updatedUser;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }

  async getallUsers(start_date: string): Promise<any> {
    try {
      let query = this.userRepo
        .createQueryBuilder('user')
        .where('user.isEmailVerified = :isEmailVerified', {
          isEmailVerified: true,
        });

      if (start_date) {
        query = query
          .andWhere('user.createdOn >= :startDate', { start_date })
          .andWhere('user.createdOn <= :endDate', { endDate: new Date() });
      }
      const users = await query
        .select(['user.fullName', 'user.email', 'user.createdOn'])
        .getMany();

      let countQuery = this.userRepo
        .createQueryBuilder('user')
        .where('user.isEmailVerified = :isEmailVerified', {
          isEmailVerified: true,
        });

      if (start_date) {
        countQuery = countQuery
          .andWhere('user.createdOn >= :startDate', { start_date })
          .andWhere('user.createdOn <= :endDate', { endDate: new Date() });
      }

      const userCount = await countQuery.getCount();

      return { userCount, users };
    } catch (error) {
      console.log(error);
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It gets all the users who have verified their email in the last 30 days.
   * @returns An array of objects with the following properties: id, fullName, email.
   */
  async getNewUsers(): Promise<User[]> {
    try {
      const users = this.userRepo
        .createQueryBuilder('user')
        .select(['user.id', 'user.fullName', 'user.email'])
        .where({ isEmailVerified: true })
        .andWhere('user.createdOn >= :lastMonth', {
          lastMonth: subDays(new Date(), 30),
        })
        .getMany();

      return await users;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }
}
