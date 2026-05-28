import { User } from "src/user/entities/user.entity";
import { UserService } from "src/user/user.service"
import { JwtStrategy } from "./jwt.strategy";
import { UnauthorizedException } from "@nestjs/common";

describe('JwtStrategy', () => {

  let strategy: JwtStrategy;

  let userService: jest.Mocked<UserService> = {
    findById: jest.fn()
  } as any;

  const mockedUser = {
    id: '1',
    email: 'test@test.com'
  }

  const mockedConfig = {
    get: jest.fn().mockReturnValue('test-secret')
  } as any;

  beforeEach(() => {
    strategy = new JwtStrategy(userService, mockedConfig);
  });

  it('should return user when token is valid', async () => {
    userService.findById.mockResolvedValue({ ...mockedUser, isActive: true } as unknown as User);

    const result = await strategy.validate({ id: '1' });
    
    expect(result).toEqual({...mockedUser, isActive: true});
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userService.findById.mockResolvedValue(null);

    await expect(
      strategy.validate({id: '2'})
    ).rejects.toThrow(UnauthorizedException);
  });

  it ('should throw UnauthorizedException when user is not active', async () => {
    userService.findById.mockResolvedValue({ ...mockedUser, isActive: false } as unknown as User);

    await expect(
      strategy.validate({ id: '1' })
    ).rejects.toThrow(UnauthorizedException);
  });
})