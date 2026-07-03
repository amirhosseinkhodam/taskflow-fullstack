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
import { AuthService } from '../services/auth.service';
import { AuthFormService } from '../services/auth-form.service';
import type { AuthResponse, UserRole } from '@shared/types/auth.model';

interface AuthUser {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthStateModel {
  token: string | null;
  user: AuthUser | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: AuthStateModel = {
  token: null,
  user: null,
  error: null,
  isLoading: false,
};

function decodeToken(token: string): AuthUser | null {
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
        store.user()?.role === 'admin' || store.user()?.role === 'superadmin',
    ),
  })),
  withMethods(
    (
      store,
      authService = inject(AuthService),
      router = inject(Router),
      authForm = inject(AuthFormService),
    ) => {
      const login = rxMethod<void>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(() => {
            if (authForm.loginForm.invalid) return [];
            const { email, password } = authForm.loginForm.value;
            return authService.login(email!, password!).pipe(
              tapResponse({
                next: (response: AuthResponse) => {
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
            if (authForm.registerForm.invalid) return [];
            const { name, email, password } = authForm.registerForm.value;
            return authService.register(email!, password!, name!).pipe(
              tapResponse({
                next: (response: AuthResponse) => {
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
