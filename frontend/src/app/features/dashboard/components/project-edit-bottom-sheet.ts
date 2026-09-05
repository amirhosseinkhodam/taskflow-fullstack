import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { InputComponent } from '../../../shared/components/input';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-project-edit-bottom-sheet',
  standalone: true,
  imports: [
    FormsModule,
    MatBottomSheetModule,
    InputComponent,
    ButtonComponent,
    TranslatePipe,
  ],
  template: `
    <h3 class="mat-body-large mb-4 font-bold">
      {{ 'editProject' | translate }}
    </h3>
    <app-input
      [(ngModel)]="projectName"
      [placeholder]="'editProjectName' | translate"
      (keydown.enter)="onConfirm()"
      variant="default"
    />
    <div class="flex gap-2 justify-end pt-4">
      <app-button variant="primary" (buttonClick)="onCancel()">{{
        'cancel' | translate
      }}</app-button>
      <app-button
        variant="mat-raised"
        color="primary"
        (buttonClick)="onConfirm()"
        [disabled]="!projectName.trim()"
      >
        {{ 'save' | translate }}
      </app-button>
    </div>
  `,
})
export class ProjectEditBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ProjectEditBottomSheetComponent>,
  );
  readonly #data = inject<{ name: string }>(MAT_BOTTOM_SHEET_DATA);

  projectName = this.#data.name;

  onConfirm(): void {
    const name = this.projectName.trim();
    if (name) {
      this.#bottomSheetRef.dismiss({ name });
    }
  }

  onCancel(): void {
    this.#bottomSheetRef.dismiss(null);
  }
}
