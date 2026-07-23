import { Component, inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { LanguageService } from '../services/language';
import { ButtonComponent } from './button';

@Component({
  selector: 'app-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, ButtonComponent],
  template: `
    <h3 class="mat-body-large mb-2 font-bold">
      {{ t(data.title) }}
    </h3>
    <p class="mat-body-medium text-slate-500 dark:text-slate-400 mb-4">
      {{ t(data.message) }}
    </p>
    <div class="flex gap-2 justify-end">
      <app-button variant="primary" (buttonClick)="onCancel()">
        {{ t('cancel') }}
      </app-button>
      <app-button variant="mat-raised" color="warn" (buttonClick)="onConfirm()">
        {{ t('delete') }}
      </app-button>
    </div>
  `,
})
export class ConfirmBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ConfirmBottomSheetComponent>,
  );
  readonly #languageService = inject(LanguageService);
  readonly data = inject(MAT_BOTTOM_SHEET_DATA, { optional: true }) ?? {
    title: 'confirmDeleteTask',
    message: 'confirmDeleteMessage',
  };

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
