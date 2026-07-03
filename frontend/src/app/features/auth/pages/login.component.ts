import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../store/auth.store';
import { AuthFormService } from '../services/auth-form.service';
import { LanguageService } from '../../../shared/services/language.service';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle.component';
import { PasswordInputComponent } from '../components/password-input.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LanguageToggleComponent,
    PasswordInputComponent,
  ],
  template: `
    <main class="mx-auto flex min-h-screen max-w-md items-center p-6">
      <form
        [formGroup]="authForm.loginForm"
        (ngSubmit)="auth.login()"
        class="w-full rounded-2xl bg-white dark:bg-slate-800 p-8 shadow"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
              TaskFlow
            </h1>
            <p class="mt-1 text-slate-600 dark:text-slate-400">
              {{ t('signInToAccount') }}
            </p>
          </div>
          <app-language-toggle></app-language-toggle>
        </div>

        @if (auth.error()) {
          <p
            class="mt-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-700 dark:text-red-300"
          >
            {{ auth.error() }}
          </p>
        }

        <input
          class="mt-6 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          type="email"
          formControlName="email"
          [placeholder]="t('email')"
          autocomplete="email"
        />

        <app-password-input
          controlName="password"
          [placeholderValue]="t('password')"
          autocompleteValue="current-password"
        />

        <button
          class="mt-6 w-full rounded-lg bg-slate-900 dark:bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          [disabled]="auth.isLoading()"
        >
          {{ auth.isLoading() ? t('signingIn') : t('signIn') }}
        </button>

        <p class="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {{ t('dontHaveAccount') }}
          <a
            routerLink="/register"
            class="font-medium text-blue-600 dark:text-blue-400"
            >{{ t('register') }}</a
          >
        </p>
      </form>
    </main>
  `,
})
export class LoginComponent {
  readonly auth = inject(AuthStore);
  readonly authForm = inject(AuthFormService);
  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
