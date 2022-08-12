import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Next,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants/jwt.constant';
import { ZaLaResponse } from '../common/helpers/response';
import { randomBytes, pbkdf2Sync } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class JwtHelperService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwTokenService: JwtService,
    private configService: ConfigService,
  ) {}

  async signAccess(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    return this.jwTokenService.sign(payload, {
      secret: await this.configService.get(jwtConstants.access_secret),
      expiresIn: await this.configService.get(jwtConstants.access_time),
    });
  }

  async signRefresh(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    let refreshToken = this.jwTokenService.sign(payload, {
      secret: await this.configService.get(jwtConstants.refresh_secret),
      expiresIn: await this.configService.get(jwtConstants.refresh_time),
    });

    let user = await this.userRepo.findOne({ where: { id: payload.id } });
    await this.userRepo.update(user.id, { refreshToken }).catch((err) => {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('user not found', 'This user does not exist'),
      );
    });
    return refreshToken;
  }

  async hashPassword(password: string, salt?: string) {
    if (!salt) salt = randomBytes(32).toString('hex');
    let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    let hashedPassword = `${salt}:${hash}`;
    return hashedPassword;
  }
}
