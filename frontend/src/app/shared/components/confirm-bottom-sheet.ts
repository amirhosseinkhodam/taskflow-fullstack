import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { LanguageService } from '../services/language';

@Component({
  selector: 'app-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, MatButtonModule],
  template: `{{ '{' }}    <h3 class=\"mat-body-large mb-2 font-bold\">
      {{ t('confirmDeleteTask') }}
    </h3>
    <p
      class=\"mat-body-medium text-slate-500 dark:text-slate-400 mb-4\"
    >
      {{ t('confirmDeleteMessage') }}
    </p>
    <div class=\"flex gap-2 justify-end\">
      <button mat-button (click)=\"onCancel()\">{{ t('cancel') }}</button>
      <button mat-raised-button color=\"warn\" (click)=\"onConfirm()\">
        {{ t('delete') }}
      </button>
    </div>\n  `, {{ '}' }}}
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
