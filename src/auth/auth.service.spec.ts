import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, UnauthorizedException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';

import { AuthService } from "./auth.service";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";
import { RabbitmqService } from "../rabbitmq/rabbitmq.service";
import { NotificationsService } from "../notifications/notifications.service";

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockChannel = {
    assertQueue: jest.fn().mockResolvedValue(undefined),
    sendToQueue: jest.fn(),
  };

  const mockRabbitmqService = {
    publish: jest.fn(),
    getChannel: jest.fn().mockReturnValue(mockChannel),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            create: jest.fn()
          }
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn()
          }
        },
        {
          provide: RabbitmqService,
          useValue: mockRabbitmqService,
        },
        {
          provide: NotificationsService,
          useValue: {
            createWelcomeNotification: jest.fn()
          },
        },
      ]
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    userService = module.get(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('login', () => {
    it('should return a token when credentials are valid', async () => {
      
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true as never);
      jwtService.sign.mockReturnValue('jwt-token');
      const user = {id: 1, email: 'test@test.com', password: 'hashed'} as unknown as User;
      userService.findByEmail.mockResolvedValue(user);

      const result = await service.login({ email: 'test@test.com', password: '1234'});

      expect(result).toEqual({ 
        user: {
          id: 1,
          email: 'test@test.com'
        },
        token: 'jwt-token'
      });
    });

    it('should throw UnauthorizedException when credentials are not correct', async () => {
      const user = {id: 1, email: 'test@test.com', password: 'hashed'} as unknown as User;
      userService.findByEmail.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false as never);

      await expect(
        service.login({email: 'test@test.com', password: 'incorrect'})
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {

    it('should create user and return it with access token', async () => {
      const user = {id: 1, email: 'test@test.com', password: 'hashed'} as unknown as User;
      userService.create.mockResolvedValue(user);
      jwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register({email: 'test@test.com', password: '1234', name: 'test name', lastname: 'test lastname'});

      expect(result).toStrictEqual({
        user: {
          id: 1,
          email: 'test@test.com',
          password: 'hashed'
        },
        token: 'jwt-token'
      })
    });

    it('should throw and exception if email already exists', async () => {
      userService.create.mockRejectedValue(new BadRequestException('email already exists'));

      await expect(
        service.register({ email: 'test@test.com', password: '1234', name: 'test name', lastname: 'test lastname' })
      ).rejects.toThrow(BadRequestException);
    })
  });

  describe('check auth status', () => {
    it('should return a new token when user is valid', async () => {
      const user = {id: 1, email: 'test@test.com'} as unknown as User;
      jwtService.sign.mockReturnValue('new-jwt-token');
      
      const result = await service.checkAuthStatus(user);

      expect(result).toStrictEqual({
        user: user,
        token: 'new-jwt-token'
      })
    })
  })
})