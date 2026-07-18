import { Request } from 'express';

export type UserRole = 'user' | 'admin' | 'superAdmin';

export interface AuthUserModel {
  readonly id: number;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly nationalCode: string | null;
  readonly phone: string | null;
  readonly birthDate: string | null;
  readonly role: UserRole;
}

export interface AuthResponseModel {
  readonly token: string;
  readonly user: AuthUserModel;
}

export interface AuthenticatedRequest extends Request {
  readonly user: AuthUserModel;
}
