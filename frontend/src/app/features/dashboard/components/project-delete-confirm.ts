import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LanguageService } from '../../../shared/services/language';

@Component({
  selector: 'app-project-delete-confirm',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
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
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ t('cancel') }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        {{ t('delete') }}
      </button>
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
