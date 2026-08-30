import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api';
import type { AuthResponseModel } from '@shared/types/auth';
import type { AuthPayloadModel } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #api = inject(ApiService);

  login(value: AuthPayloadModel) {
    return this.#api.post<AuthResponseModel>('/auth/login', value);
  }

  register(value: AuthPayloadModel) {
    return this.#api.post<AuthResponseModel>('/auth/register', value);
  }
}
