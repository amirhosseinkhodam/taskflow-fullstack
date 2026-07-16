import { Component, inject } from '@angular/core';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LanguageService } from '../../../shared/services/language';
import { ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-project-delete-confirm',
  standalone: true,
  imports: [MatDialogModule, ButtonComponent],
  template: `
    <h2 mat-dialog-title>{{ t('confirmDeleteProject') }}</h2>
    <mat-dialog-content>
      <p>{{ t('confirmDeleteProjectMessage') }}</p>
      @if (undoneCount > 0) {
        <p class="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
          {{ t('projectHasUndoneTasks') }} ({{ undoneCount }})
        </p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
      <app-button variant="primary" (buttonClick)="onCancel()">{{
        t('cancel')
      }}</app-button>
      <app-button
        variant="mat-raised"
        color="warn"
        (buttonClick)="onConfirm()"
        >{{ t('delete') }}</app-button
      >
    </mat-dialog-actions>
  `,
})
export class ProjectDeleteConfirmComponent {
  readonly #dialogRef = inject(MatDialogRef<ProjectDeleteConfirmComponent>);
  readonly #data = inject<{ undoneCount: number }>(MAT_DIALOG_DATA);
  readonly #languageService = inject(LanguageService);

  undoneCount = this.#data.undoneCount;

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
