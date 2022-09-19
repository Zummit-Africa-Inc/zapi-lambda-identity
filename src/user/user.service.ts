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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepo: Repository<LoginHistory>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
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
  async testSubscription(): Promise<AxiosResponse<any>>{
    try{
      const payload = {
        apiId: "api",
        profileId: "profile",
        developerId: "b77dc7ec-74df-4fa5-ba32-b50fede35785"
      }
      const url = this.configService.get(configConstant.baseUrls.notificationService)
      return await lastValueFrom(this.httpService.post(`${url}/ws-notify/subscription-event`,payload) )
    }catch(err){
      console.log(err)
    }
  }

}
