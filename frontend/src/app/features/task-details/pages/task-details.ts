import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../dashboard/services/dashboard';
import { LanguageService } from '../../../shared/services/language';
import { TaskItemComponent } from '../../../shared/components/task-item';
import {
  TaskFormComponent,
  CardComponent,
  PageHeaderComponent,
} from '../../../shared/components';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    TaskItemComponent,
    TaskFormComponent,
    CardComponent,
    PageHeaderComponent,
  ],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900">
      <app-page-header [title]="t('taskDetails')" />

      <main class="mx-auto max-w-2xl p-6">
        <app-card>
          @if (loading()) {
            <p
              class="rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-3 text-sm text-slate-700 dark:text-slate-300"
            >
              {{ t('loading') }}
            </p>
          } @else if (error()) {
            <p
              class="rounded-lg bg-red-50 dark:bg-red-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-300"
            >
              {{ t('taskNotFound') }}
            </p>
          } @else {
            @if (task(); as task) {
              @if (isEditing()) {
                <app-task-form
                  [projects]="projects()"
                  [editingTask]="editingTask()"
                  [showProjectSelect]="false"
                  (submitTask)="saveTask($event)"
                  (cancelEdit)="cancelEdit()"
                />
              } @else {
                <app-task-item
                  [task]="task"
                  [projects]="projects()"
                  [showDetailLink]="false"
                  [showCreatorBadge]="true"
                  [showEditButton]="true"
                  (edit)="startEdit($event)"
                  (toggled)="onToggled($event)"
                  (deleted)="onDeleted()"
                />
              }
            }
          }
        </app-card>
      </main>
    </div>
  `,
})
export class TaskDetailsPageComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #dashboardService = inject(DashboardService);
  readonly #languageService = inject(LanguageService);

  readonly task = signal<TaskModel | null>(null);
  readonly projects = signal<ProjectModel[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly isEditing = signal(false);
  readonly editingTask = signal<TaskModel | null>(null);

  readonly #taskId: number;

  constructor() {
    this.#taskId = Number(this.#route.snapshot.paramMap.get('id'));
    if (!this.#taskId) {
      this.#router.navigate(['/']);
      return;
    }

    this.#dashboardService
      .getProjects()
      .pipe(
        switchMap((projects) => {
          this.projects.set(projects);
          return this.#dashboardService.getTask(this.#taskId);
        }),
      )
      .subscribe({
        next: (task) => {
          this.task.set(task);
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        },
      });
  }

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  startEdit(task: TaskModel): void {
    this.editingTask.set(task);
    this.isEditing.set(true);
  }

  saveTask(value: {
    title: string;
    description: string;
    projectId: number;
  }): void {
    const task = this.task();
    if (!task) return;

    if (!value.title?.trim()) return;

    this.#dashboardService
      .updateTask(task.id, {
        title: value.title,
        description: value.description,
      })
      .subscribe({
        next: () => {
          this.#dashboardService.getTask(this.#taskId).subscribe({
            next: (updated) => this.task.set(updated),
          });
          this.editingTask.set(null);
          this.isEditing.set(false);
        },
      });
  }

  cancelEdit(): void {
    this.editingTask.set(null);
    this.isEditing.set(false);
  }

  onToggled(updated: TaskModel): void {
    this.task.set(updated);
  }

  onDeleted(): void {
    this.#router.navigate(['/']);
  }
}
