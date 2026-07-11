import { Component, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { LanguageService } from '../../../shared/services/language';
import type { ProjectModel } from '@shared/types/project';

@Component({
  selector: 'app-project-filter',
  standalone: true,
  imports: [FormsModule, NgSelectModule],
  template: `
    <ng-select
      [items]="projects()"
      bindLabel="name"
      bindValue="id"
      [ngModel]="selectedProjectId()"
      (ngModelChange)="projectChange.emit($event)"
      [placeholder]="t('allProjects')"
      [clearable]="true"
      [searchable]="true"
      class="w-full"
    />
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* ng-select container */
      :host ::ng-deep .ng-select {
        @apply w-full;
      }

      :host ::ng-deep .ng-select.ng-select-single .ng-select-container {
        @apply rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 min-h-[38px] px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500;
        @apply hover:border-slate-400 dark:hover:border-slate-500;
      }

      :host ::ng-deep .ng-select.ng-select-focused .ng-select-container {
        @apply border-blue-500 dark:border-blue-400 ring-1 ring-blue-500 dark:ring-blue-400;
      }

      :host ::ng-deep .ng-select .ng-input > input {
        @apply text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500;
      }

      :host ::ng-deep .ng-select .ng-placeholder {
        @apply text-slate-400 dark:text-slate-500;
      }

      :host ::ng-deep .ng-select .ng-arrow-wrapper {
        @apply text-slate-400 dark:text-slate-500;
      }

      :host ::ng-deep .ng-select .ng-clear-wrapper {
        @apply text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-400;
      }

      /* dropdown panel */
      :host ::ng-deep .ng-dropdown-panel .ng-dropdown-panel-items {
        @apply rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-lg;
      }

      :host ::ng-deep .ng-dropdown-panel .ng-option {
        @apply px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-600;
      }

      :host ::ng-deep .ng-dropdown-panel .ng-option.ng-option-marked {
        @apply bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300;
      }

      :host ::ng-deep .ng-dropdown-panel .ng-option.ng-option-selected {
        @apply bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 font-medium;
      }

      /* search input inside dropdown */
      :host ::ng-deep .ng-dropdown-panel .ng-input input {
        @apply rounded-t-lg border-b border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-1.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none;
      }
    `,
  ],
})
export class ProjectFilterComponent {
  readonly projects = input.required<ProjectModel[]>();
  readonly selectedProjectId = input(0);
  readonly projectChange = output<number>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }
}
