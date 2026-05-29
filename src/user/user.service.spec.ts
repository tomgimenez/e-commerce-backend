import { BadRequestException, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

// ─── Mocks ──────────────────────────────────────────────────────────────────

jest.mock('bcrypt', () => ({
  hashSync: jest.fn().mockReturnValue('hashed-password'),
}));

const mockUserRepository = {
  create: jest.fn(),
  save:   jest.fn(),
  findOne: jest.fn(),
};

const createUserDto: CreateUserDto = {
  email:    'john@example.com',
  password: 'plain-password',
  fullName: 'John Doe',
};

const savedUser: User = {
  id:       'uuid-123',
  email:    'john@example.com',
  password: 'hashed-password',
  fullName: 'John Doe',
  isActive: true,
  roles:    [],
} as User;

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    beforeEach(() => {
      mockUserRepository.create.mockReturnValue({ ...savedUser });
      mockUserRepository.save.mockResolvedValue(undefined);
    });

    it('should hash the password before persisting', async () => {
      await service.create(createUserDto);

      expect(bcrypt.hashSync).toHaveBeenCalledWith('plain-password', 10);
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        email:    createUserDto.email,
        fullName: createUserDto.fullName,
        password: 'hashed-password',
      });
    });

    it('should save the user to the repository', async () => {
      await service.create(createUserDto);

      expect(mockUserRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should return the user without the password field', async () => {
      const result = await service.create(createUserDto);

      expect(result.password).toBeUndefined();
    });

    it('should return the rest of the user data intact', async () => {
      const result = await service.create(createUserDto);

      expect(result.email).toBe(savedUser.email);
      expect(result.fullName).toBe(savedUser.fullName);
      expect(result.id).toBe(savedUser.id);
    });

    it('should throw BadRequestException on duplicate email (code 23505)', async () => {
      mockUserRepository.save.mockRejectedValue({
        code:   '23505',
        detail: 'Key (email)=(john@example.com) already exists.',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(BadRequestException);
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Key (email)=(john@example.com) already exists.',
      );
    });

    it('should throw InternalServerErrorException on unexpected DB errors', async () => {
      mockUserRepository.save.mockRejectedValue({ code: '99999' });

      await expect(service.create(createUserDto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findByEmail', () => {
    it('should return the user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(savedUser);

      const result = await service.findByEmail('john@example.com');

      expect(result).toEqual(savedUser);
    });

    it('should query with the correct email and field selection', async () => {
      mockUserRepository.findOne.mockResolvedValue(savedUser);

      await service.findByEmail('john@example.com');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where:  { email: 'john@example.com' },
        select: { email: true, password: true, id: true, fullName: true, isActive: true, roles: true },
      });
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findByEmail('ghost@example.com')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('findById', () => {
    it('should return the user when found', async () => {
      mockUserRepository.findOne.mockResolvedValue(savedUser);

      const result = await service.findById('uuid-123');

      expect(result).toEqual(savedUser);
    });

    it('should query with the correct id and field selection', async () => {
      mockUserRepository.findOne.mockResolvedValue(savedUser);

      await service.findById('uuid-123');

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where:  { id: 'uuid-123' },
        select: { email: true, password: true, id: true, fullName: true, isActive: true, roles: true },
      });
    });

    it('should throw NotFoundException when user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(service.findById('nonexistent-id')).rejects.toThrow(NotFoundException);
      await expect(service.findById('nonexistent-id')).rejects.toThrow('User with id: nonexistent-id not found');
    });
  });
});