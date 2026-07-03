import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { AuthResponse } from '@shared/types/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  login(email: string, password: string) {
    return this.#http.post<AuthResponse>(`${this.#apiBaseUrl}/auth/login`, {
      email,
      password,
    });
  }

  register(email: string, password: string, name: string) {
    return this.#http.post<AuthResponse>(`${this.#apiBaseUrl}/auth/register`, {
      email,
      password,
      name,
    });
  }
}
