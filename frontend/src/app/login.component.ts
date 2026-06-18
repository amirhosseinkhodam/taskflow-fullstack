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
      <form (ngSubmit)="login()" class="w-full rounded-2xl bg-white p-8 shadow">
        <h1 class="text-3xl font-bold text-slate-900">TaskFlow</h1>
        <p class="mt-1 text-slate-600">Sign in to your account</p>

        @if (error()) {
          <p class="mt-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {{ error() }}
          </p>
        }

        <input
          class="mt-6 w-full rounded-lg border border-slate-300 px-3 py-2"
          type="email"
          name="email"
          placeholder="Email"
          [(ngModel)]="email"
          autocomplete="email"
          required
        />
        <input
          class="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2"
          type="password"
          name="password"
          placeholder="Password"
          [(ngModel)]="password"
          autocomplete="current-password"
          required
        />

        <button
          class="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          [disabled]="loading()"
        >
          {{ loading() ? 'Signing in...' : 'Sign in' }}
        </button>

        <p class="mt-4 text-center text-sm text-slate-600">
          Don't have an account?
          <a routerLink="/register" class="font-medium text-blue-600"
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
