import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthUserModel } from '@shared/types/auth';
import type {
  ChangePasswordRequestModel,
  UpdateProfileRequestModel,
  UpdateProfileResponseModel,
} from '../models/profile';

export type { AuthUserModel as ProfileModel };

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getMe() {
    return this.#http.get<AuthUserModel>(`${this.#apiBaseUrl}/profile/me`);
  }

  updateProfile(dto: UpdateProfileRequestModel) {
    return this.#http.patch<UpdateProfileResponseModel>(
      `${this.#apiBaseUrl}/profile/me`,
      dto,
    );
  }

  changePassword(dto: ChangePasswordRequestModel) {
    return this.#http.patch<{ success: boolean }>(
      `${this.#apiBaseUrl}/profile/me/password`,
      dto,
    );
  }
}
