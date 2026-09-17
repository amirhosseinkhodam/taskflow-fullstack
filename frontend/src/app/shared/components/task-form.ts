import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';
import { TaskFormService } from '../forms/task';
import { TranslatePipe } from '../pipes/translate';
import { ButtonComponent } from './button';
import { FormComponent } from './form';
import { FormFieldComponent } from './form-field';
import { InputComponent } from './input';
import { SelectComponent } from './select';
import type { SelectOption } from '../models/select';
import { TextareaComponent } from './textarea';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    TextareaComponent,
    SelectComponent,
    FormComponent,
    FormFieldComponent,
    TranslatePipe,
  ],
  template: `
    <app-form [formGroup]="form" (formSubmit)="onSubmit()">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ isEditing() ? ('editTask' | translate) : ('newTask' | translate) }}
      </h2>
      <app-input
        formControlName="title"
        [placeholder]="'taskTitlePlaceholder' | translate"
        variant="default"
        [cssClass]="'mt-4'"
      />
      <app-form-field [control]="form.controls.title" />
      @if (showProjectSelect()) {
        <app-select
          formControlName="projectId"
          [placeholder]="'selectProject' | translate"
          [options]="projectOptions()"
          variant="default"
          [cssClass]="'mt-3'"
        />
        <app-form-field [control]="form.controls.projectId" />
      }
      <app-input
        formControlName="assigneeEmail"
        [placeholder]="'assigneeEmailPlaceholder' | translate"
        type="email"
        variant="default"
        [cssClass]="'mt-3'"
      />
      <app-form-field [control]="form.controls.assigneeEmail" />
      <app-textarea
        formControlName="description"
        [placeholder]="'descriptionPlaceholder' | translate"
        [rows]="5"
        variant="default"
        [cssClass]="'mt-3'"
      />
      <div class="mt-3 flex gap-2">
        <app-button
          class="w-full"
          variant="primary"
          type="submit"
          [cssClass]="'flex-1 w-full'"
        >
          {{ isEditing() ? ('save' | translate) : ('addTask' | translate) }}
        </app-button>
        @if (isEditing()) {
          <app-button
            variant="secondary"
            type="button"
            (buttonClick)="onCancel()"
          >
            {{ 'cancel' | translate }}
          </app-button>
        }
      </div>
    </app-form>
  `,
})
export class TaskFormComponent {
  readonly projects = input.required<ProjectModel[]>();
  readonly editingTask = input<TaskModel | null>(null);
  readonly showProjectSelect = input(true);
  readonly submitTask = output<{
    title: string;
    description: string;
    projectId: number;
    assigneeEmail?: string;
  }>();
  readonly cancelEdit = output<void>();

  readonly #taskForm = inject(TaskFormService);

  get form() {
    return this.#taskForm.form;
  }

  readonly isEditing = computed(() => this.editingTask() !== null);

  readonly projectOptions = computed<SelectOption[]>(() =>
    this.projects().map((p) => ({ value: p.id, label: p.name })),
  );

  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) {
        this.#taskForm.patchForEdit(
          task.title,
          task.projectId,
          task.description,
          task.assigneeEmail ?? undefined,
        );
      }
    });
  }

  onSubmit(): void {
    if (this.#taskForm.form.invalid) return;
    const { projectId, ...rest } = this.#taskForm.form.getRawValue();
    if (projectId === null) return;
    this.submitTask.emit({ ...rest, projectId });
    this.#taskForm.resetForm();
  }

  onCancel(): void {
    this.cancelEdit.emit();
    this.#taskForm.resetForm();
  }
}
