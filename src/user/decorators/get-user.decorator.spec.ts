import { ExecutionContext, InternalServerErrorException } from "@nestjs/common";
import { getUserFactory } from "./get-user.decorator";

describe('GetUser', () => {
  const mockUser = { id: '1', email: 'test@test.com' };

  const mockContext = {
    switchToHttp: () => ({
      getRequest: () => ({ user: mockUser })
    })
  } as ExecutionContext;

  it('should return the full user when no data is specified', () => {
    const result = getUserFactory(undefined, mockContext);
    expect(result).toEqual(mockUser);
  });

  it('should return a specific field when data is provided', () => {
    const result = getUserFactory('email', mockContext);
    expect(result).toBe('test@test.com');
  });

  it('should throw InternalServerErrorException when user is not in request', () => {
    const ctxWithoutUser = {
      switchToHttp: () => ({
        getRequest: () => ({ user: undefined })
      })
    } as unknown as ExecutionContext;

    expect(() => getUserFactory(undefined, ctxWithoutUser)).toThrow(InternalServerErrorException);
  });
});