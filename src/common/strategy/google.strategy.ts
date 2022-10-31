import { Injectable } from '@nestjs/common';
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from 'src/auth/auth.service';
import { SignUpType } from '../enum';

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
        accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { displayName, emails } = profile;
    const user = {
      fullName: displayName,
      email: emails[0].value,
      signUpType: SignUpType.PROVIDER
     
    };

    this.authService.googleSignup(user)

    done(null,user);
  }
}
    