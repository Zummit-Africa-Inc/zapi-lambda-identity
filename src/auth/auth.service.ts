import { Injectable, BadRequestException } from '@nestjs/common';
import { UserSignupDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { UserSigninDto } from './dto/user-signin.dto';
import { JwtHelperService } from './jwtHelper.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtHelperService: JwtHelperService,
  ) {}
  async signup(user: UserSignupDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.userRepo.save(userdata).catch(async (e) => {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Duplicate Values', 'The Email already exists'),
      );
    });
    return newUser;
  }

  async signin(
    dto: UserSigninDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    const user = await this.userRepo.findOne({ where: { email: dto.email } });

    if (!user)
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Not found', 'Invalid Credentials!'),
      );

    const hash = await this.jwtHelperService.hashPassword(
      dto.password,
      user.password.split(':')[0],
    );

    let isPasswordCorrect = hash == user.password;
    if (!isPasswordCorrect)
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Access Denied!', 'Incorrect Credentials'),
      );

    const tokens = await this.getNewRefreshAndAccessTokens(values, user);

    // add userInfo to the list of user history and return along in the response
    await this.userRepo.update(user.id, {
      history: [...user.history, dto.userInfo],
    });

    return ZaLaResponse.Ok<object>(
      {
        ...tokens,
        userId: user.id,
        profileId: user.profileID,
        email: user.email,
        fullName: user.fullName,
        history: user.history,
      },
      'Successfully logged in',
      201,
    );
  }

  async getNewRefreshAndAccessTokens(
    values: { userAgent: string; ipAddress: string },
    user,
  ) {
    const refreshobject = {
      userAgent: values.userAgent,
      ipAddress: values.ipAddress,
      id: user.id,
    };

    return {
      access: await this.jwtHelperService.signAccess(refreshobject),
      refresh: await this.jwtHelperService.signRefresh(refreshobject),
    };
  }
}
