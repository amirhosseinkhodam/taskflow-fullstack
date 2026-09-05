import { Request } from 'express';
import { USER_ROLES, type UserRole } from '@shared/const/user-roles';

export { USER_ROLES, type UserRole };

export interface AuthUserModel {
  readonly id: number;
  readonly email: string;
  // readonly name: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly nationalCode: string;
  readonly phone: string;
  readonly birthDate: string;
  readonly role: UserRole;
}

export interface AuthResponseModel {
  readonly token: string;
  readonly user: AuthUserModel;
}

export interface AuthenticatedRequest extends Request {
  readonly user: AuthUserModel;
}
