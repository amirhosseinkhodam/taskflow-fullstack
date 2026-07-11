import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { DashboardStore } from '../store/dashboard';
import { AuthStore } from '../../auth/store/auth';
import { TaskFormComponent } from '../../../shared/components/task-form';
import { TaskListComponent } from '../components/task-list';
import { StatusFilterComponent } from '../components/status-filter';
import { SearchInputComponent } from '../components/search-input';
import { ProjectListComponent } from '../components/project-list';
import { ProjectEditDialogComponent } from '../components/project-edit-dialog';
import { ProjectDeleteConfirmComponent } from '../components/project-delete-confirm';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { LanguageService } from '../../../shared/services/language';
import { DashboardService } from '../services/dashboard';
import type { ProjectModel } from '@shared/types/project';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [DashboardStore],
  imports: [
    ThemeToggleComponent,
    LanguageToggleComponent,
    TaskFormComponent,
    TaskListComponent,
    StatusFilterComponent,
    SearchInputComponent,
    ProjectListComponent,
    RouterLink,
  ],
  template: `
    <main class="mx-auto max-w-4xl p-6">
      <section class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-slate-100">
              TaskFlow
            </h1>
            <p class="mt-2 text-slate-600 dark:text-slate-400">
              {{ t('createProjectAddTasks') }}
            </p>
          </div>
          <div class="flex items-center gap-2 flex-wrap justify-end">
            <app-theme-toggle></app-theme-toggle>
            <app-language-toggle></app-language-toggle>
            @if (isAdmin()) {
              <button
                class="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 h-9 px-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                type="button"
                routerLink="/admin"
              >
                {{ t('adminPanel') }}
              </button>
            }
            <button
              class="inline-flex items-center rounded-lg border border-slate-300 dark:border-slate-600 h-9 px-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
              type="button"
              (click)="logout()"
            >
              {{ t('logout') }}
            </button>
          </div>
        </div>

        <p
          class="mt-4 rounded-lg bg-slate-100 dark:bg-slate-700 px-4 py-2 text-sm text-slate-700 dark:text-slate-300"
        >
          {{ t('apiHealth') }}: {{ store.healthStatus() }}
        </p>

        @if (store.message()) {
          <p
            class="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 px-4 py-2 text-sm text-blue-700 dark:text-blue-300"
          >
            {{ t(store.message()) }}
          </p>
        }
      </section>

      @if (isAdmin()) {
        <section
          class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch"
        >
          <div
            class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow flex flex-col h-96 overflow-auto"
          >
            <div class="flex-1 flex flex-col min-h-0">
              <app-project-list
                [projects]="store.projects()"
                (create)="store.createProject($event)"
                (edit)="openEditProject($event)"
                (delete)="confirmDeleteProject($event)"
              />
            </div>
          </div>

          <section
            class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow h-96"
          >
            <app-task-form
              [projects]="store.projects()"
              [editingTask]="store.editingTask()"
              [selectedProjectId]="store.selectedProjectId()"
              (submitTask)="store.saveTask($event)"
              (cancelEdit)="store.cancelEdit()"
              (projectChange)="store.setSelectedProjectId($event)"
            />
          </section>
        </section>
      } @else {
        <section class="mt-6 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
          <app-task-form
            [projects]="store.projects()"
            [editingTask]="store.editingTask()"
            [selectedProjectId]="store.selectedProjectId()"
            (submitTask)="store.saveTask($event)"
            (cancelEdit)="store.cancelEdit()"
            (projectChange)="store.setSelectedProjectId($event)"
          />
        </section>
      }

      <section class="mt-6 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
        <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {{ t('tasks') }}
          </h2>
          <div class="flex items-center gap-3">
            <app-status-filter
              [activeStatus]="store.filter().status ?? 'all'"
              (statusChange)="onStatusFilter($event)"
            />
            <app-search-input
              [searchTerm]="store.filter().searchTerm ?? ''"
              (searchChange)="onSearchChange($event)"
            />
          </div>
        </div>
        <app-task-list
          [tasks]="store.tasks()"
          [projects]="store.projects()"
          (reorder)="onReorder($event)"
          (editTask)="store.startEdit($event)"
          (refresh)="store.loadTasks()"
        />
      </section>
    </main>
  `,
})
export class DashboardComponent {
  readonly store = inject(DashboardStore);
  readonly auth = inject(AuthStore);
  readonly #router = inject(Router);
  readonly #dialog = inject(MatDialog);
  readonly #languageService = inject(LanguageService);
  readonly #dashboardService = inject(DashboardService);

  t(key: string): string {
    return this.#languageService.translate(key);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  logout(): void {
    this.auth.logout();
    this.#router.navigate(['/login']);
  }

  onReorder(event: { previousIndex: number; currentIndex: number }): void {
    const current = this.store.tasks();
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.store.reorderTasks(current);
  }

  onStatusFilter(status: string): void {
    const current = this.store.filter();
    this.store.setFilter({ ...current, status });
  }

  onSearchChange(searchTerm: string): void {
    const current = this.store.filter();
    this.store.setFilter({ ...current, searchTerm });
  }

  openEditProject(project: ProjectModel): void {
    this.store.startEditProject(project);
    const dialogRef = this.#dialog.open(ProjectEditDialogComponent, {
      data: { name: project.name },
      width: '400px',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        this.store.cancelEditProject();
        return;
      }
      this.store.updateProject(result);
    });
  }

  confirmDeleteProject(project: ProjectModel): void {
    this.#dashboardService
      .getTasks({ projectId: project.id })
      .subscribe((tasks) => {
        const undoneCount = tasks.filter((t) => t.status !== 'done').length;

        const dialogRef = this.#dialog.open(ProjectDeleteConfirmComponent, {
          data: { undoneCount },
          width: '400px',
        });

        dialogRef.afterClosed().subscribe((confirmed) => {
          if (!confirmed) return;
          this.store.deleteProject(project);
        });
      });
  }
}
