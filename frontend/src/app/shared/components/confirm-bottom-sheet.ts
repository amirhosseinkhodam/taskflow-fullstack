import { Component, computed, inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { TranslatePipe } from '../pipes/translate';
import { LanguageService } from '../services/language';
import { ButtonComponent } from './button';

@Component({
  selector: 'app-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, ButtonComponent, TranslatePipe],
  template: `
    <div [dir]="dir()">
      <h3 class="mat-body-large mb-2 font-bold">
        {{ data.title | translate }}
      </h3>
      <p class="mat-body-medium text-slate-500 dark:text-slate-400 mb-4">
        {{ data.message | translate }}
      </p>
      <div class="flex gap-2 justify-center">
        <app-button variant="primary" (buttonClick)="onCancel()">
          {{ 'cancel' | translate }}
        </app-button>
        <app-button
          variant="mat-raised"
          color="warn"
          (buttonClick)="onConfirm()"
        >
          {{ 'delete' | translate }}
        </app-button>
      </div>
    </div>
  `,
})
export class ConfirmBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ConfirmBottomSheetComponent>,
  );
  readonly #language = inject(LanguageService);
  readonly data = inject(MAT_BOTTOM_SHEET_DATA, { optional: true }) ?? {
    title: 'confirmDeleteTask',
    message: 'confirmDeleteMessage',
  };

  readonly dir = computed<'rtl' | 'ltr'>(() =>
    this.#language.getCurrentLanguageOption().rtl ? 'rtl' : 'ltr',
  );

  onConfirm(): void {
    this.#bottomSheetRef.dismiss(true);
  }

  onCancel(): void {
    this.#bottomSheetRef.dismiss(false);
  }
}
