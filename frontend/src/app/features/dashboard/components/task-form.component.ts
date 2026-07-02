import { Component, effect, inject, input, output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language.service';
import { createTaskForm, TASK_FORM_DEFAULTS } from '../forms/task.form';
import type { ProjectModel } from '@shared/types/project.model';
import type { TaskModel } from '@shared/types/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ editingTask() ? t('editTask') : t('newTask') }}
      </h2>
      <input
        class="mt-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        formControlName="title"
        [placeholder]="t('taskTitle')"
      />
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
      <textarea
        class="mt-3 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
        formControlName="description"
        [placeholder]="t('description')"
        rows="3"
      ></textarea>
      <div class="mt-3 flex gap-2">
        <button
          class="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white"
          type="submit"
        >
          {{ editingTask() ? t('save') : t('addTask') }}
        </button>
        @if (editingTask()) {
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
  readonly submitTask = output<{
    title: string;
    description: string;
    projectId: number;
  }>();
  readonly cancelEdit = output<void>();
  readonly projectChange = output<number>();

  readonly #languageService = inject(LanguageService);
  readonly #fb = inject(FormBuilder);
  readonly form = createTaskForm(this.#fb);

  constructor() {
    effect(() => {
      const task = this.editingTask();
      if (task) {
        this.form.patchValue({
          title: task.title,
          projectId: task.projectId,
          description: task.description,
        });
      } else {
        this.form.reset(TASK_FORM_DEFAULTS);
      }
    });
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onSubmit(): void {
    if (!this.form.value.title?.trim()) return;
    this.submitTask.emit(
      this.form.value as {
        title: string;
        description: string;
        projectId: number;
      },
    );
    this.form.reset(TASK_FORM_DEFAULTS);
  }

  onCancel(): void {
    this.form.reset(TASK_FORM_DEFAULTS);
    this.cancelEdit.emit();
  }

  onProjectChange(): void {
    this.projectChange.emit(this.form.value.projectId ?? 0);
  }
}
