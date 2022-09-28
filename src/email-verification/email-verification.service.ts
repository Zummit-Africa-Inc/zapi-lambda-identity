import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
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
    @Inject('NOTIFY_SERVICE') private readonly client: ClientProxy,
  ) {}

  /*
   * sendVerificationLink - send verification token to a newly registered user
   * @Params: email - email created by the user
   * return - return a http request to send email notification
   */
  async sendVerificationLink(email: string) {
    try {
      const payload: VerifyToken = { email };

      const signupToken = this.jwtService.sign(payload, {
        secret: this.configService.get(configConstant.jwt.verify_secret),
        expiresIn: this.configService.get(configConstant.jwt.otp_time),
      });
      const otp = (Math.floor(Math.random() * 899999+100000)).toString()

      const otpSetup = await this.otpRepo.create({
        otp: otp,
        signupToken: signupToken
      })
      await this.otpRepo.save(otpSetup)
      const user = await this.usersRepo.findOne({where: {
        email: email
      }})
      const notification_url = `${this.configService.get<string>(
        configConstant.baseUrls.notificationService,
      )}/email/send-mail`

      const emailBody = `Welcome to Zummit. To confirm your mail, please Enter the OTP displayed below:\n\n\n ${otp}`;

      const emailPaybload = {
        email,
        subject: "Confirm Email",
        text: emailBody
      }

      /* Sending a message to the notification service to send an email to the user via rabbitMQ. */
      // this.client.emit('verification', {
      //   email,
      //   subject: 'Confirm Email',
      //   text: emailBody,
      // });

      /* making axios request to the notification service*/
      const call = this.httpService.axiosRef
      const axiosResponse = await call({
        method: 'POST',
        url: notification_url,
        data: emailPaybload
      })

      const {status} = axiosResponse
      if(status >= 400){
        throw new BadRequestException(
        ZaLaResponse.BadRequest(
          'email Sending Error',
          'Unable to send signup otp at this time',
          `${status}`,
        ),
      );
      }
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
      const {signupToken} = await this.otpRepo.findOne({where:{otp:otpDto.otp}})
      const payload = await this.jwtService.verify(signupToken, {
        secret: this.configService.get(configConstant.jwt.verify_secret),
      });
      // Mark User email as verified
      await this.markEmailAsConfirmed(payload.email);
      //delete the otp entity from the table
      await this.otpRepo.delete({otp:otpDto.otp})
      //Create a user profile once email is verified
      const completeUser = await this.createUserProfile(payload.email);
      const user = await this.usersRepo.findOne({
        where: { email: completeUser.email },
        select:['id','email', 'fullName', 'profileID', 'isEmailVerified', 'createdOn', 'updatedOn']
      });
      return user
    } catch (error) {
      if (error?.name === 'TokenExpiredError') 
        /*resend the verification link to the user */
        // this.sendVerificationLink((await this.usersRepo.findOne({where:{id:userId}})).email)
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'Unathorized',
            'signup otp expired',
            '401',
          ),
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
    user.userOTP = null
    return await this.usersRepo.save(user);
  }

  /*
   * createUserProfile - Find a user by email and creates a profile for the
   *                     when called upon at the time of email verification
   * @Params: email - email created by the user
   * return - return a http request to send email notification
   */
  async createUserProfile(email: string) {
    const newUser = await this.usersRepo.findOne({
      where: {
        email,
      },
    });
    if (!newUser) {
      throw new NotFoundException(
        ZaLaResponse.NotFoundRequest(
          "Not Found Error",
          "User with the given email not found",
          "404"
        )
      )
    }
      // TODO: send POST request to the profile service to create the profile
      // Axios
      const new_Profile = await this.httpService.post(
        `${this.configService.get<string>(
          configConstant.baseUrls.coreService,
        )}/profile/create`,
        {
          email: newUser.email,
          userId: newUser.id,
        },
      );

      const newProfile = await lastValueFrom(new_Profile.pipe());
      const profileData = newProfile.data.data;
      newUser.profileID = profileData.id;

      const new_User = await this.usersRepo.save(newUser);
      return new_User;
    
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
      const otpSetup = await this.otpRepo.create({
          otp: otp,
          signupToken: resetToken
      })
      await this.otpRepo.save(otpSetup)

      const firstName = username.split(' ')[1]
      const notification_url = `${this.configService.get<string>(
        configConstant.baseUrls.notificationService,
      )}/email/send-mail`;
      const text = `Hi, ${firstName}, \nEnter the OTP below in  OTP column provided in the reset page : \n\n\n      ${otp}`;
      const mailData = {
        email: userEmail,
        subject: 'OTP For Password Reset',
        text: text,
      };
      // An axios request to the notification service
      const call = this.httpService.axiosRef;
      const axiosResponse = await call({
        method: 'POST',
        url: notification_url,
        data: mailData,
      });

      const { status } = axiosResponse;
      const statusString = status.toString();
      if (status >= 400) {
        throw new BadRequestException(
          ZaLaResponse.BadRequest(
            'failed',
            'unable to send reset link at the moment',
            statusString,
          ),
        );
      }
      return `Reset OTP successfully sent to ${userEmail} resetToken: ${otp}`;
    } catch (error) {
      throw new BadRequestException(
        ZaLaResponse.BadRequest('Internal Server error', error.message, '500'),
      );
    }
  }
}
