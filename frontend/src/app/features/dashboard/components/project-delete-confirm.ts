import { Component, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-project-delete-confirm',
  standalone: true,
  imports: [MatDialogModule, ButtonComponent, TranslatePipe],
  template: `
    <h2 mat-dialog-title>{{ 'confirmDeleteProject' | translate }}</h2>
    <mat-dialog-content>
      <p>{{ 'confirmDeleteProjectMessage' | translate }}</p>
      @if (undoneCount > 0) {
        <p class="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
          {{ 'projectHasUndoneTasks' | translate }} ({{ undoneCount }})
        </p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <app-button variant="primary" (buttonClick)="onCancel()">{{
        'cancel' | translate
      }}</app-button>
      <app-button
        variant="mat-raised"
        color="warn"
        (buttonClick)="onConfirm()"
        >{{ 'delete' | translate }}</app-button
      >
    </mat-dialog-actions>
  `,
})
export class ProjectDeleteConfirmComponent {
  readonly #dialogRef = inject(MatDialogRef<ProjectDeleteConfirmComponent>);
  readonly #data = inject<{ undoneCount: number }>(MAT_DIALOG_DATA);

  undoneCount = this.#data.undoneCount;

  onConfirm(): void {
    this.#dialogRef.close(true);
  }

  onCancel(): void {
    this.#dialogRef.close(false);
  }
}
