import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { TranslatePipe } from '../../../shared/pipes/translate';
import { InputComponent } from '../../../shared/components/input';
import { ButtonComponent } from '../../../shared/components/button';

@Component({
  selector: 'app-project-edit-dialog',
  standalone: true,
  imports: [
    FormsModule,
    MatDialogModule,
    InputComponent,
    ButtonComponent,
    TranslatePipe,
  ],
  template: `
    <h2 mat-dialog-title>{{ 'editProject' | translate }}</h2>
    <mat-dialog-content>
      <app-input
        [(ngModel)]="projectName"
        [placeholder]="'editProjectName' | translate"
        (keydown.enter)="onConfirm()"
        variant="default"
      />
    </mat-dialog-content>
    <mat-dialog-actions align="end" class="gap-2">
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
    </mat-dialog-actions>
  `,
})
export class ProjectEditDialogComponent {
  readonly #dialogRef = inject(MatDialogRef<ProjectEditDialogComponent>);
  readonly #data = inject<{ name: string }>(MAT_DIALOG_DATA);

  projectName = this.#data.name;

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
