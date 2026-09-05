import { Component, inject, input, output, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { AddCircleIcon, Edit01Icon, Delete01Icon } from '@hugeicons/core-free-icons';
import { LanguageService } from '../services/language';
import { LocalizedDatePipe } from '../pipes/localized-date';
import { ConfirmDialogComponent } from './confirm-dialog';
import { ConfirmBottomSheetComponent } from './confirm-bottom-sheet';
import { ButtonComponent } from './button';
import { SelectComponent, type SelectOption } from './select';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';
import type { TaskStatus } from '../models/task';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [
    LocalizedDatePipe,
    ButtonComponent,
    MatBottomSheetModule,
    SelectComponent,
    HugeiconsIconComponent,
  ],
  template: `
    @if (task(); as task) {
      <div class="flex items-start gap-3 w-full">
        <ng-content select="[dragHandle]" />
        <div class="flex items-start justify-between gap-4 flex-1 min-w-0">
          <div class="min-w-0 flex-1">
            <h3
              class="font-medium text-slate-900 dark:text-slate-100"
              [class.line-through]="task.status === 'done'"
            >
              {{ task.title }}
            </h3>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              {{ t('project') }}: {{ getProjectName(task.projectId) }}
            </p>
            <div class="flex flex-wrap gap-1.5 mt-1">
              @if (showCreatorBadge() && task.creatorName) {
                <span
                  class="inline-block rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2 py-0.5 text-xs text-indigo-600 dark:text-indigo-300"
                >
                  {{ t('createdBy') }}: {{ task.creatorName }}
                </span>
              }
              @if (showAssigneeBadge() && task.assigneeName) {
                <span
                  class="inline-block rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs text-green-600 dark:text-green-300"
                >
                  {{ t('assignedTo') }}: {{ task.assigneeName }}
                </span>
              }
            </div>
            <p class="text-sm text-slate-600 dark:text-slate-400">
              {{ task.description || t('noDescription') }}
            </p>
            <p
              class="mt-1 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              {{ t('status') }}: {{ t(getStatusLabel(task.status)) }}
            </p>
            <div
              class="mt-1 flex flex-wrap gap-x-3 text-xs text-slate-400 dark:text-slate-500"
            >
              <span
                >{{ t('created') }}: {{ task.createdAt | localizedDate }}</span
              >
              @if (task.updatedAt !== task.createdAt) {
                <span
                  >{{ t('modified') }}:
                  {{ task.updatedAt | localizedDate }}</span
                >
              }
            </div>
          </div>

          <div class="flex flex-col gap-2">
            <div class="flex flex-col sm:flex-row gap-2 shrink-0">
              @if (showDetailLink()) {
                <app-button
                  variant="primary"
                  size="md"
                  type="button"
                  (buttonClick)="navigateToDetail(task.id)"
                  [title]="t('detail')"
                  cssClass="w-full sm:w-auto"
                >
                  <hugeicons-icon
                    [icon]="icons.AddCircleIcon"
                    [size]="16"
                    color="currentColor"
                    [strokeWidth]="1.5"
                    class="inline"
                  />
                  <span>{{ t('detail') }}</span>
                </app-button>
              }
              @if (showEditButton()) {
                <app-button
                  variant="warning"
                  size="md"
                  type="button"
                  (buttonClick)="edit.emit(task)"
                  [title]="t('edit')"
                  cssClass="w-full sm:w-auto"
                >
                  <hugeicons-icon
                    [icon]="icons.Edit01Icon"
                    [size]="16"
                    color="currentColor"
                    [strokeWidth]="1.5"
                    class="inline"
                  />
                  <span>{{ t('edit') }}</span>
                </app-button>
              }
              <app-button
                variant="destructive"
                size="md"
                type="button"
                (buttonClick)="confirmDelete()"
                cssClass="w-full sm:w-auto"
              >
                <hugeicons-icon
                  [icon]="icons.Delete01Icon"
                  [size]="16"
                  color="currentColor"
                  [strokeWidth]="1.5"
                  class="inline"
                />
                <span>{{ t('delete') }}</span>
              </app-button>
            </div>
            <app-select
              [options]="statusOptions"
              [value]="task.status"
              [clearable]="false"
              [placeholder]="t('status')"
              (selectChange)="onStatusChange($event)"
              cssClass="w-full sm:w-36"
            />
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
  readonly showAssigneeBadge = input(false);
  readonly showEditButton = input(false);

  readonly edit = output<TaskModel>();
  readonly toggled = output<TaskModel>();
  readonly deleted = output<TaskModel>();
  readonly statusChanged = output<{ task: TaskModel; status: TaskStatus }>();

  readonly icons = { AddCircleIcon, Edit01Icon, Delete01Icon };

  readonly #languageService = inject(LanguageService);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #router = inject(Router);

  readonly isPhone = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  getProjectName(projectId: number): string {
    return this.projects().find((p) => p.id === projectId)?.name ?? '';
  }

  getStatusLabel(status: string): string {
    if (status === 'in-progress') return 'inProgress';
    return status;
  }

  navigateToDetail(): void {
    const task = this.task();
    if (task) {
      this.#router.navigate(['/task-details', task.id]);
    }
  }

  readonly statusOptions: SelectOption[] = [
    { value: 'pending', label: this.#languageService.translate('pending') },
    {
      value: 'in-progress',
      label: this.#languageService.translate('inProgress'),
    },
    { value: 'done', label: this.#languageService.translate('done') },
  ];

  onStatusChange(newStatus: number | string | null): void {
    const task = this.task();
    if (!task || !newStatus || newStatus === task.status) return;
    this.statusChanged.emit({ task, status: newStatus as TaskStatus });
  }

  confirmDelete(): void {
    const result$ = this.isPhone()
      ? this.#bottomSheet.open(ConfirmBottomSheetComponent).afterDismissed()
      : this.#dialog.open(ConfirmDialogComponent).afterClosed();

    result$.subscribe((confirmed) => {
      if (!confirmed) return;
      const task = this.task();
      if (!task) return;
      this.deleted.emit(task);
    });
  }
}
