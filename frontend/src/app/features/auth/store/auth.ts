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
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth';
import { LoginFormService } from '../forms/login';
import { RegisterFormService } from '../forms/register';
import type { AuthResponseModel, UserRole } from '@shared/types/auth';

interface AuthUserModel {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthStateModel {
  token: string | null;
  user: AuthUserModel | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: AuthStateModel = {
  token: null,
  user: null,
  error: null,
  isLoading: false,
};

function decodeToken(token: string): AuthUserModel | null {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub ?? 0,
      email: payload.email ?? '',
      name: payload.name ?? '',
      role: payload.role ?? 'user',
    };
  } catch {
    return null;
  }
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isLoggedIn: computed(() => store.token() !== null),
    isAdmin: computed(
      () =>
        store.user()?.role === 'admin' || store.user()?.role === 'superAdmin',
    ),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      router = inject(Router),
      loginForm = inject(LoginFormService),
      registerForm = inject(RegisterFormService),
    ) => {
      const login = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            if (loginForm.form.invalid) return [];
            return authService.login(loginForm.form.getRawValue()).pipe(
              tapResponse({
                next: (response: AuthResponseModel) => {
                  localStorage.setItem('token', response.token);
                  patchState(store, {
                    token: response.token,
                    user: response.user,
                    isLoading: false,
                    error: null,
                  });
                  router.navigate(['/']);
                },
                error: (err: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error:
                      err.status === 401
                        ? 'Invalid credentials'
                        : 'Login failed',
                  });
                },
              }),
            );
          }),
        ),
      );

      const register = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            if (registerForm.form.invalid) return [];
            return authService.register(registerForm.form.getRawValue()).pipe(
              tapResponse({
                next: (response: AuthResponseModel) => {
                  localStorage.setItem('token', response.token);
                  patchState(store, {
                    token: response.token,
                    user: response.user,
                    isLoading: false,
                    error: null,
                  });
                  router.navigate(['/']);
                },
                error: (err: HttpErrorResponse) => {
                  patchState(store, {
                    isLoading: false,
                    error:
                      err.status === 409
                        ? 'Email already registered'
                        : 'Registration failed',
                  });
                },
              }),
            );
          }),
        ),
      );

      const logout = () => {
        localStorage.removeItem('token');
        patchState(store, {
          token: null,
          user: null,
          error: null,
          isLoading: false,
        });
        router.navigate(['/login']);
      };

      const restoreSession = () => {
        const token = localStorage.getItem('token');
        if (token) {
          const user = decodeToken(token);
          patchState(store, {
            token,
            user,
            isLoading: false,
          });
        }
      };

      return { login, register, logout, restoreSession };
    },
  ),
  withHooks({
    onInit(store) {
      store.restoreSession();
    },
  }),
);
