import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';

@Component({
  selector: 'app-confirm-bottom-sheet',
  standalone: true,
  imports: [MatBottomSheetModule, MatButtonModule],
  template: `
    <h3 class="mat-body-large" style="margin: 0 0 8px; font-weight: 500;">
      Delete task
    </h3>
    <p class="mat-body-medium" style="margin: 0 0 16px; color: #64748b;">
      Are you sure you want to delete this task? This cannot be undone.
    </p>
    <div style="display: flex; gap: 8px; justify-content: flex-end;">
      <button mat-button (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">
        Delete
      </button>
    </div>
  `,
})
export class ConfirmBottomSheetComponent {
  private readonly bottomSheetRef =
    inject(MatBottomSheetRef<ConfirmBottomSheetComponent>);

  onConfirm(): void {
    this.bottomSheetRef.dismiss(true);
  }

  onCancel(): void {
    this.bottomSheetRef.dismiss(false);
  }
}
