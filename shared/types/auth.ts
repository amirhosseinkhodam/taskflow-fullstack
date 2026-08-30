import { Request } from 'express';

export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'superAdmin',
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

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
