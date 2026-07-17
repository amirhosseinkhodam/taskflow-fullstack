import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { LanguageService } from '../services/language';
import { PasswordFormService } from '../forms/password';
import { ButtonComponent } from './button';
import { InputComponent } from './input';
import { FormComponent } from './form';

interface PasswordDialogData {
  requireCurrentPassword: boolean;
}

@Component({
  selector: 'app-password-bottom-sheet',
  standalone: true,
  imports: [
    MatBottomSheetModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    FormComponent,
  ],
  template: `
    <h3 class="mat-body-large mb-4 font-bold">
      {{ t('changePassword') }}
    </h3>
    <app-form [formGroup]="passwordForm.form" variant="vertical">
      @if (requireCurrentPassword) {
        <app-input
          type="password"
          formControlName="currentPassword"
          [placeholder]="t('currentPassword')"
          variant="default"
          [cssClass]="'mb-3'"
        />
      }
      <app-input
        type="password"
        formControlName="newPassword"
        [placeholder]="t('newPassword')"
        variant="default"
        [cssClass]="'mb-3'"
      />
      <app-input
        type="password"
        formControlName="confirmPassword"
        [placeholder]="t('confirmPassword')"
        variant="default"
        [cssClass]="'mb-3'"
      />
      @if (
        passwordForm.form.hasError('passwordsMismatch') &&
        passwordForm.form.touched
      ) {
        <p class="mb-3 text-xs text-red-600 dark:text-red-400">
          {{ t('passwordsDoNotMatch') }}
        </p>
      }
      @if (
        passwordForm.form.get('newPassword')?.hasError('minLength') &&
        passwordForm.form.get('newPassword')?.touched
      ) {
        <p class="mb-3 text-xs text-red-600 dark:text-red-400">
          {{ t('passwordTooShort') }}
        </p>
      }
      <div class="flex gap-2 justify-end pt-2">
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
      </div>
    </app-form>
  `,
})
export class PasswordBottomSheetComponent {
  readonly passwordForm = inject(PasswordFormService);
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<PasswordBottomSheetComponent>,
  );
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
    this.#bottomSheetRef.dismiss({
      currentPassword: value.currentPassword ?? null,
      newPassword: value.newPassword,
    });
  }

  onCancel(): void {
    this.passwordForm.resetForm();
    this.#bottomSheetRef.dismiss(null);
  }
}
