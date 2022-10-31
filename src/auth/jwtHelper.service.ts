import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Next,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../common/constants/jwt.constant';
import { configConstant } from '../common/constants/config.constant';
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
    try {
      return this.jwTokenService.sign(payload, {
        secret: await this.configService.get(jwtConstants.access_secret),
        expiresIn: await this.configService.get(jwtConstants.access_time),
      });
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }
  async googleUserTokens(
    value: {
      userAgent: string;
      ipAddress: string;
    },
    user,
  ) {
    try {
      const refreshobject = {
        userAgent: value.userAgent,
        ipAddress: value.ipAddress,
        profileId: user.profileID,
        id: user.id,
      };
      return {
        access: this.jwTokenService.sign(refreshobject, {
          secret: await this.configService.get(jwtConstants.access_secret),
          expiresIn: await this.configService.get(jwtConstants.access_time),
        }),
        refresh: this.jwTokenService.sign(refreshobject, {
          secret: await this.configService.get(jwtConstants.refresh_secret),
          expiresIn: await this.configService.get(jwtConstants.refresh_time),
        }),
      };
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async signRefresh(payload: {
    userAgent: string;
    ipAddress: string;
    id: string;
  }) {
    try {
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
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async hashPassword(password: string, salt?: string) {
    try {
      if (!salt) salt = randomBytes(32).toString('hex');

      let hash = pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
      let hashedPassword = `${salt}:${hash}`;
      return hashedPassword;
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async getNewTokens(refreshToken: string) {
    try {
      let payload = this.jwTokenService.verify(refreshToken, {
        secret: await this.configService.get(jwtConstants.refresh_secret),
      });
      payload = {
        id: payload.id,
        ipAddress: payload.ipAddress,
        userAgent: payload.userAgent,
      };

      let verified = await this.userRepo.findOne({
        where: {
          refreshToken: refreshToken,
        },
      });
      if (verified) {
        return {
          access: await this.signAccess(payload),
        };
      } else throw new Error();
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Invalid Refresh Token',
          'Get the correct refresh token and try again',
        ),
      );
    }
  }

  async newPasswordHash(passwords: {
    newPassword: string;
    oldPassword: string;
  }) {
    try {
      let salt = randomBytes(32).toString('hex');
      let hash = pbkdf2Sync(
        passwords.newPassword,
        salt,
        1000,
        64,
        'sha512',
      ).toString('hex');
      let hashedPassword = `${salt}:${hash}`;

      /* check if the new password is the same as the old one stored in the database */
      var oldSalt = passwords.oldPassword.split(':')[0];
      var oldHash = passwords.oldPassword.split(':')[1];
      let compareHash = pbkdf2Sync(
        passwords.newPassword,
        oldSalt,
        1000,
        64,
        'sha512',
      ).toString('hex');
      if (oldHash === compareHash) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'password Unchanged',
            'New Password should not be the same as Old password',
            '400',
          ),
        );
      }

      return hashedPassword;
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async signReset(payload: { id: string; userEmail: string }) {
    try {
      let resetToken = this.jwTokenService.sign(payload, {
        secret: await this.configService.get(configConstant.jwt.reset_secret),
        expiresIn: await this.configService.get(configConstant.jwt.reset_time),
      });

      return resetToken;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async verifyReset(token: string) {
    try {
      const decode = await this.jwTokenService.verify(token, {
        secret: await this.configService.get(configConstant.jwt.reset_secret),
      });

      return decode;
    } catch (error) {
      throw new ForbiddenException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async changeJwtExpiry(token: string) {
    try {
      const { id, userEmail } = await this.jwTokenService.verify(token, {
        secret: await this.configService.get(configConstant.jwt.refresh_secret),
      });
      let expiringToken = this.jwTokenService.sign(
        { id, userEmail },
        {
          secret: await this.configService.get(
            configConstant.jwt.refresh_secret,
          ),
          expiresIn: '5m',
        },
      );
      return expiringToken;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }
}

