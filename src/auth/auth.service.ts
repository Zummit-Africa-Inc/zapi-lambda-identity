import { Injectable, BadRequestException,NotAcceptableException } from '@nestjs/common';
import { UserSignupDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { EmailVerificationService } from '../email-verification/email-verification.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private emailVerificationService: EmailVerificationService
    
  ){}
  async signup(user: UserSignupDto) {
    const userdata = Object.assign(new User(), user);
    const newUser = await this.userRepo.save(userdata).catch(async (e) => {
      await this.emailVerificationService.resendVerificationLink(user.email);
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Duplicate Values',
          'The Email already exists',
        ),
        );
    });
    await this.emailVerificationService.sendVerificationLink(newUser.email);
    return newUser
  }
}
