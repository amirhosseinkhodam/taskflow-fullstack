import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LanguageService } from '../../../shared/services/language';
import { InputComponent, ButtonComponent } from '../../../shared/components';

@Component({
  selector: 'app-project-edit-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, InputComponent, ButtonComponent],
  template: `
    <h2 mat-dialog-title>{{ t('editProject') }}</h2>
    <mat-dialog-content>
      <app-input
        [(ngModel)]="projectName"
        [placeholder]="t('editProjectName')"
        (keydown.enter)="onConfirm()"
        variant="default"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <app-button variant="mat-text" (buttonClick)="onCancel()">{{
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
    </mat-dialog-actions>
  `,
})
export class ProjectEditDialogComponent {
  readonly #dialogRef = inject(MatDialogRef<ProjectEditDialogComponent>);
  readonly #data = inject<{ name: string }>(MAT_DIALOG_DATA);
  readonly #languageService = inject(LanguageService);

  projectName = this.#data.name;

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onConfirm(): void {
    const name = this.projectName.trim();
    if (name) {
      this.#dialogRef.close({ name });
    }
  }

  onCancel(): void {
    this.#dialogRef.close(null);
  }
}
