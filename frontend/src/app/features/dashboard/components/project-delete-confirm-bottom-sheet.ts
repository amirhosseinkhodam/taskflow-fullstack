import { Component, inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-project-delete-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, ButtonComponent, TranslatePipe],
  template: `
    <h3 class="mat-body-large mb-2 font-bold">
      {{ 'confirmDeleteProject' | translate }}
    </h3>
    <p class="mat-body-medium text-slate-500 dark:text-slate-400 mb-2">
      {{ 'confirmDeleteProjectMessage' | translate }}
    </p>
    @if (undoneCount > 0) {
      <p class="mb-4 text-sm font-medium text-amber-600 dark:text-amber-400">
        {{ 'projectHasUndoneTasks' | translate }} ({{ undoneCount }})
      </p>
    }
    <div class="flex gap-2 justify-end">
      <app-button variant="primary" (buttonClick)="onCancel()">{{
        'cancel' | translate
      }}</app-button>
      <app-button
        variant="mat-raised"
        color="warn"
        (buttonClick)="onConfirm()"
        >{{ 'delete' | translate }}</app-button
      >
    </div>
  `,
})
export class ProjectDeleteConfirmBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ProjectDeleteConfirmBottomSheetComponent>,
  );
  readonly #data = inject<{ undoneCount: number }>(MAT_BOTTOM_SHEET_DATA);

  undoneCount = this.#data.undoneCount;

  onConfirm(): void {
    this.#bottomSheetRef.dismiss(true);
  }

  onCancel(): void {
    this.#bottomSheetRef.dismiss(false);
  }
}
