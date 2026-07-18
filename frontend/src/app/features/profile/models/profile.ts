import type { AuthUserModel } from '@shared/types/auth';

export interface UpdateProfileRequestModel {
  readonly email?: string;
  readonly firstName?: string;
  readonly lastName?: string;
  readonly nationalCode?: string;
  readonly phone?: string;
  readonly birthDate?: string;
}

export interface UpdateProfileResponseModel {
  readonly token: string;
  readonly user: AuthUserModel;
}

export interface ChangePasswordRequestModel {
  readonly currentPassword: string;
  readonly newPassword: string;
}
