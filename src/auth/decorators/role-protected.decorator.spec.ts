import { Reflector } from "@nestjs/core";
import { ValidRoles } from "../../user/enums/valid-roles"
import { META_ROLES, RoleProtected } from "./role-protected.decorator"

describe('RoleProtected Decorator', () => {
  it('should set metadata with the provided roles', () => {
    class TestClass {};
    const decorator = RoleProtected(ValidRoles.admin, ValidRoles.user);
    decorator(TestClass);

    const roles = Reflector.createDecorator<ValidRoles[]>();
    const metadata = Reflect.getMetadata(META_ROLES, TestClass);

    expect(metadata).toStrictEqual([ValidRoles.admin, ValidRoles.user]);
  })
})