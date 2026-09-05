import { Component, effect, inject, input, output } from '@angular/core';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';
import { TaskFormService } from '../forms/task';
import { LanguageService } from '../services/language';
import { TranslatePipe } from '../pipes/translate';
import { ButtonComponent } from './button';
import { FormComponent } from './form';
import { InputComponent } from './input';
import { SelectComponent } from './select';
import type { SelectOption } from '../models/select';
import { TextareaComponent } from './textarea';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    InputComponent,
    ButtonComponent,
    TextareaComponent,
    SelectComponent,
    FormComponent,
    TranslatePipe,
  ],
  template: `
    <app-form [formGroup]="form" (formSubmit)="onSubmit()">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{
          form.get('title')?.value
            ? ('editTask' | translate)
            : ('newTask' | translate)
        }}
      </h2>
      <app-input
        formControlName="title"
        [placeholder]="'taskTitlePlaceholder' | translate"
        variant="default"
        [cssClass]="'mt-4'"
      />
      @if (showProjectSelect()) {
        <app-select
          formControlName="projectId"
          [placeholder]="'selectProject' | translate"
          [options]="projectOptions()"
          variant="default"
          [cssClass]="'mt-3'"
        />
      }
      <app-input
        formControlName="assigneeEmail"
        [placeholder]="'assigneeEmailPlaceholder' | translate"
        type="email"
        variant="default"
        [cssClass]="'mt-3'"
      />
      <app-textarea
        formControlName="description"
        [placeholder]="'descriptionPlaceholder' | translate"
        rows="5"
        variant="default"
        [cssClass]="'mt-3'"
      />
      <div class="mt-3 flex gap-2">
        <app-button
          class="w-full"
          variant="primary"
          type="submit"
          [cssClass]="'flex-1 w-full bg-blue-600 hover:bg-blue-700'"
        >
          {{
            form.get('title')?.value
              ? ('save' | translate)
              : ('addTask' | translate)
          }}
        </app-button>
        @if (form.get('title')?.value) {
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
  readonly #languageService = inject(LanguageService);

  get form() {
    return this.#taskForm.form;
  }

  projectOptions(): SelectOption[] {
    return [
      { value: 0, label: this.#languageService.translate('selectProject') },
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
          task.assigneeEmail ?? undefined,
        );
      }
    });
  }

  onSubmit(): void {
    const value = this.#taskForm.form.getRawValue();
    this.submitTask.emit(value);
    this.#taskForm.resetForm(value.projectId);
  }

  onCancel(): void {
    this.cancelEdit.emit();
    this.#taskForm.resetForm(this.#taskForm.form.getRawValue().projectId);
  }
}
