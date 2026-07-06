import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { LanguageService } from '../services/language';
import { TaskFormService } from '../forms/task';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ form.get('title')?.value ? t('editTask') : t('newTask') }}
      </h2>
      <input
        class="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        formControlName="title"
        [placeholder]="t('taskTitle')"
      />
      @if (showProjectSelect()) {
        <select
          class="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100"
          formControlName="projectId"
          (change)="onProjectChange()"
        >
          <option [ngValue]="0">{{ t('selectProject') }}</option>
          @for (project of projects(); track project.id) {
            <option [ngValue]="project.id">{{ project.name }}</option>
          }
        </select>
      }
      <textarea
        class="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        formControlName="description"
        [placeholder]="t('description')"
        rows="5"
      ></textarea>
      <div class="mt-3 flex gap-2">
        <button
          class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white"
          type="submit"
        >
          {{ form.get('title')?.value ? t('save') : t('addTask') }}
        </button>
        @if (form.get('title')?.value) {
          <button
            class="rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-2 text-slate-700 dark:text-slate-300"
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
  readonly selectedProjectId = input(0);
  readonly showProjectSelect = input(true);
  readonly submitTask = output<{
    title: string;
    description: string;
    projectId: number;
  }>();
  readonly cancelEdit = output<void>();
  readonly projectChange = output<number>();

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

    effect(() => {
      if (!this.editingTask()) {
        this.#taskForm.patchProjectId(this.selectedProjectId());
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

  onProjectChange(): void {
    this.projectChange.emit(this.#taskForm.form.value.projectId ?? 0);
  }
}
