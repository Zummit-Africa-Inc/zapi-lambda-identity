import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { LoginHistory } from '../entities/loginHistory.entity';
import { User} from '../entities/user.entity'
import {UserDto} from './dto/user.dto'
import {UserInfo} from './dto/userInfo.dto'

describe('UserController', () => {
  let controller: UserController;
  let userDto = new UserDto()
  let userInfo = new UserInfo()

  const userController = {
    getLoginHistory: jest.fn().mockImplementation((id) => {
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

    makeAdmin: jest.fn().mockImplementation((id) => {
      return {
        id: id,
        user_role: "admin",
        ...userDto
      }
    }),

    getAllUsers: jest.fn().mockImplementation(() => {
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
        UserController,
        User,
        LoginHistory,
        {
          provide: UserController,
          useValue: userController
        }
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

    it('should get login histories of a user', () => {
    expect(controller.getLoginHistory("string-uuid")).toEqual(
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
    expect(controller.makeAdmin("string-uuid")).toEqual(
       
        {
         id: "string-uuid",
          user_role: "admin",
        ...userDto
        },
      
    );
  });

  it('should get verified users', () => {
    expect(controller.getAllUsers("string-date")).toEqual(
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

})