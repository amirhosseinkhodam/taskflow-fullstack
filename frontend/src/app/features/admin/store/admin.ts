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
import { NotificationService } from '../../../shared/services/notification';
import type { UserModel } from '../models/admin';
import { mapPasswordError } from '../../../shared/utils/password-error';
import type { UserRole } from '@shared/const/user-roles';

interface AdminStateModel {
  users: UserModel[];
  isLoading: boolean;
}

const initialState: AdminStateModel = {
  users: [],
  isLoading: false,
};

export const AdminStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    userCount: computed(() => store.users().length),
  })),
  withMethods(
    (
      store,
      adminService = inject(AdminService),
      notification = inject(NotificationService),
    ) => {
      const loadUsers = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true })),
          switchMap(() =>
            adminService.getUsers().pipe(
              tapResponse({
                next: (users) => patchState(store, { users, isLoading: false }),
                error: () => {
                  patchState(store, { isLoading: false });
                  notification.show('error', 'couldNotLoadUsers');
                },
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
                  });
                  notification.show('success', 'userDeleted');
                },
                error: () => {
                  notification.show('error', 'couldNotDeleteUser');
                },
              }),
            ),
          ),
        ),
      );

      const updateUserRole = rxMethod<{ id: number; role: UserRole }>(
        pipe(
          switchMap(({ id, role }) =>
            adminService.updateUserRole(id, role).pipe(
              tapResponse({
                next: (updatedUser) => {
                  patchState(store, {
                    users: store
                      .users()
                      .map((u) => (u.id === updatedUser.id ? updatedUser : u)),
                  });
                  notification.show('success', 'roleUpdated');
                },
                error: () => {
                  notification.show('error', 'couldNotUpdateRole');
                },
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
                  notification.show('success', 'passwordChanged');
                },
                error: (err: { error?: { message?: string } }) => {
                  notification.show(
                    'error',
                    mapPasswordError(err.error?.message ?? ''),
                  );
                },
              }),
            ),
          ),
        ),
      );

      return { loadUsers, deleteUser, updateUserRole, changePassword };
    },
  ),
  withHooks({
    onInit(store) {
      store.loadUsers();
    },
  }),
);
