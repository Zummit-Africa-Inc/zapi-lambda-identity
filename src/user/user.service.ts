import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { AxiosResponse } from 'axios';
import { lastValueFrom } from 'rxjs';
import { configConstant } from 'src/common/constants/config.constant';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';
import { LoginHistory } from '../entities/loginHistory.entity';
import { User } from '../entities/user.entity';
import { UserRole } from '../common/enums/userRole.enum';
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

  /**
   * It gets all users from the database, and returns the count of users, the users, and the pagination
   * details.
   * @param {number} page - number,
   * @param {number} limit - number,
   * @param {string} start_date - string,
   * @returns paginated user array
   *     "
   */
  async getallUsers(
    page: number,
    limit: number,
    start_date: string,
  ): Promise<any> {
    try {
      let query = this.userRepo
        .createQueryBuilder('user')
        .where('user.isEmailVerified = :isEmailVerified', {
          isEmailVerified: true,
        });

      if (start_date) {
        query = query
          .andWhere('user.createdOn >= :start_date', {
            start_date: new Date(start_date),
          })
          .andWhere('user.createdOn <= :end_date', { end_date: new Date() });
      }
      const users = await query
        .select(['user.fullName', 'user.email', 'user.createdOn'])
        .offset((page - 1) * limit)
        .limit(limit)
        .getMany();

      let countQuery = this.userRepo
        .createQueryBuilder('user')
        .where('user.isEmailVerified = :isEmailVerified', {
          isEmailVerified: true,
        });

      if (start_date) {
        countQuery = countQuery
          .andWhere('user.createdOn >= :start_date', {
            start_date: new Date(start_date),
          })
          .andWhere('user.createdOn <= :end_date', { end_date: new Date() });
      }

      const userCount = await countQuery.getCount();
      return {
        userCount,
        data: users,
        pagination: {
          total: userCount,
          page,
          limit,
        },
      };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }
}
