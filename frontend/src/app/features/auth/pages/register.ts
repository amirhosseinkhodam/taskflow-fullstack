import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../store/auth';
import { RegisterFormService } from '../forms/register';
import { LanguageService } from '../../../shared/services/language';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { PasswordInputComponent } from '../components/password-input';

@Component({
  selector: 'app-register',
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
        [formGroup]="registerForm.form"
        (ngSubmit)="auth.register()"
        class="w-full rounded-2xl bg-white dark:bg-slate-800 p-8 shadow"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
              TaskFlow
            </h1>
            <p class="mt-1 text-slate-600 dark:text-slate-400">
              {{ t('createAccount') }}
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
          type="text"
          formControlName="name"
          [placeholder]="t('name')"
          autocomplete="name"
        />
        <input
          class="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          type="email"
          formControlName="email"
          [placeholder]="t('email')"
          autocomplete="email"
        />

        <app-password-input
          controlName="password"
          [placeholderValue]="t('password')"
          autocompleteValue="new-password"
        />

        <button
          class="mt-6 w-full rounded-lg bg-slate-900 dark:bg-slate-600 px-4 py-2 text-white disabled:opacity-50"
          type="submit"
          [disabled]="auth.isLoading()"
        >
          {{ auth.isLoading() ? t('creatingAccount') : t('registerButton') }}
        </button>

        <p class="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {{ t('alreadyHaveAccount') }}
          <a
            routerLink="/login"
            class="font-medium text-blue-600 dark:text-blue-400"
            >{{ t('signIn') }}</a
          >
        </p>
      </form>
    </main>
  `,
})
export class RegisterComponent {
  readonly auth = inject(AuthStore);
  readonly registerForm = inject(RegisterFormService);
  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
