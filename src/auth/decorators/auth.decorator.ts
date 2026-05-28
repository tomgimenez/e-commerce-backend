import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { UserRoleGuard } from '../../user/guards/user-role.guard';
import { RoleProtected } from './role-protected.decorator';
import { ValidRoles } from '../../user/enums/valid-roles';


export function Auth(...roles: ValidRoles[]) {

  return applyDecorators(
    RoleProtected(...roles),
    UseGuards( AuthGuard('jwt'), UserRoleGuard ),
  );

}