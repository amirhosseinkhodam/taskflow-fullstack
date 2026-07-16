import { Request } from 'express';

export type UserRole = 'user' | 'admin' | 'superAdmin';

export interface AuthResponseModel {
  readonly token: string;
  readonly user: {
    readonly id: number;
    readonly email: string;
    readonly name: string;
    readonly role: UserRole;
  };
}

export interface AuthenticatedRequest extends Request {
  readonly user: {
    readonly id: number;
    readonly email: string;
    readonly name: string;
    readonly role: UserRole;
  };
}
