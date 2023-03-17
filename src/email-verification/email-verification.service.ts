import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { configConstant } from 'src/common/constants/config.constant';
import { ZaLaResponse } from 'src/common/helpers/response';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { JwtHelperService } from '../auth/jwtHelper.service';
import { VerifyToken } from 'src/common/interfaces/verify.interface';
import { ClientProxy } from '@nestjs/microservices';
import { SignupOTPDto } from './dto/email-token.dto';
import { OneTimePassword } from 'src/entities/otp.entity';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(OneTimePassword)
    private otpRepo: Repository<OneTimePassword>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly jwtHelpers: JwtHelperService,
    @Inject('NOTIFY_SERVICE') private readonly n_client: ClientProxy,
  ) {}

  /*
   * sendVerificationLink - send verification token to a newly registered user
   * @Params: email - email created by the user
   * return - return a http request to send email notification
   */
  async sendVerificationLink(email: string): Promise<void> {
    try {
      const payload: VerifyToken = { email };

      const signupToken = this.jwtService.sign(payload, {
        secret: this.configService.get(configConstant.jwt.verify_secret),
        expiresIn: this.configService.get(configConstant.jwt.otp_time),
      });
      const otp = Math.floor(Math.random() * 899999 + 100000).toString();

      const otpSetup = this.otpRepo.create({
        otp: otp,
        signupToken: signupToken,
      });
      await this.otpRepo.save(otpSetup);
      const emailBody = `Welcome to Zummit. To confirm your mail, please Enter the OTP displayed below:\n\n\n ${otp}`;

      const mailPayload = {
        email,
        subject: 'Confirm Email',
        text: emailBody,
      };

      const notificationUrl = `${this.configService.get<string>(
        configConstant.baseUrls.notificationService,
      )}/email/confirmation`;
      console.log(notificationUrl);
      this.httpService.axiosRef
        .post(notificationUrl, mailPayload)
        .catch((error) => {
          console.log(error.message);
        });

      // this.sendMail('mail', mailPayload);
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message, '500'),
      );
    }
  }

  /*
   * decodeEmailToken - verify if the verification token is authentic and makes
   *                    user email as verified
   * @Params: token - token sent to the user
   * return - return a called function(createUserProfile) to create user profile
   */
  async decodeEmailToken(otpDto: SignupOTPDto) {
    try {
      const otp = await this.otpRepo.findOne({
        where: { otp: otpDto.otp },
      });

      // check and thwor error if the return value is null
      if (!otp) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Invalid Token',
            'Get the correct token and try again',
          ),
        );
      }

      const payload = await this.jwtService.verify(otp.signupToken, {
        secret: this.configService.get(configConstant.jwt.verify_secret),
      });
      // Mark User email as verified
      await this.markEmailAsConfirmed(payload.email);
      //delete the otp entity from the table
      await this.otpRepo.delete(otp.id);
      //Create a user profile once email is verified
      const completeUser = await this.createUserProfile(payload.email);
      const user = await this.usersRepo.findOne({
        where: { email: completeUser.email },
        select: [
          'id',
          'email',
          'fullName',
          'profileID',
          'isEmailVerified',
          'createdOn',
          'updatedOn',
        ],
      });
      return user;
    } catch (error) {
      if (error?.name === 'TokenExpiredError')
        /*resend the verification link to the user */
        // this.sendVerificationLink((await this.usersRepo.findOne({where:{id:userId}})).email)
        throw new BadRequestException(
          ZaLaResponse.BadRequest('Unathorized', 'signup otp expired', '401'),
        );

      // throw error if user profile cant be created
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server Error', error.message),
      );
    }
  }

  /*
   * resendVerificationLink - resend verification if a user email is unverified
   * @Params: email - find user by email property
   */
  async resendVerificationLink(email: string) {
    try {
      const user = await this.usersRepo.findOne({
        where: {
          email,
        },
      });
      if (!user.isEmailVerified) {
        this.sendVerificationLink(email);
      }
    } catch (error) {}
  }

  /*
   * markEmailAsConfirmed - sets a registered user email to be verified
   * @Params: email - find user by email property
   * return - the updated mail status
   */
  async markEmailAsConfirmed(email: string) {
    const user = await this.usersRepo.findOne({
      where: {
        email,
      },
    });
    user.isEmailVerified = true;
    user.userOTP = null;
    return await this.usersRepo.save(user);
  }

  /*
   * createUserProfile - Find a user by email and creates a profile for the
   *                     when called upon at the time of email verification
   * @Params: email - email created by the user
   * return - return a http request to send email notification
   */
  async createUserProfile(email: string) {
    try {
      const newUser = await this.usersRepo.findOne({
        where: {
          email,
        },
      });
      if (!newUser) {
        throw new NotFoundException(
          ZaLaResponse.NotFoundRequest(
            'Not Found Error',
            'User with the given email not found',
            '404',
          ),
        );
      }

      const createProfileToken = this.jwtService.sign(
        { userId: newUser.id },
        {
          secret: this.configService.get(configConstant.jwt.access_secret),
          expiresIn: this.configService.get(configConstant.jwt.otp_time),
        },
      );

      const headers = {
        'Content-Type': 'application/json',
        'x-zapi-auth-token': `Bearer ${createProfileToken}`,
      };

      /* Making a post request to the core service to create a profile for the user. */
      const new_Profile = this.httpService.post(
        `${this.configService.get<string>(
          configConstant.baseUrls.coreService,
        )}/profile/create`,
        {
          email: newUser.email,
          userId: newUser.id,
          fullName: newUser.fullName,
        },
        {
          headers: headers,
        },
      );

      const {
        data: { data },
      } = await lastValueFrom(new_Profile.pipe());
      return await this.usersRepo.save({ ...newUser, profileID: data.id });
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /*
   * createGoogleUserProfile - creates a profile for google user
   *
   * @Params: newUser - new user instance
   * return - return a http response of new user profile from the call to the core service
   */
  async createGoogleUserProfile(newUser) {
    try {
      const createProfileToken = this.jwtService.sign(
        { userId: newUser.id },
        {
          secret: this.configService.get(configConstant.jwt.access_secret),
          expiresIn: this.configService.get(configConstant.jwt.otp_time),
        },
      );

      const headers = {
        'Content-Type': 'application/json',
        'x-zapi-auth-token': `Bearer ${createProfileToken}`,
      };

      /* Making a post request to the core service to create a profile for the user. */
      const new_Profile = this.httpService.post(
        `${this.configService.get<string>(
          configConstant.baseUrls.coreService,
        )}/profile/create`,
        {
          email: newUser.email,
          userId: newUser.id,
          fullName: newUser.fullName,
        },
        {
          headers: headers,
        },
      );

      const { data } = await lastValueFrom(new_Profile.pipe());

      if (data.status != 201)
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Invalid crendential',
            'User profile could not be created',
          ),
        );
      return data;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'Internal Server error',
          error.response.data.message,
          '500',
        ),
      );
    }
  }

  /* Receives a payload that is processed and generates a link sent to the user's email to process his
    or her password reset request
  */
  async sendResetPasswordOtp(emailPayload: any) {
    const { userId, userEmail, username, otp } = emailPayload;
    try {
      const resetToken = await this.jwtHelpers.signReset({
        id: userId,
        userEmail,
      });
      const otpSetup = this.otpRepo.create({
        otp: otp,
        signupToken: resetToken,
      });
      await this.otpRepo.save(otpSetup);

      const firstName = username.split(' ')[1];

      const text = `Hi, ${firstName}, \nEnter the OTP below in  OTP column provided in the reset page : \n\n\n      ${otp}`;
      const mailData = {
        email: userEmail,
        subject: 'OTP For Password Reset',
        text: text,
      };

      // await this.sendMail('mail', mailData);

      const notificationUrl = `${this.configService.get<string>(
        configConstant.baseUrls.notificationService,
      )}/email/confirmation`;
      this.httpService.axiosRef.post(notificationUrl, mailData);
      return `Reset OTP successfully sent to ${userEmail}`;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }

  /**
   * It sends a message to notification service using rabbitMQ client
   * @param {string} pattern - The pattern to send the message to.
   * @param {object} body - body of the message
   */

  // async sendMail(pattern: string, payload: object): Promise<void> {
  //   try {
  //     this.n_client.emit(pattern, payload);
  //   } catch (error) {
  //     throw new BadRequestException(
  //       ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
  //     );
  //   }
  // }
}
