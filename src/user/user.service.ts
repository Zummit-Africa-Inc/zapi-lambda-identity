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
import { User} from '../entities/user.entity'
import { UserRole } from '../common/enums/userRole.enum'
import { IsDate } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(LoginHistory)
    private readonly loginHistoryRepo: Repository<LoginHistory>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
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
      await this.userRepo.update(user.id,{user_role: UserRole.admin, isAdmin: true} )
      const updatedUser = await this.userRepo.findOne({where:{id}})
      return updatedUser;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }

  async getallUsers(dateFrom: string): Promise<User[]> {
    try {
      let registeredUsers : User[]
      
      if( dateFrom !== undefined){
        const date =new Date(dateFrom)
        registeredUsers = await this.userRepo.find({
          where: {
            user_role: UserRole.user,
            isEmailVerified: true,
            createdOn: Between( date, moment().toDate())
          }
        })
      } else{
        registeredUsers = await this.userRepo.find({
          where: { 
            user_role: UserRole.user,
            isEmailVerified: true
          },
        });
      }

      if (registeredUsers.length < 1) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Internal server error',
            'users not found',
            '404',
          ),
        );
      }  
      return registeredUsers;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('internal Server error', error.message, '500'),
      );
    }
  }

}

