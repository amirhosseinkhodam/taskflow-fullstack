import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { AuthStore } from '../../features/auth/store/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  const token = auth.token();
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req).pipe(
    tap({
      error: (err) => {
        if (err.status === 401) {
          auth.logout();
          router.navigate(['/login']);
        }
      },
    }),
  );
};
