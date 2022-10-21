import { Injectable } from '@nestjs/common';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    config: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: config.get('CLIENT_ID'),
      clientSecret: config.get('CLIENT_SECRET'),
      callbackURL: config.get('CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails } = profile;
    const user = {
      email: emails[0].value,
      emailVerified: emails[1].value,
      fullNmae: displayName,
      password: accessToken,
    };

    // console.log({
    //   email: emails[0].value,
    //   emailVerified: emails[1].value,
    //   fullName: displayName,
    //   accessToken,

    // });

    // this.authService.googleLogin()

    done(null,user);
  }
}
