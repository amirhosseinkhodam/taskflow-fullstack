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
import { ApiService, type UserModel } from '../../../core/services/api.service';

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
  withMethods((store, apiService = inject(ApiService)) => {
    const loadUsers = rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          apiService.getUsers().pipe(
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
          apiService.deleteUser(id).pipe(
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
          apiService.updateUserRole(id, role).pipe(
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

    const changeUserPassword = rxMethod<{ id: number; password: string }>(
      pipe(
        switchMap(({ id, password }) =>
          apiService.changeUserPassword(id, password).pipe(
            tapResponse({
              next: () => patchState(store, { message: 'passwordChanged' }),
              error: () =>
                patchState(store, { message: 'couldNotChangePassword' }),
            }),
          ),
        ),
      ),
    );

    return { loadUsers, deleteUser, updateUserRole, changeUserPassword };
  }),
  withHooks({
    onInit(store) {
      store.loadUsers();
    },
  }),
);
