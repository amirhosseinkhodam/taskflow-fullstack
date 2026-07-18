import { Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { LanguageService } from '../../../shared/services/language';
import { ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-project-delete-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, ButtonComponent],
  template: `
    <h3 class="mat-body-large mb-2 font-bold">
      {{ t('confirmDeleteProject') }}
    </h3>
    <p class="mat-body-medium text-slate-500 dark:text-slate-400 mb-2">
      {{ t('confirmDeleteProjectMessage') }}
    </p>
    @if (undoneCount > 0) {
      <p class="mb-4 text-sm font-medium text-amber-600 dark:text-amber-400">
        {{ t('projectHasUndoneTasks') }} ({{ undoneCount }})
      </p>
    }
    <div class="flex gap-2 justify-end">
      <app-button variant="primary" (buttonClick)="onCancel()">{{
        t('cancel')
      }}</app-button>
      <app-button
        variant="mat-raised"
        color="warn"
        (buttonClick)="onConfirm()"
        >{{ t('delete') }}</app-button
      >
    </div>
  `,
})
export class ProjectDeleteConfirmBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ProjectDeleteConfirmBottomSheetComponent>,
  );
  readonly #data = inject<{ undoneCount: number }>(MAT_BOTTOM_SHEET_DATA);
  readonly #languageService = inject(LanguageService);

  undoneCount = this.#data.undoneCount;

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onConfirm(): void {
    this.#bottomSheetRef.dismiss(true);
  }

  onCancel(): void {
    this.#bottomSheetRef.dismiss(false);
  }
}
