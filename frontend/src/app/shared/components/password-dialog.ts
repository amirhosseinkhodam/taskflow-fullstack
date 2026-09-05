import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { PasswordFormService } from '../forms/password';
import { TranslatePipe } from '../pipes/translate';
import { ButtonComponent } from './button';
import { InputComponent } from './input';
import { FormComponent } from './form';
import type { PasswordDialogData } from '../models/password';

@Component({
  selector: 'app-password-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    FormComponent,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'changePassword' | translate }}</h2>
    <mat-dialog-content>
      <app-form [formGroup]="passwordForm.form" variant="vertical">
        @if (requireCurrentPassword) {
          <app-input
            type="password"
            formControlName="currentPassword"
            [placeholder]="'currentPassword' | translate"
            variant="default"
            [cssClass]="'mb-4'"
          />
        }
        <app-input
          type="password"
          formControlName="newPassword"
          [placeholder]="'newPassword' | translate"
          variant="default"
          [cssClass]="requireCurrentPassword ? 'mb-4' : 'mb-4'"
        />
        <app-input
          type="password"
          formControlName="confirmPassword"
          [placeholder]="'confirmPassword' | translate"
          variant="default"
          [cssClass]="'mb-4'"
        />
        @if (
          passwordForm.form.hasError('passwordsMismatch') &&
          passwordForm.form.touched
        ) {
          <p class="mb-4 text-xs text-red-600 dark:text-red-400">
            {{ 'passwordsDoNotMatch' | translate }}
          </p>
        }
        @if (
          passwordForm.form.get('newPassword')?.hasError('minLength') &&
          passwordForm.form.get('newPassword')?.touched
        ) {
          <p class="mb-4 text-xs text-red-600 dark:text-red-400">
            {{ 'passwordTooShort' | translate }}
          </p>
        }
      </app-form>
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <app-button variant="primary" (buttonClick)="onCancel()">
        {{ 'cancel' | translate }}
      </app-button>
      <app-button
        variant="mat-raised"
        color="primary"
        [disabled]="passwordForm.form.invalid"
        (buttonClick)="onSave()"
      >
        {{ 'save' | translate }}
      </app-button>
    </mat-dialog-actions>
  `,
})
export class PasswordDialogComponent {
  readonly passwordForm = inject(PasswordFormService);
  readonly #dialogRef = inject(MatDialogRef<PasswordDialogComponent>);
  readonly requireCurrentPassword =
    inject<PasswordDialogData>(MAT_DIALOG_DATA).requireCurrentPassword;

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
