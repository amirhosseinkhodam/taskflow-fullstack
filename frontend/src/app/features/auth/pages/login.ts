import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../store/auth';
import { LoginFormService } from '../forms/login';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { PasswordInputComponent } from '../components/password-input';
import { InputComponent } from '../../../shared/components/input';
import { ButtonComponent } from '../../../shared/components/button';
import { FormComponent } from '../../../shared/components/form';

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
    TranslatePipe,
  ],
  template: `
    <main class="mx-auto flex min-h-screen max-w-md items-center p-6">
      <app-form
        class="w-full"
        [formGroup]="loginForm.form"
        (formSubmit)="auth.login()"
        variant="default"
        [cssClass]="'rounded-2xl bg-white dark:bg-slate-800 p-8 shadow'"
      >
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
              TaskFlow
            </h1>
            <p class="mt-1 text-slate-600 dark:text-slate-400">
              {{ 'signInToAccount' | translate }}
            </p>
          </div>
          <app-language-toggle></app-language-toggle>
        </div>

        @if (auth.error()) {
          <p
            class="mt-4 rounded-lg bg-red-50 dark:bg-red-900/30 px-4 py-2 text-sm text-red-700 dark:text-red-300"
          >
            {{ auth.error()! | translate }}
          </p>
        }

        <app-input
          type="email"
          formControlName="email"
          [placeholder]="'email' | translate"
          [disabled]="auth.isLoading()"
          autocomplete="email"
          variant="default"
          [cssClass]="'mt-6'"
        />

        <app-password-input
          controlName="password"
          [placeholderValue]="'password' | translate"
          autocompleteValue="current-password"
        />

        <app-button
          variant="primary"
          type="submit"
          [cssClass]="'w-full mt-6'"
          [disabled]="auth.isLoading()"
        >
          {{
            auth.isLoading()
              ? ('signingIn' | translate)
              : ('signIn' | translate)
          }}
        </app-button>

        <p class="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          {{ 'dontHaveAccount' | translate }}
          <a
            routerLink="/register"
            class="font-medium text-blue-600 dark:text-blue-400"
            >{{ 'register' | translate }}</a
          >
        </p>
      </app-form>
    </main>
  `,
})
export class LoginComponent {
  readonly auth = inject(AuthStore);
  readonly loginForm = inject(LoginFormService);
}
