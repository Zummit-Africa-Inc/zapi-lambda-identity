import { Injectable, BadRequestException,NotAcceptableException } from '@nestjs/common';
import { UserSignupDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { ChangePasswordDto } from 'src/users/dto/change-password.dto';
import { jwtHelperService } from './jwt-helper.service'

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtHelperService: jwtHelperService
    
  ){}
  async signup(user: UserSignupDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.userRepo.save(userdata).catch(async (e) => {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Duplicate Values',
          'The Email already exists',
        ),
        );
    });
    return newUser
  }

  /**
   * User sign out
   */
  async signout(refreshToken: string) {
    let check = await this.userRepo.findOne({ where: { refreshToken: refreshToken }})

    if (!check) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Invalid Refresh Token',
          'Get the correct refresh token and try again'
        )
      );
    }

    await this.userRepo.update(
      { refreshToken: refreshToken}, {refreshToken: null}
    );
    return ZaLaResponse.Ok('', 'Logged out successfully', 201)
  }

  /**
   * Change Password
   */
  async changepassword(id:string, dto: ChangePasswordDto) {
    const user = await this.userRepo.findOne({ where: { id: id}})
    const currentPasswordHash = user.password;

    const oldPasswordHash = await this.jwtHelperService.hashPassword(
      dto.oldPassword,
      user.password.split(':')[0]
    );

    const comparePassword = oldPasswordHash == currentPasswordHash
    if(!comparePassword) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          `Access Denied!`,
          `The password provided doesn't match`,
          `401`
        ),
      );
    }

    const newPasswordHash = await this.jwtHelperService.hashPassword(
      dto.newPassword,
      user.password.split(':')[0]
    );
    return await this.userRepo.update(id, {password: newPasswordHash})
  }
}
