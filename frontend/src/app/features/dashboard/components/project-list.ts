import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LanguageService } from '../../../shared/services/language';
import { JalaliDatePipe } from '../../../shared/pipes/jalali-date';
import type { ProjectModel } from '@shared/types/project';
import {
  InputComponent,
  ButtonComponent,
  FormComponent,
} from '../../../shared/components';

@Component({
  selector: 'app-project-list',
  standalone: true,
  imports: [
    FormsModule,
    JalaliDatePipe,
    InputComponent,
    ButtonComponent,
    FormComponent,
  ],
  template: `
    <div class="h-full flex flex-col min-h-0">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ t('projects') }}
      </h2>
      <form
        class="w-full flex gap-2"
        (ngSubmit)="createProject($event)"
        appForm
        variant="inline"
      >
        <app-input
          class="min-w-0 flex-1"
          name="projectName"
          [placeholder]="t('newProjectName')"
          [(ngModel)]="projectName"
          variant="default"
        />
        <button appButton variant="primary" type="submit">
          {{ t('add') }}
        </button>
      </form>

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
                  {{ project.createdAt | jalaliDate }}</span
                >
                @if (project.updatedAt !== project.createdAt) {
                  <span
                    >{{ t('modified') }}:
                    {{ project.updatedAt | jalaliDate }}</span
                  >
                }
              </div>
            </div>
            <div class="flex items-center gap-1 shrink-0 ms-2">
              <button
                appButton
                variant="ghost"
                type="button"
                [attr.aria-label]="t('edit')"
                (click)="edit.emit(project)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                  />
                </svg>
              </button>
              <button
                appButton
                variant="ghost"
                [cssClass]="'text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-500'"
                type="button"
                [attr.aria-label]="t('delete')"
                (click)="delete.emit(project)"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  class="w-4 h-4"
                >
                  <path
                    fill-rule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
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

  readonly #languageService = inject(LanguageService);

  projectName = signal('');

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  createProject(event: Event): void {
    event.preventDefault();
    const name = this.projectName().trim();
    if (!name) return;
    this.create.emit(name);
    this.projectName.set('');
  }
}
