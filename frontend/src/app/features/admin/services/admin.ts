import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api';
import type { UserRole } from '@shared/types/auth';
import type { UserModel } from '../models/admin';

@Injectable({ providedIn: 'root' })
export class AdminService {
  readonly #api = inject(ApiService);

  getUsers() {
    return this.#api.get<UserModel[]>('/admin/users');
  }

  deleteUser(id: number) {
    return this.#api.delete<void>(`/admin/users/${id}`);
  }

  updateUserRole(id: number, role: UserRole) {
    return this.#api.patch<UserModel>(`/admin/users/${id}/role`, { role });
  }

  changeUserPassword(id: number, password: string) {
    return this.#api.post<void>(`/admin/users/${id}/change-password`, {
      password,
    });
  }
}
