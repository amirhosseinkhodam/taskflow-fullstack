import { Component, computed, inject, input, output } from '@angular/core';
import type { TaskFilterModel } from '../task-filter';
import type { TaskModel } from '@shared/types/task';

@Component({
  selector: 'app-task-list',
  standalone: true,
  template: `
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ t('tasks') }}
        @if (isFiltered()) {
          <span class="text-sm text-slate-500 dark:text-slate-400 ml-2">
            ({{ filteredTasksCount() }} {{ t('filtered') }})
          </span>
        }
      </h2>
      @if (filter()) {
        <button
          class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          type="button"
          (click)="refresh.emit()"
        >
          {{ t('refresh') }}
        </button>
      }
    </div>

    <div class="mt-4 space-y-3">
      @for (task of filteredTasks(); track task.id) {
        <article
          class="flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
        >
          <div class="w-full">
            <h3 class="font-medium text-slate-900 dark:text-slate-100">{{ task.title }}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ task.description }}</p>
            <div class="mt-2 flex items-center gap-2">
              <span class="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
                {{ task.status }}
              </span>
              <span class="text-xs text-slate-500 dark:text-slate-400">
                {{ t('project') }}: {{ task.projectId }}
              </span>
            </div>
          </div>
          <div class="flex flex-col items-end gap-2">
            <button
              type="button"
              class="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              (click)="onEdit(task)"
            >
              {{ t('edit') }}
            </button>
            <button
              type="button"
              class="text-sm text-red-600 dark:text-red-400 hover:underline"
              (click)="onDelete(task)"
            >
              {{ t('delete') }}
            </button>
            <button
              type="button"
              class="text-sm text-green-600 dark:text-green-400 hover:underline"
              (click)="onToggleStatus(task)"
            >
              {{ task.status === 'done' ? t('markAsPending') : t('markAsDone') }}
            </button>
          </div>
        </article>
      } @empty {
        <p class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center text-slate-500 dark:text-slate-400">
          {{ t('noTasksYet') }}
        </p>
      }
    </div>
  `,
})
export class TaskListComponent {
  readonly tasks = input.required<TaskModel[]>();
  readonly projects = input.required<any[]>();
  readonly reorder = output<{ previousIndex: number; currentIndex: number }>();
  readonly editTask = output<TaskModel>();
  readonly refresh = output<void>();
  readonly filter = input<TaskFilterModel | null>(null);

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  isFiltered = computed(() => this.filter() !== null);

  filteredTasks = computed(() => {
    const tasks = this.tasks();
    const filter = this.filter();
    if (!filter) return tasks;

    return tasks.filter(task => {
      const searchMatch = !filter.searchTerm ||
        task.title.toLowerCase().includes(filter.searchTerm.toLowerCase());

      const statusMatch = filter.status === 'all' || task.status === filter.status;

      const projectMatch = filter.projectId === undefined || task.projectId === filter.projectId;

      return searchMatch && statusMatch && projectMatch;
    });
  });

  filteredTasksCount = computed(() => this.filteredTasks().length);

  onEdit(task: TaskModel): void {
    this.editTask.emit(task);
  }

  onDelete(task: TaskModel): void {
    this.refresh.emit();
  }

  onToggleStatus(task: TaskModel): void {
    this.refresh.emit();
  }
}
