import { Component, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../dashboard/services/dashboard';
import { LanguageService } from '../../../shared/services/language';
import { TaskItemComponent } from '../../../shared/components/task-item';
import { TaskFormComponent, ButtonComponent } from '../../../shared/components';
import { TaskFormService } from '../../../shared/forms/task';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [RouterLink, TaskItemComponent, TaskFormComponent, ButtonComponent],
  template: `
    <main class="mx-auto max-w-2xl p-6">
      <div class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
        <div class="flex items-center justify-between mb-6">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {{ t('taskDetails') }}
          </h1>
          <button appButton variant="secondary" type="button" routerLink="/">
            {{ t('backToDashboard') }}
          </button>
        </div>

        @if (loading()) {
          <p class="text-slate-500 dark:text-slate-400">{{ t('loading') }}</p>
        } @else if (error()) {
          <p class="text-red-600 dark:text-red-400">{{ t('taskNotFound') }}</p>
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
      </div>
    </main>
  `,
})
export class TaskDetailsPageComponent {
  readonly #route = inject(ActivatedRoute);
  readonly #router = inject(Router);
  readonly #dashboardService = inject(DashboardService);
  readonly #languageService = inject(LanguageService);
  readonly #taskForm = inject(TaskFormService);

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

    effect(() => {
      const task = this.editingTask();
      if (task) {
        this.#taskForm.patchForEdit(
          task.title,
          task.projectId,
          task.description,
        );
      }
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
