import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { LanguageService } from '../../../shared/services/language';
import { InputComponent } from '../../../shared/components';

@Component({
  selector: 'app-project-edit-dialog',
  standalone: true,
  imports: [FormsModule, MatDialogModule, MatButtonModule, InputComponent],
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
      <button mat-button (click)="onCancel()">{{ t('cancel') }}</button>
      <button
        mat-raised-button
        color="primary"
        (click)="onConfirm()"
        [disabled]="!projectName.trim()"
      >
        {{ t('save') }}
      </button>
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
