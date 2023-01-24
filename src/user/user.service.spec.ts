import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { LoginHistory } from '../entities/loginHistory.entity';
import { User} from '../entities/user.entity'
import {UserDto} from './dto/user.dto'
import {UserInfo} from './dto/userInfo.dto'

describe('UserService', () => {
  let userDto = new UserDto()
  let userInfo = new UserInfo()
  let service: UserService;
  const userService = {
    getLoginHistories: jest.fn().mockImplementation((id) => {
      return [
        {
          ...userInfo,
          userId:id
        },
        {
          ...userInfo,
          userId: id
        }
      ]
    }),

    makeUserAnAdmin: jest.fn().mockImplementation((id) => {
      return {
        id: id,
        user_role: "admin",
        ...userDto
      }
    }),

    getallUsers: jest.fn().mockImplementation(() => {
      return  [
        {
          id: "string-uuid-1",
          isEmailVerified: true,
          user_role: "user"
        },
        {
          id: "string-uuid-2",
          isEmailVerified: true,
          user_role: "user"
        }
      ]
    })
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        User,
        LoginHistory,
        {
          provide: UserService,
          useValue: userService
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

    it('should get login histories of a user', () => {
    expect(service.getLoginHistories("string-uuid")).toEqual(
     [
        {
          ...userInfo,
          userId:"string-uuid"
        },
        {
          ...userInfo,
          userId: "string-uuid"
        }
      ]
    );
  });

  it('should make a User an Admin', () => {
    expect(service.makeUserAnAdmin("string-uuid")).toEqual(
       
        {
         id: "string-uuid",
          user_role: "admin",
        ...userDto
        },
      
    );
  });

  it('should get verified users', () => {
    expect(service.getallUsers("string-date")).toEqual(
      [
        {
          id: "string-uuid-1",
          isEmailVerified: true,
          user_role: "user"
        },
        {
          id: "string-uuid-2",
          isEmailVerified: true,
          user_role: "user"
        }
      ]
    );
  });
});
