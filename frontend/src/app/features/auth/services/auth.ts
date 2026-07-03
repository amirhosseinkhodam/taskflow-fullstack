import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthResponseModel } from '@shared/types/auth';
import type { AuthPayloadModel } from '../models/auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  login(value: AuthPayloadModel) {
    return this.#http.post<AuthResponseModel>(
      `${this.#apiBaseUrl}/auth/login`,
      value,
    );
  }

  register(value: AuthPayloadModel) {
    return this.#http.post<AuthResponseModel>(
      `${this.#apiBaseUrl}/auth/register`,
      value,
    );
  }
}
