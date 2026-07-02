import { Component, inject, input, output } from '@angular/core';
import { DragDropModule, CdkDragDrop } from '@angular/cdk/drag-drop';
import { LanguageService } from '../../../shared/services/language.service';
import type { TaskModel } from '@shared/types/task.model';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [DragDropModule],
  template: `
    <div class="flex items-center justify-between gap-4">
      <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
        {{ t('tasks') }}
      </h2>
      <button
        class="rounded-lg border border-slate-300 dark:border-slate-600 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
        type="button"
        (click)="refresh.emit()"
      >
        {{ t('refresh') }}
      </button>
    </div>

    <div
      cdkDropList
      class="mt-4 space-y-3"
      (cdkDropListDropped)="onDrop($event)"
    >
      @for (task of tasks(); track task.id) {
        <article
          cdkDrag
          class="flex items-start justify-between gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-4"
        >
          <div class="flex items-start gap-3">
            <span
              cdkDragHandle
              class="mt-0.5 cursor-grab text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="size-5"
              >
                <path
                  d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM8 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4ZM8 22a2 2 0 1 1 0-4 2 2 0 0 1 0 4Zm8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4Z"
                />
              </svg>
            </span>
            <div>
              <h3
                class="font-medium text-slate-900 dark:text-slate-100"
                [class.line-through]="task.status === 'done'"
              >
                {{ task.title }}
              </h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                {{ task.description || t('noDescription') }}
              </p>
              <p
                class="mt-1 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
              >
                {{ task.status }}
              </p>
            </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-2">
            <button
              class="flex items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3 py-2 text-sm text-white min-h-[44px]"
              type="button"
              (click)="editTask.emit(task)"
              [title]="t('edit')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                />
              </svg>
              <span class="hidden sm:inline">{{ t('edit') }}</span>
            </button>
            <button
              class="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-sm text-white min-h-[44px]"
              type="button"
              (click)="toggleTask.emit(task)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="hidden sm:inline">{{ t('toggle') }}</span>
            </button>
            <button
              class="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-sm text-white min-h-[44px]"
              type="button"
              (click)="deleteTask.emit(task)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="inline h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="hidden sm:inline">{{ t('delete') }}</span>
            </button>
          </div>
        </article>
      } @empty {
        <p
          class="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-6 text-center text-slate-500 dark:text-slate-400"
        >
          {{ t('noTasksYet') }}
        </p>
      }
    </div>
  `,
})
export class TaskListComponent {
  readonly tasks = input.required<TaskModel[]>();
  readonly reorder = output<{ previousIndex: number; currentIndex: number }>();
  readonly editTask = output<TaskModel>();
  readonly toggleTask = output<TaskModel>();
  readonly deleteTask = output<TaskModel>();
  readonly refresh = output<void>();

  readonly #languageService = inject(LanguageService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  onDrop(event: CdkDragDrop<TaskModel[]>): void {
    this.reorder.emit({
      previousIndex: event.previousIndex,
      currentIndex: event.currentIndex,
    });
  }
}
