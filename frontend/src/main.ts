import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, Routes } from '@angular/router';
import { AppComponent } from './app/app.component';
import { authGuard, adminGuard } from './app/core/guards/auth.guard';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';
import { ThemeService } from './app/shared/services/theme.service';

const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./app/features/auth/pages/login.component').then(
        (m) => m.LoginComponent,
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./app/features/auth/pages/register.component').then(
        (m) => m.RegisterComponent,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./app/features/dashboard/pages/dashboard.component').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./app/features/admin/pages/admin-panel.component').then(
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
