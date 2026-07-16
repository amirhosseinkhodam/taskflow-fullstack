import { Component, inject, input, output } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LanguageService } from '../services/language';
import { JalaliDatePipe } from '../pipes/jalali-date';
import { DashboardService } from '../../features/dashboard/services/dashboard';
import { ConfirmDialogComponent } from './confirm-dialog';
import { ButtonComponent } from './button';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [JalaliDatePipe, ButtonComponent],
  template: `
    @if (task(); as task) {
      <div class="flex items-start gap-3 w-full">
        <ng-content select="[dragHandle]" />
        <div class="flex items-start justify-between gap-4 flex-1 min-w-0">
          <div class="min-w-0 flex-1">
            <div class="flex justify-between gap-2 items-center">
              <h3
                class="font-medium text-slate-900 dark:text-slate-100"
                [class.line-through]="task.status === 'done'"
              >
                {{ task.title }}
              </h3>
              <div class="flex flex-wrap gap-1.5">
                <span
                  class="inline-block rounded-full bg-slate-100 dark:bg-slate-700 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-400"
                >
                  {{ getProjectName(task.projectId) }}
                </span>
                @if (showCreatorBadge() && task.creatorName) {
                  <span
                    class="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-300"
                  >
                    {{ task.creatorName }}
                  </span>
                }
              </div>
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ task.description || t('noDescription') }}
            </p>
            <p
              class="mt-1 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              {{ task.status }}
            </p>
            <div
              class="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-400 dark:text-slate-500"
            >
              <span>{{ t('created') }}: {{ task.createdAt | jalaliDate }}</span>
              @if (task.updatedAt !== task.createdAt) {
                <span
                  >{{ t('modified') }}: {{ task.updatedAt | jalaliDate }}</span
                >
              }
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-2 shrink-0">
            @if (showDetailLink()) {
              <app-button
                variant="primary"
                size="md"
                type="button"
                (buttonClick)="navigateToDetail(task.id)"
                [title]="t('detail')"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="inline h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                    clip-rule="evenodd"
                  />
                </svg>
                <span class="hidden sm:inline">{{ t('detail') }}</span>
              </app-button>
            }
            @if (showEditButton()) {
              <app-button
                variant="warning"
                size="md"
                type="button"
                (buttonClick)="edit.emit(task)"
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
              </app-button>
            }
            <app-button
              variant="success"
              size="md"
              type="button"
              (buttonClick)="handleToggle()"
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
            </app-button>
            <app-button
              variant="destructive"
              size="md"
              type="button"
              (buttonClick)="confirmDelete()"
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
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class TaskItemComponent {
  readonly task = input.required<TaskModel>();
  readonly projects = input.required<ProjectModel[]>();
  readonly showDetailLink = input(true);
  readonly showCreatorBadge = input(false);
  readonly showEditButton = input(false);

  readonly edit = output<TaskModel>();
  readonly toggled = output<TaskModel>();
  readonly deleted = output<TaskModel>();

  readonly #dashboardService = inject(DashboardService);
  readonly #languageService = inject(LanguageService);
  readonly #dialog = inject(MatDialog);
  readonly #router = inject(Router);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  getProjectName(projectId: number): string {
    return this.projects().find((p) => p.id === projectId)?.name ?? '';
  }

  navigateToDetail(): void {
    const task = this.task();
    if (task) {
      this.#router.navigate(['/task-details', task.id]);
    }
  }

  handleToggle(): void {
    const task = this.task();
    if (!task) return;

    const newStatus = task.status === 'done' ? 'pending' : 'done';
    this.#dashboardService.updateTaskStatus(task.id, newStatus).subscribe({
      next: () => {
        this.#dashboardService.getTask(task.id).subscribe((updated) => {
          this.toggled.emit(updated);
        });
      },
    });
  }

  confirmDelete(): void {
    const dialogRef = this.#dialog.open(ConfirmDialogComponent);
    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      const task = this.task();
      if (!task) return;
      this.#dashboardService.deleteTask(task.id).subscribe({
        next: () => this.deleted.emit(task),
      });
    });
  }
}
