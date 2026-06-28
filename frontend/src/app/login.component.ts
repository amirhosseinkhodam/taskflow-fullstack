import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <main class="mx-auto flex min-h-screen max-w-md items-center p-6">
      <form (ngSubmit)="login()" class="w-full rounded-2xl bg-white dark:bg-slate-800 p-8 shadow">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">TaskFlow</h1>
        <p class="mt-1 text-slate-600 dark:text-slate-400">Sign in to your account</p>

        @if (error()) {
          <p class="mt-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-700 dark:text-red-300">
            {{ error() }}
          </p>
        }

        <input
          class="mt-6 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          type="email"
          name="email"
          placeholder="Email"
          [(ngModel)]="email"
          autocomplete="email"
          required
        />
        <div class="relative mt-3">
          <input
            class="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 pr-10 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            [type]="showPassword() ? 'text' : 'password'"
            name="password"
            placeholder="Password"
            [(ngModel)]="password"
            autocomplete="current-password"
            required
          />
          <button
            type="button"
            class="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-slate-500"
            (click)="showPassword.set(!showPassword())"
          >
            @if (showPassword()) {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="size-5"
              >
                <path
                  d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"
                />
                <path
                  d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"
                />
                <line x1="1" y1="1" x2="23" y2="23" />
                <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              </svg>
            } @else {
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="size-5"
              >
                <path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
                />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          </button>
        </div>

        <button
          class="mt-6 w-full rounded-lg bg-slate-900 dark:bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          [disabled]="loading()"
        >
          {{ loading() ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          Don't have an account?
          <a routerLink="/register" class="font-medium text-blue-600 dark:text-blue-400"
            >Register</a
          >
        </p>
      </form>
    </main>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  showPassword = signal(false);
  error = signal('');
  loading = signal(false);

  login(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');

    this.auth.login(this.email, this.password).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.error.set('Invalid email or password');
        this.loading.set(false);
      },
    });
  }
}
