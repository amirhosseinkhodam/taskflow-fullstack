import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app';
import { authGuard, adminGuard } from './app/core/guards/auth.guard';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { ThemeService } from './app/shared/services/theme';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./app/features/auth/pages/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./app/features/auth/pages/register').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./app/features/dashboard/pages/dashboard').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./app/features/admin/pages/admin-panel').then(
        (m) => m.AdminPanelComponent,
      ),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '/login' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideRouter(routes),
    ThemeService,
  ],
}).catch((error) => console.error(error));
