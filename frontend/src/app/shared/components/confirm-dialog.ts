import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { LanguageService } from '../services/language';
import { ButtonComponent } from './button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, ButtonComponent],
  template: `
    <h2 mat-dialog-title>{{ t(data.title) }}</h2>
    <mat-dialog-content>
      {{ t(data.message) }}
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <app-button variant="primary" (buttonClick)="onCancel()">
        {{ t('cancel') }}
      </app-button>
      <app-button variant="mat-raised" color="warn" (buttonClick)="onConfirm()">
        {{ t('delete') }}
      </app-button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly #dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly #languageService = inject(LanguageService);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) ?? {
    title: 'confirmDeleteTask',
    message: 'confirmDeleteMessage',
  };

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onConfirm(): void {
    this.#dialogRef.close(true);
  }

  onCancel(): void {
    this.#dialogRef.close(false);
  }
}
