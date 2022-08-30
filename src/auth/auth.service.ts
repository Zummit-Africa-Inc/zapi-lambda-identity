import { Injectable, BadRequestException, Inject } from '@nestjs/common';
import { UserSignupDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { UserSigninDto } from './dto/user-signin.dto';
import { JwtHelperService } from './jwtHelper.service';
import { UserHistory } from './../entities/user-history.entity';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(UserHistory)
    private userHistoryRepo: Repository<UserHistory>,
    private jwtHelperService: JwtHelperService,
    private emailVerificationService: EmailVerificationService,
  ) {}

  async signup(user: UserSignupDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.userRepo.save(userdata).catch(async (error) => {
      this.emailVerificationService.resendVerificationLink(user.email);
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Duplicate Values',
          'The Email already exists',
          error.errorCode,
        ),
      );
    });
    this.emailVerificationService.sendVerificationLink(newUser.email);
    return newUser;
  }

  /**
   * it sign in a user with a correct crendential
   * @param dto - object containing signin crendentials
   * @param values - an object conting userAgen and IpAddress of the user
   * @returns {userSignInType} object containing information about the signin user
   */
  async signin(
    dto: UserSigninDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    try {
      // Find and check if user exist
      const user = await this.userRepo.findOne({ where: { email: dto.email } });

      if (!user)
        throw new BadRequestException(
          ZaLaResponse.BadRequest('Not found', 'Invalid Credentials!'),
        );

      // compare user password with the has password and check if it corresponds
      const hash = await this.jwtHelperService.hashPassword(
        dto.password,
        user.password.split(':')[0],
      );

      const isPasswordCorrect = hash == user.password;
      if (!isPasswordCorrect)
        throw new BadRequestException(
          ZaLaResponse.BadRequest('Access Denied!', 'Incorrect Credentials'),
        );

      // generate access and refrest token for successfull logedIn user
      const tokens = await this.getNewRefreshAndAccessTokens(values, user);

      // add userInfo to the list of user history
      const createHistory = this.userHistoryRepo.create({
        login_time: dto.userInfo.login_time,
        country: dto.userInfo.country,
        ip_address: dto.userInfo.ip_address,
        browser_name: dto.userInfo.browser_name,
        os_name: dto.userInfo.os_name,
        history: user,
      });
      await this.userHistoryRepo.save(createHistory);

      return {
        ...tokens,
        userId: user.id,
        profileId: user.profileID,
        email: user.email,
        fullName: user.fullName,
      };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async getNewRefreshAndAccessTokens(
    values: { userAgent: string; ipAddress: string },
    user,
  ) {
    try {
      // creating payload to be used for generation tokens
      const refreshobject = {
        userAgent: values.userAgent,
        ipAddress: values.ipAddress,
        id: user.id,
      };

      return {
        access: await this.jwtHelperService.signAccess(refreshobject),
        refresh: await this.jwtHelperService.signRefresh(refreshobject),
      };
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async getNewTokens(refreshToken: string) {
    return await this.jwtHelperService.getNewTokens(refreshToken);
  }
}
