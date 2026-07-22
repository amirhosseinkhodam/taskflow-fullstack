import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject, input, output } from '@angular/core';
import type { ProjectModel } from '@shared/types/project';
import type { TaskModel } from '@shared/types/task';
import { LanguageService } from '../../../shared/services/language';
import { TaskItemComponent } from '../../../shared/components/task-item';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [DragDropModule, TaskItemComponent],
  template: `
    <div cdkDropList class="space-y-3" (cdkDropListDropped)="onDrop($event)">
      @for (task of tasks(); track task.id) {
        <article
          cdkDrag
          class="flex items-start justify-between gap-4 rounded-container border border-slate-200 dark:border-slate-700 p-4"
        >
          <app-task-item
            class="w-full"
            [task]="task"
            [projects]="projects()"
            [showDetailLink]="true"
            [showEditButton]="true"
            [showCreatorBadge]="true"
            [showAssigneeBadge]="true"
            (edit)="editTask.emit($event)"
            (toggled)="refresh.emit()"
            (deleted)="refresh.emit()"
          >
            <span
              cdkDragHandle
              dragHandle
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
          </app-task-item>
        </article>
      } @empty {
        <p
          class="rounded-card border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-sm text-slate-500 dark:text-slate-400"
        >
          {{ t('noTasksYet') }}
        </p>
      }
    </div>
  `,
})
export class TaskListComponent {
  readonly tasks = input.required<TaskModel[]>();
  readonly projects = input.required<ProjectModel[]>();
  readonly reorder = output<{ previousIndex: number; currentIndex: number }>();
  readonly editTask = output<TaskModel>();
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
