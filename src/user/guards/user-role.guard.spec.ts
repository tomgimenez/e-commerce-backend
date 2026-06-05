import { BadRequestException, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";

import { ValidRoles } from "../enums/valid-roles";
import { UserRoleGuard } from "./user-role.guard";
import { META_ROLES } from "../../auth/decorators/role-protected.decorator";

function buildMockContext(user: object | null): ExecutionContext {
  const mockRequest= { user };

  return {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(mockRequest)
    }),
    getHandler: jest.fn().mockReturnValue(() => {})
  } as unknown as ExecutionContext;
}

function buildReflector(roles: ValidRoles[] | undefined): Reflector {
  return {
    get: jest.fn().mockReturnValue(roles)
  } as unknown as Reflector;
}
 
describe('UserRoleGuard', () => {

  describe('when no roles are required on the route', () => {
    it('should allow access when reflector returns undefined', () => {
      const guard = new UserRoleGuard(buildReflector(undefined));
      const ctx   = buildMockContext(null);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when reflector returns an empty array', () => {
      const guard = new UserRoleGuard(buildReflector([]));
      const ctx   = buildMockContext(null);

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('when roles are required but there is no user in the request', () => {
    it('should throw BadRequestException', () => {
      const guard = new UserRoleGuard(buildReflector([ValidRoles.admin]));
      const ctx   = buildMockContext(null);

      expect(() => guard.canActivate(ctx)).toThrow(BadRequestException);
    });
  });

  describe('when the user does not have any of the required roles', () => {
    it('should throw ForbiddenException', () => {
      const user = { name: 'Jane', lastname: 'Doe', roleNames: [ValidRoles.user] };
      const guard = new UserRoleGuard(buildReflector([ValidRoles.admin]));
      const ctx   = buildMockContext(user);

      expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    });

    it('should include the user name and required roles in the error message', () => {
      const user = { name: 'Jane', lastname: 'Doe', roleNames: [ValidRoles.user] };
      const guard = new UserRoleGuard(buildReflector([ValidRoles.admin]));
      const ctx   = buildMockContext(user);

      expect(() => guard.canActivate(ctx)).toThrow(
        `User Jane Doe need a valid role: [${ValidRoles.admin}]`,
      );
    });
  });

  describe('when the user has at least one of the required roles', () => {
    it('should allow access when user has the exact required role', () => {
      const user  = { name: 'John', lastname: 'Admin', roleNames: [ValidRoles.admin] };
      const guard = new UserRoleGuard(buildReflector([ValidRoles.admin]));
      const ctx   = buildMockContext(user);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when user has multiple roles and one matches', () => {
      const user  = { name: 'John', lastname: 'Admin', roleNames: [ValidRoles.user, ValidRoles.admin] };
      const guard = new UserRoleGuard(buildReflector([ValidRoles.admin]));
      const ctx   = buildMockContext(user);

      expect(guard.canActivate(ctx)).toBe(true);
    });

    it('should allow access when multiple roles are required and user has one of them', () => {
      const user  = { name: 'Super', lastname: 'User', roleNames: [ValidRoles.superUser] };
      const guard = new UserRoleGuard(buildReflector([ValidRoles.admin, ValidRoles.superUser]));
      const ctx   = buildMockContext(user);

      expect(guard.canActivate(ctx)).toBe(true);
    });
  });

  describe('reflector integration', () => {
    it('should call reflector.get with META_ROLES and the route handler', () => {
      const reflector  = buildReflector([ValidRoles.admin]);
      const guard      = new UserRoleGuard(reflector);
      const handler    = () => {};
      const ctx = {
        switchToHttp: jest.fn().mockReturnValue({
          getRequest: jest.fn().mockReturnValue({
            user: { name: 'Admin', lastname: 'User', roleNames: [ValidRoles.admin] },
          }),
        }),
        getHandler: jest.fn().mockReturnValue(handler),
      } as unknown as ExecutionContext;

      guard.canActivate(ctx);

      expect(reflector.get).toHaveBeenCalledWith(META_ROLES, handler);
    });
  });
})