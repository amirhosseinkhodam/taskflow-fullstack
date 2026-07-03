import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { UserRole } from '@shared/types/auth.model';

export interface UserModel {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getUsers() {
    return this.#http.get<UserModel[]>(`${this.#apiBaseUrl}/admin/users`);
  }

  deleteUser(id: number) {
    return this.#http.delete<void>(`${this.#apiBaseUrl}/admin/users/${id}`);
  }

  updateUserRole(id: number, role: UserRole) {
    return this.#http.patch<UserModel>(
      `${this.#apiBaseUrl}/admin/users/${id}/role`,
      { role },
    );
  }

  changeUserPassword(id: number, password: string) {
    return this.#http.post<void>(
      `${this.#apiBaseUrl}/admin/users/${id}/change-password`,
      { password },
    );
  }
}
