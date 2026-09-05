import { Component, inject } from '@angular/core';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { TranslatePipe } from '../pipes/translate';
import { ButtonComponent } from './button';

@Component({
  selector: 'app-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, ButtonComponent, TranslatePipe],
  template: `
    <h3 class="mat-body-large mb-2 font-bold">
      {{ data.title | translate }}
    </h3>
    <p class="mat-body-medium text-slate-500 dark:text-slate-400 mb-4">
      {{ data.message | translate }}
    </p>
    <div class="flex gap-2 justify-end">
      <app-button variant="primary" (buttonClick)="onCancel()">
        {{ 'cancel' | translate }}
      </app-button>
      <app-button variant="mat-raised" color="warn" (buttonClick)="onConfirm()">
        {{ 'delete' | translate }}
      </app-button>
    </div>
  `,
})
export class ConfirmBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ConfirmBottomSheetComponent>,
  );
  readonly data = inject(MAT_BOTTOM_SHEET_DATA, { optional: true }) ?? {
    title: 'confirmDeleteTask',
    message: 'confirmDeleteMessage',
  };

  onConfirm(): void {
    this.#bottomSheetRef.dismiss(true);
  }

  onCancel(): void {
    this.#bottomSheetRef.dismiss(false);
  }
}
