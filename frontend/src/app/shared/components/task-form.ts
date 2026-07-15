import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';
import { TaskFormService } from '../forms/task';
import { LanguageService } from '../services/language';
import {
  ButtonComponent,
  FormComponent,
  InputComponent,
  SelectComponent,
  TextareaComponent,
  type SelectOption,
} from './';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormComponent,
    InputComponent,
    ButtonComponent,
    TextareaComponent,
    SelectComponent,
  ],
  template: `
    <app-form
      [formGroup]="form"
      (ngSubmit)="onSubmit($event)"
      variant="default"
    >
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ form.get('title')?.value ? t('editTask') : t('newTask') }}
      </h2>
      <app-input
        formControlName="title"
        [label]="t('taskTitle')"
        [placeholder]="t('taskTitlePlaceholder')"
        variant="default"
      />
      @if (showProjectSelect()) {
        <app-select
          formControlName="projectId"
          [label]="t('project')"
          [placeholder]="t('selectProject')"
          [options]="projectOptions()"
          variant="default"
        />
      }
      <app-textarea
        formControlName="description"
        [label]="t('description')"
        [placeholder]="t('descriptionPlaceholder')"
        rows="5"
        variant="default"
      />
      <div class="mt-6 flex gap-2">
        <app-button variant="primary" type="submit">
          {{ form.get('title')?.value ? t('save') : t('addTask') }}
        </app-button>
        @if (form.get('title')?.value) {
          <app-button
            variant="secondary"
            type="button"
            (buttonClick)="onCancel()"
          >
            {{ t('cancel') }}
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
  }>();
  readonly cancelEdit = output<void>();

  readonly #taskForm = inject(TaskFormService);
  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  get form() {
    return this.#taskForm.form;
  }

  projectOptions(): SelectOption[] {
    return [
      { value: 0, label: this.t('selectProject') },
      ...this.projects().map((p) => ({ value: p.id, label: p.name })),
    ];
  }

  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) {
        this.#taskForm.patchForEdit(
          task.title,
          task.projectId,
          task.description,
        );
      }
    });
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    const value = this.#taskForm.form.getRawValue();
    this.submitTask.emit(value);
    this.#taskForm.resetForm(value.projectId);
  }

  onCancel(): void {
    this.cancelEdit.emit();
    this.#taskForm.resetForm(this.#taskForm.form.getRawValue().projectId);
  }
}
