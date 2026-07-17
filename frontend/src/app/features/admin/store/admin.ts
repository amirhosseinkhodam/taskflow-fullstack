import { computed, inject } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { pipe, switchMap, tap } from 'rxjs';
import { tapResponse } from '@ngrx/operators';
import { AdminService } from '../services/admin';
import type { UserModel } from '../models/admin';

interface AdminStateModel {
  users: UserModel[];
  message: string;
  isLoading: boolean;
}

const initialState: AdminStateModel = {
  users: [],
  message: '',
  isLoading: false,
};

export const AdminStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    userCount: computed(() => store.users().length),
  })),
  withMethods((store, adminService = inject(AdminService)) => {
    const loadUsers = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          adminService.getUsers().pipe(
            tapResponse({
              next: (users) => patchState(store, { users, isLoading: false }),
              error: () =>
                patchState(store, {
                  isLoading: false,
                  message: 'couldNotLoadUsers',
                }),
            }),
          ),
        ),
      ),
    );

    const deleteUser = rxMethod<number>(
      pipe(
        switchMap((id) =>
          adminService.deleteUser(id).pipe(
            tapResponse({
              next: () => {
                patchState(store, {
                  users: store.users().filter((u) => u.id !== id),
                  message: 'userDeleted',
                });
              },
              error: () => patchState(store, { message: 'couldNotDeleteUser' }),
            }),
          ),
        ),
      ),
    );

    const updateUserRole = rxMethod<{ id: number; role: 'user' | 'admin' }>(
      pipe(
        switchMap(({ id, role }) =>
          adminService.updateUserRole(id, role).pipe(
            tapResponse({
              next: (updatedUser) => {
                patchState(store, {
                  users: store
                    .users()
                    .map((u) => (u.id === updatedUser.id ? updatedUser : u)),
                  message: 'roleUpdated',
                });
              },
              error: () => patchState(store, { message: 'couldNotUpdateRole' }),
            }),
          ),
        ),
      ),
    );

    const changePassword = rxMethod<{ userId: number; newPassword: string }>(
      pipe(
        switchMap(({ userId, newPassword }) =>
          adminService.changeUserPassword(userId, newPassword).pipe(
            tapResponse({
              next: () => {
                patchState(store, { message: 'passwordChanged' });
              },
              error: () =>
                patchState(store, { message: 'couldNotChangePassword' }),
            }),
          ),
        ),
      ),
    );

    return { loadUsers, deleteUser, updateUserRole, changePassword };
  }),
  withHooks({
    onInit(store) {
      store.loadUsers();
    },
  }),
);
