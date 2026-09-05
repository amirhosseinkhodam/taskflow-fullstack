import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { USER_ROLES } from '@shared/const/user-roles';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  readonly #reflector: Reflector;
  constructor(reflector: Reflector) {
    this.#reflector = reflector;
  }

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles: string[] | undefined =
      this.#reflector.getAllAndOverride<string[] | undefined>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
    if (!requiredRoles) return false;

    const { user } = context
      .switchToHttp()
      .getRequest<{ user: { role: string } | undefined }>();

    if (!user?.role) return false;

    if (user.role === USER_ROLES.SUPER_ADMIN) return true;

    return requiredRoles.includes(user.role);
  }
}
