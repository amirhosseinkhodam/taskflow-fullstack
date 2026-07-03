import { Component, inject, input, output } from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language.service';
import type { ProjectModel } from '@shared/types/project.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form()" (ngSubmit)="onSubmit()">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ form().get('title')?.value ? t('editTask') : t('newTask') }}
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
          {{ form().get('title')?.value ? t('save') : t('addTask') }}
        </button>
        @if (form().get('title')?.value) {
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
  readonly form = input.required<FormGroup>();
  readonly submitForm = output<void>();
  readonly cancelEdit = output<void>();
  readonly projectChange = output<number>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onSubmit(): void {
    this.submitForm.emit();
  }

  onCancel(): void {
    this.cancelEdit.emit();
  }

  onProjectChange(): void {
    this.projectChange.emit(this.form().value.projectId ?? 0);
  }
}
