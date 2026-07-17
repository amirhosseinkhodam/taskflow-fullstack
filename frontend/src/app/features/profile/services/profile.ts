import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { UserRole } from '@shared/types/auth';

export interface ProfileModel {
  readonly id: number;
  readonly email: string;
  readonly name: string;
  readonly role: UserRole;
}

export interface UpdateProfileRequestModel {
  readonly email?: string;
  readonly currentPassword: string;
}

export interface UpdateProfileResponseModel {
  readonly token: string;
  readonly user: ProfileModel;
}

export interface ChangePasswordRequestModel {
  readonly currentPassword: string;
  readonly newPassword: string;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getMe() {
    return this.#http.get<ProfileModel>(`${this.#apiBaseUrl}/profile/me`);
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
