import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/pages/register').then((m) => m.RegisterComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/pages/dashboard').then(
        (m) => m.DashboardComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'task-details/:id',
    loadComponent: () =>
      import('./features/task-details/pages/task-details').then(
        (m) => m.TaskDetailsPageComponent,
      ),
    canActivate: [authGuard],
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./features/admin/pages/admin-panel').then(
        (m) => m.AdminPanelComponent,
      ),
    canActivate: [authGuard, adminGuard],
  },
  { path: '**', redirectTo: '/login' },
];
