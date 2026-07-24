import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_BOTTOM_SHEET_DATA,
  MatBottomSheetModule,
  MatBottomSheetRef,
} from '@angular/material/bottom-sheet';
import { LanguageService } from '../../../shared/services/language';
import { InputComponent, ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-project-edit-bottom-sheet',
  standalone: true,
  imports: [FormsModule, MatBottomSheetModule, InputComponent, ButtonComponent],
  template: `
    <h3 class="mat-body-large mb-4 font-bold">
      {{ t('editProject') }}
    </h3>
    <app-input
      [(ngModel)]="projectName"
      [placeholder]="t('editProjectName')"
      (keydown.enter)="onConfirm()"
      variant="default"
    />
    <div class="flex gap-2 justify-end pt-4">
      <app-button variant="primary" (buttonClick)="onCancel()">{{
        t('cancel')
      }}</app-button>
      <app-button
        variant="mat-raised"
        color="primary"
        (buttonClick)="onConfirm()"
        [disabled]="!projectName.trim()"
      >
        {{ t('save') }}
      </app-button>
    </div>
  `,
})
export class ProjectEditBottomSheetComponent {
  readonly #bottomSheetRef = inject(
    MatBottomSheetRef<ProjectEditBottomSheetComponent>,
  );
  readonly #languageService = inject(LanguageService);
  readonly #data = inject<{ name: string }>(MAT_BOTTOM_SHEET_DATA);

  projectName = this.#data.name;

  t(key: string): string {
    return this.#languageService.translate(key);
  }

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
