import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../store/auth';
import { LoginFormService } from '../forms/login';
import { LanguageService } from '../../../shared/services/language';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { PasswordInputComponent } from '../components/password-input';
import {
  InputComponent,
  ButtonComponent,
  FormComponent,
} from '../../../shared/components';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LanguageToggleComponent,
    PasswordInputComponent,
    InputComponent,
    ButtonComponent,
    FormComponent,
  ],
  template: `
    <main class="mx-auto flex min-h-screen max-w-md items-center p-6">
      <app-form
        class="w-full"
        [formGroup]="loginForm.form"
        (ngSubmit)="auth.login()"
        variant="default"
        [cssClass]="'rounded-2xl bg-white dark:bg-slate-800 p-8 shadow'"
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

        <app-input
          type="email"
          formControlName="email"
          [placeholder]="t('email')"
          [disabled]="auth.isLoading()"
          autocomplete="email"
          variant="default"
          [cssClass]="'mt-6'"
        />

        <app-password-input
          controlName="password"
          [placeholderValue]="t('password')"
          autocompleteValue="current-password"
        />

        <app-button
          variant="primary"
          type="submit"
          [cssClass]="'w-full mt-6'"
          [disabled]="auth.isLoading()"
        >
          {{ auth.isLoading() ? t('signingIn') : t('signIn') }}
        </app-button>

        <p class="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {{ t('dontHaveAccount') }}
          <a
            routerLink="/register"
            class="font-medium text-blue-600 dark:text-blue-400"
            >{{ t('register') }}</a
          >
        </p>
      </app-form>
    </main>
  `,
})
export class LoginComponent {
  readonly auth = inject(AuthStore);
  readonly loginForm = inject(LoginFormService);
  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
