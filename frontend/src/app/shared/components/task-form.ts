import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageService } from '../services/language';
import { TaskFormService } from '../forms/task';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';
import { InputComponent, ButtonComponent, TextareaComponent } from './';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputComponent,
    ButtonComponent,
    TextareaComponent,
  ],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit($event)" class="space-y-4">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ form.get('title')?.value ? t('editTask') : t('newTask') }}
      </h2>
      <app-input
        class="mt-4"
        formControlName="title"
        [placeholder]="t('taskTitle')"
        variant="default"
      />
      @if (showProjectSelect()) {
        <select
          class="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
          formControlName="projectId"
        >
          <option [ngValue]="0">{{ t('selectProject') }}</option>
          @for (project of projects(); track project.id) {
            <option [ngValue]="project.id">{{ project.name }}</option>
          }
        </select>
      }
      <app-textarea
        class="mt-3"
        formControlName="description"
        [placeholder]="t('description')"
        rows="5"
        variant="default"
      />
      <div class="mt-3 flex gap-2">
        <button appButton variant="primary" type="submit">
          {{ form.get('title')?.value ? t('save') : t('addTask') }}
        </button>
        @if (form.get('title')?.value) {
          <button
            appButton
            variant="secondary"
            type="button"
            (click)="onCancel()"
          >
            {{ t('cancel') }}
          </button>
        }
      </div>
    </form>
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
