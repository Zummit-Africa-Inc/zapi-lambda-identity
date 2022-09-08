import { HttpService } from '@nestjs/axios';
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { Repository } from 'typeorm';
import { UserHistory } from './../entities/user-history.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserHistory)
    private readonly userHistoryRepo: Repository<UserHistory>,
    private readonly httpService: HttpService
  ) {}

  /**
   * it get the login history of a user by Id
   * @param {string} id - string - The Id of the user whose login history we want to retrive.
   * @returns an array of UserHistory objects
   */
  async getLoginHistories(id: string): Promise<UserHistory[]> {
    try {
      const history = await this.userHistoryRepo.find({
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

  async testSubscription(){
    try{
      const url : string = `${process.env.NOTIFICATION_SERVICE_URL}/ws-notify/subscription-event`
      const data : object = {apiId:"test api",
                            profileId:"test profile",
                            developerId : "b77dc7ec-74df-4fa5-ba32-b50fede35785"}
      
      return this.httpService.post(url,data)  
    }catch(err){
      console.log(err)
    }
  }

}
