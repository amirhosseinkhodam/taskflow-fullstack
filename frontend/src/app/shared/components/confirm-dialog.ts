import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef,
} from '@angular/material/dialog';
import { TranslatePipe } from '../pipes/translate';
import { ButtonComponent } from './button';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, ButtonComponent, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <mat-dialog-content>
      {{ data.message | translate }}
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <app-button variant="primary" (buttonClick)="onCancel()">
        {{ 'cancel' | translate }}
      </app-button>
      <app-button variant="mat-raised" color="warn" (buttonClick)="onConfirm()">
        {{ 'delete' | translate }}
      </app-button>
    </mat-dialog-actions>
  `,
})
export class ConfirmDialogComponent {
  readonly #dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA, { optional: true }) ?? {
    title: 'confirmDeleteTask',
    message: 'confirmDeleteMessage',
  };

  onConfirm(): void {
    this.#dialogRef.close(true);
  }

  onCancel(): void {
    this.#dialogRef.close(false);
  }
}
