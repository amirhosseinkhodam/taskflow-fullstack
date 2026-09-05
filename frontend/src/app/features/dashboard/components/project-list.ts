import { Component, inject, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language';
import { LocalizedDatePipe } from '../../../shared/pipes/localized-date';
import type { ProjectModel } from '@shared/types/project';
import { InputComponent } from '../../../shared/components/input';
import { ButtonComponent } from '../../../shared/components/button';
import { FormComponent } from '../../../shared/components/form';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { Edit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    LocalizedDatePipe,
    InputComponent,
    ButtonComponent,
    FormComponent,
    HugeiconsIconComponent,
  ],
  template: `
    <div class="h-full flex flex-col min-h-0">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ t('projects') }}
      </h2>
      <app-form
        [formGroup]="form"
        variant="inline"
        [cssClass]="'w-full mt-4 gap-2 items-center'"
        (ngSubmit)="createProject()"
      >
        <app-input
          formControlName="projectName"
          class="min-w-0 flex-1"
          [placeholder]="t('newProjectName')"
          variant="default"
        />
        <app-button variant="primary" type="submit">
          {{ t('add') }}
        </app-button>
      </app-form>

      <ul
        class="my-4 divide-y divide-slate-200 dark:divide-slate-700 overflow-y-auto flex-1 min-h-0"
      >
        @for (project of projects(); track project.id) {
          <li
            class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
          >
            <div class="min-w-0">
              <span
                class="text-sm text-slate-700 dark:text-slate-300 truncate block"
              >
                {{ project.name }}
              </span>
              <div
                class="flex flex-wrap gap-x-3 text-xs text-slate-400 dark:text-slate-500 mt-0.5"
              >
                <span
                  >{{ t('created') }}:
                  {{ project.createdAt | localizedDate }}</span
                >
                @if (project.updatedAt !== project.createdAt) {
                  <span
                    >{{ t('modified') }}:
                    {{ project.updatedAt | localizedDate }}</span
                  >
                }
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 ms-2">
              <button
                class="rounded p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
                type="button"
                [attr.aria-label]="t('edit')"
                (click)="edit.emit(project)"
              >
                <hugeicons-icon
                  [icon]="icons.Edit01Icon"
                  [size]="16"
                  color="currentColor"
                  [strokeWidth]="1.5"
                />
              </button>
              <button
                class="rounded p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                type="button"
                [attr.aria-label]="t('delete')"
                (click)="delete.emit(project)"
              >
                <hugeicons-icon
                  [icon]="icons.Delete01Icon"
                  [size]="16"
                  color="currentColor"
                  [strokeWidth]="1.5"
                />
              </button>
            </div>
          </li>
        } @empty {
          <li
            class="py-4 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            {{ t('noProjectsYet') }}
          </li>
        }
      </ul>
    </div>
  `,
})
export class ProjectListComponent {
  readonly projects = input.required<ProjectModel[]>();
  readonly create = output<string>();
  readonly edit = output<ProjectModel>();
  readonly delete = output<ProjectModel>();

  readonly icons = { Edit01Icon, Delete01Icon };

  readonly #languageService = inject(LanguageService);
  readonly #fb = inject(FormBuilder);

  readonly form = this.#fb.nonNullable.group({
    projectName: ['', Validators.required],
  });

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  createProject(): void {
    const name = this.form.getRawValue().projectName.trim();
    if (!name) return;
    this.create.emit(name);
    this.form.reset();
  }
}
