import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { UserSignupDto } from './dto/user-signup.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { ZaLaResponse } from 'src/common/helpers/response';
import { UserSigninDto } from './dto/user-signin.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { JwtHelperService } from './jwtHelper.service';
import { LoginHistory } from '../entities/loginHistory.entity';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { PasswordResetDto } from '../user/dto/password-reset.dto';
import { OneTimePassword } from 'src/entities/otp.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { configConstant } from '../common/constants/config.constant';
import { OAuthDto } from './dto/oAuth.dto';
import { OAuth2Client } from 'google-auth-library';
import { UserInfo } from './../user/dto/userInfo.dto';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(LoginHistory)
    private userHistoryRepo: Repository<LoginHistory>,
    @InjectRepository(OneTimePassword)
    private otpRepo: Repository<OneTimePassword>,
    private jwtHelperService: JwtHelperService,
    private emailVerificationService: EmailVerificationService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async signup(user: UserSignupDto): Promise<string> {
    // const userdata = Object.assign(new User(), user);
    const userExists = await this.userRepo.findOne({
      where: { email: user.email },
    });
    if (userExists) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Duplicate Values',
          'The Email already exists',
          '400',
        ),
      );
    }
    const newUser = this.userRepo.create(user);
    await this.userRepo.save(newUser);
    await this.emailVerificationService.sendVerificationLink(user.email);
    return 'Signup Successful, check your email to complete the sign up';
    // const newUser = await this.userRepo.save(userdata).catch(async (error) => {
    //   this.emailVerificationService.resendVerificationLink(user.email);
    //   throw new BadRequestException(
    //     ZaLaResponse.BadRequest(
    //       'Duplicate Values',
    //       'The Email already exists',
    //       error.errorCode,
    //     ),
    //   );
    // });
    // await this.emailVerificationService.sendVerificationLink(newUser.email);
    // return 'Signup Successful, check your email to complete the sign up';
  }

  /**
   * it sign in a user with a correct crendential
   * @param dto - object containing signin crendentials
   * @param values - an object containing userAgent and IpAddress of the user
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

      // generate access and refrest token for successful logedIn user
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
      user.refreshToken = tokens.refresh;

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

  /**
   * it create a user with a correct crendentials from the decoded token
   * @param dto - object containing token
   * @param values - an object containing userAgent and IpAddress of the user
   * @returns {userSignInType} object containing information about the signin user
   */
  async googleSignin(
    dto: OAuthDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    try {
      const client = new OAuth2Client(
        await this.configService.get(configConstant.google.clientID),
        await this.configService.get(configConstant.google.secretID),
        'postmessage',
      );

      const getTokenFromCLient = await client.getToken(dto.token);

      const verifyClientToken = await client.verifyIdToken({
        idToken: getTokenFromCLient.tokens.id_token,
        audience: await this.configService.get(configConstant.google.clientID),
      });
      const { name, email } = verifyClientToken.getPayload();

      const existing_user = await this.userRepo.findOne({ where: { email } });

      // check if user does not have an account
      // it create an account and profile then logs the user in with a generated token
      // else: if the user already exist, it logs the use in
      if (!existing_user) {
        const newUser = this.userRepo.create({
          id: uuidv4(),
          email: email,
          fullName: name,
          isGoogleAuthUser: true,
        });

        await this.emailVerificationService.markEmailAsConfirmed(newUser.email);

        let userProfile =
          await this.emailVerificationService.createGoogleUserProfile(newUser);
        const profileID = userProfile.data.id;

        const tokens = await this.jwtHelperService.googleUserTokens(
          values,
          newUser,
        );
        newUser.profileID = profileID;
        newUser.refreshToken = tokens.refresh;
        await this.userRepo.save(newUser);
        this.createLoginHistory(dto.userInfo, newUser);

        return {
          ...tokens,
          userId: newUser.id,
          profileId: newUser.profileID,
          email: newUser.email,
          fullName: newUser.fullName,
        };
      } else {
        const tokens = await this.jwtHelperService.googleUserTokens(
          values,
          existing_user,
        );
        this.createLoginHistory(dto.userInfo, existing_user);
        existing_user.refreshToken = tokens.refresh;

        return {
          ...tokens,
          userId: existing_user.id,
          profileId: existing_user.profileID,
          email: existing_user.email,
          fullName: existing_user.fullName,
        };
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async githuAccessToken(
    dto: OAuthDto,
    values: { userAgent: string; ipAddress: string },
  ) {
    const params = `?client_id=${process.env.GITHUB_CLIENT_ID}&client_secret=${process.env.GITHUB_CLIENT_SECRET}&code=${dto.token}`;

    try {
      // Get access token to make request to Github endpoints
      const getAccessToken = await this.httpService.axiosRef({
        method: 'post',
        url: 'https://github.com/login/oauth/access_token' + params,
        headers: {
          accept: 'application/json',
        },
      });

      if (getAccessToken.data.error) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Token Not Retrived',
            'Error occured while getting Access token',
            '400',
          ),
        );
      }
      const { access_token } = getAccessToken.data;

      if (access_token) {
        // get the github profile information with the access token
        const getUserData = await this.httpService.axiosRef({
          method: 'get',
          url: 'https://api.github.com/user',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (getUserData.data.error) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'User Not Retrived',
              'Error occured while getting user infomation',
              '400',
            ),
          );
        }
        const { name } = getUserData.data;

        // get the profile email address regradless of private or public profile
        const getUserEmail = await this.httpService.axiosRef({
          method: 'get',
          url: 'https://api.github.com/user/emails',
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${access_token}`,
          },
        });

        if (getUserEmail.data.error) {
          throw new BadRequestException(
            ZaLaResponse.BadRequest(
              'User Not Retrived',
              'Error occured while getting user Email',
              '400',
            ),
          );
        }
        const email = getUserEmail.data[0].email;
        const existing_user = await this.userRepo.findOne({
          where: { email },
        });

        if (!existing_user) {
          return await this.oAuthNewUser(email, name, values, dto);
        } else {
          return await this.oAuthExistingUser(existing_user, dto, values);
        }
      }
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async oAuthNewUser(email: string, name: string, values, dto) {
    const newUser = this.userRepo.create({
      id: uuidv4(),
      email: email,
      fullName: name,
      isGoogleAuthUser: true,
    });

    await this.emailVerificationService.markEmailAsConfirmed(newUser.email);
    let userProfile =
      await this.emailVerificationService.createGoogleUserProfile(newUser);
    const profileID = userProfile.data.id;

    const tokens = await this.jwtHelperService.googleUserTokens(
      values,
      newUser,
    );
    newUser.profileID = profileID;
    newUser.refreshToken = tokens.refresh;
    await this.userRepo.save(newUser);
    this.createLoginHistory(dto.userInfo, newUser);

    return {
      ...tokens,
      userId: newUser.id,
      profileId: newUser.profileID,
      email: newUser.email,
      fullName: newUser.fullName,
    };
  }
  async oAuthExistingUser(existing_user, dto, values) {
    const tokens = await this.jwtHelperService.googleUserTokens(
      values,
      existing_user,
    );
    this.createLoginHistory(dto.userInfo, existing_user);
    existing_user.refreshToken = tokens.refresh;

    return {
      ...tokens,
      userId: existing_user.id,
      profileId: existing_user.profileID,
      email: existing_user.email,
      fullName: existing_user.fullName,
    };
  }

  async createLoginHistory(userInfo: UserInfo, user: User) {
    const createHistory = this.userHistoryRepo.create({
      login_time: userInfo.login_time,
      country: userInfo.country,
      ip_address: userInfo.ip_address,
      browser_name: userInfo.browser_name,
      os_name: userInfo.os_name,
      history: user,
    });
    await this.userHistoryRepo.save(createHistory);
  }

  async signout(token: string) {
    try {
      const refreshToken = token.split(' ')[1];
      const user = await this.userRepo.findOne({
        where: { refreshToken: refreshToken },
      });

      if (!user) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Invalid Refresh Token',
            'Get the correct refresh token and try again',
          ),
        );
      }
      const expiringToken = await this.jwtHelperService.changeJwtExpiry(
        refreshToken,
      );
      await this.userRepo.update(user.id, {
        refreshToken: null || expiringToken,
      });
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
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
        profileId: user.profileID,
        isAdmin: user.isAdmin,
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

  async changepassword(token: string, dto: ChangePasswordDto) {
    const refreshToken = token.split(' ')[1];

    try {
      const { id, password } = await this.userRepo.findOne({
        where: { refreshToken: refreshToken },
      });
      // const user = await this.userRepo.findOne({ where: { refreshToken: refreshToken } });
      const currentPasswordHash = password;

      const oldPasswordHash = await this.jwtHelperService.hashPassword(
        dto.oldPassword,
        password.split(':')[0],
      );

      if (currentPasswordHash !== oldPasswordHash) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            `Access Denied!`,
            `The old password provided is incorrect`,
            `401`,
          ),
        );
      }

      const newPasswordHash = await this.jwtHelperService.hashPassword(
        dto.newPassword,
        password.split(':')[0],
      );
      return await this.userRepo.update(id, { password: newPasswordHash });
    } catch (err) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(err.name, err.message, err.status),
      );
    }
  }

  async forgotPassword(email: string): Promise<string[]> {
    try {
      const user: User = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not found',
            'email does not exist on the server',
            '404',
          ),
        );
      }
      // Sign a token and check if it already exists..
      const existingToken = await this.jwtHelperService.signReset({
        id: user.id,
        userEmail: user.email,
      });

      // if an otp with this signuptoken  exists in the database, delete it
      if (existingToken) {
        await this.otpRepo.delete({ signupToken: existingToken });
      }
      const otp = Math.floor(Math.random() * 899999 + 100000).toString();

      const emailPayload = {
        userId: user.id,
        userEmail: user.email,
        username: user.fullName,
        otp,
      };

      const success = await this.emailVerificationService.sendResetPasswordOtp(
        emailPayload,
      );

      return [user.id, success];
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  async resetPassword(body: PasswordResetDto): Promise<User> {
    try {
      const { otp, password } = body;
      const otpDoc = await this.otpRepo.findOne({ where: { otp: otp } });
      if (!otpDoc) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Not Found Error',
            'Incorrect OTP entered',
            '400',
          ),
        );
      }
      const { signupToken } = otpDoc;
      const { id } = await this.jwtHelperService.verifyReset(signupToken);
      const user: User = await this.userRepo.findOne({ where: { id } });
      if (!user) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found Error',
            'User does not exist on the server',
            '404',
          ),
        );
      }
      var passwordPayload = {
        newPassword: password,
        oldPassword: user.password,
      };
      const hashedPassword = await this.jwtHelperService.newPasswordHash(
        passwordPayload,
      );
      await this.userRepo.update(id, { password: hashedPassword });
      await this.otpRepo.delete({ otp: otp });

      return user;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  }

  deleteUser = async (email: string) => {
    try {
      const user = await this.userRepo.findOne({
        where: { email },
      });

      if (!user) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'User Not found',
            'The Email Does not exists',
            '400',
          ),
        );
      }
      //  send Delete request to the profile service to delete the user profile
      // Axios
      const coreUrl = `${this.configService.get<string>(
        configConstant.baseUrls.coreService,
      )}/profile/${user.profileID}`;

      const profileResponse = await this.httpService.axiosRef({
        method: 'delete',
        url: coreUrl,
      });

      if (profileResponse.data.status !== 200) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Profile Not deleted',
            'Error occured while deleting user Profile',
            '400',
          ),
        );
      }

      return await this.userRepo.delete({ email });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(error.name, error.message, error.status),
      );
    }
  };
}
