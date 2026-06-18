import {
  provideHttpClient,
  withInterceptors,
  HttpInterceptorFn,
} from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes, CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AppComponent } from './app/app.component';
import { AuthService } from './app/auth.service';

const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isLoggedIn()) return true;
  return router.parseUrl('/login');
};

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./app/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./app/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./app/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: '/login' },
];

const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }
  return next(req);
};

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
  ],
}).catch((error) => console.error(error));
