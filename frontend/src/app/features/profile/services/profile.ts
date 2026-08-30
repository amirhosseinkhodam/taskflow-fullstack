import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api';
import type { AuthUserModel } from '@shared/types/auth';
import type {
  ChangePasswordRequestModel,
  UpdateProfileRequestModel,
  UpdateProfileResponseModel,
} from '../models/profile';

export type { AuthUserModel as ProfileModel };

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly #api = inject(ApiService);

  getMe() {
    return this.#api.get<AuthUserModel>('/profile/me');
  }

  updateProfile(dto: UpdateProfileRequestModel) {
    return this.#api.patch<UpdateProfileResponseModel>('/profile/me', dto);
  }

  changePassword(dto: ChangePasswordRequestModel) {
    return this.#api.patch<{ success: boolean }>('/profile/me/password', dto);
  }
}
