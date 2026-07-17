import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { LanguageService } from '../services/language';
import { PasswordFormService } from '../forms/password';
import { ButtonComponent } from './button';
import { InputComponent } from './input';
import { FormComponent } from './form';

interface PasswordDialogData {
  requireCurrentPassword: boolean;
}

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    FormComponent,
  ],
  template: `
    <h2 mat-dialog-title>{{ t('changePassword') }}</h2>
    <mat-dialog-content>
      <app-form [formGroup]="passwordForm.form" variant="vertical">
        @if (requireCurrentPassword) {
          <app-input
            type="password"
            formControlName="currentPassword"
            [placeholder]="t('currentPassword')"
            variant="default"
            [cssClass]="'mb-4'"
          />
        }
        <app-input
          type="password"
          formControlName="newPassword"
          [placeholder]="t('newPassword')"
          variant="default"
          [cssClass]="requireCurrentPassword ? 'mb-4' : 'mb-4'"
        />
        <app-input
          type="password"
          formControlName="confirmPassword"
          [placeholder]="t('confirmPassword')"
          variant="default"
          [cssClass]="'mb-4'"
        />
        @if (
          passwordForm.form.hasError('passwordsMismatch') &&
          passwordForm.form.touched
        ) {
          <p class="mb-4 text-xs text-red-600 dark:text-red-400">
            {{ t('passwordsDoNotMatch') }}
          </p>
        }
        @if (
          passwordForm.form.get('newPassword')?.hasError('minLength') &&
          passwordForm.form.get('newPassword')?.touched
        ) {
          <p class="mb-4 text-xs text-red-600 dark:text-red-400">
            {{ t('passwordTooShort') }}
          </p>
        }
      </app-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <app-button variant="primary" (buttonClick)="onCancel()">
        {{ t('cancel') }}
      </app-button>
      <app-button
        variant="mat-raised"
        color="primary"
        [disabled]="passwordForm.form.invalid"
        (buttonClick)="onSave()"
      >
        {{ t('save') }}
      </app-button>
    </mat-dialog-actions>
  `,
})
export class PasswordDialogComponent {
  readonly passwordForm = inject(PasswordFormService);
  readonly #dialogRef = inject(MatDialogRef<PasswordDialogComponent>);
  readonly #languageService = inject(LanguageService);
  readonly requireCurrentPassword =
    inject<PasswordDialogData>(MAT_DIALOG_DATA).requireCurrentPassword;

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onSave(): void {
    if (this.passwordForm.form.invalid) return;
    const value = this.passwordForm.form.getRawValue();
    this.passwordForm.resetForm();
    this.#dialogRef.close({
      currentPassword: value.currentPassword ?? null,
      newPassword: value.newPassword,
    });
  }

  onCancel(): void {
    this.passwordForm.resetForm();
    this.#dialogRef.close(null);
  }
}
