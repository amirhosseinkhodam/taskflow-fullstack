import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { LanguageService } from '../services/language.service';

@Component({
  selector: 'app-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, MatButtonModule],
  template: `
    <h3 class="mat-body-large" style="margin: 0 0 8px; font-weight: 500;">
      {{ t('confirmDeleteTask') }}
    </h3>
    <p
      class="mat-body-medium text-slate-500 dark:text-slate-400"
      style="margin: 0 0 16px;"
    >
      {{ t('confirmDeleteMessage') }}
    </p>
    <div style="display: flex; gap: 8px; justify-content: flex-end;">
      <button mat-button (click)="onCancel()">{{ t('cancel') }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        {{ t('delete') }}
      </button>
    </div>
  `,
})
export class ConfirmBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ConfirmBottomSheetComponent>,
  );
  readonly #languageService = inject(LanguageService);

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
