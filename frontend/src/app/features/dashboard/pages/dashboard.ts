import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import {
  MatBottomSheet,
  MatBottomSheetModule,
} from '@angular/material/bottom-sheet';
import { DashboardStore } from '../store/dashboard';
import { AuthStore } from '../../auth/store/auth';
import {
  TaskFormComponent,
  ButtonComponent,
  CardComponent,
} from '../../../shared/components';
import { TaskListComponent } from '../components/task-list';
import { StatusFilterComponent } from '../components/status-filter';
import { SearchInputComponent } from '../components/search-input';
import { ProjectFilterComponent } from '../components/project-filter';
import { PaginationComponent } from '../components/pagination';
import { ProjectListComponent } from '../components/project-list';
import { ProjectEditDialogComponent } from '../components/project-edit-dialog';
import { ProjectEditBottomSheetComponent } from '../components/project-edit-bottom-sheet';
import { ProjectDeleteConfirmComponent } from '../components/project-delete-confirm';
import { ProjectDeleteConfirmBottomSheetComponent } from '../components/project-delete-confirm-bottom-sheet';
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
    ButtonComponent,
    CardComponent,
    TaskFormComponent,
    TaskListComponent,
    StatusFilterComponent,
    SearchInputComponent,
    ProjectFilterComponent,
    PaginationComponent,
    ProjectListComponent,
    MatBottomSheetModule,
  ],
  template: `
    <main class="mx-auto max-w-4xl p-6">
      <app-card variant="default">
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
            <app-button
              variant="secondary"
              type="button"
              (buttonClick)="goToProfile()"
            >
              {{ t('profile') }}
            </app-button>
            @if (isAdmin()) {
              <app-button
                variant="secondary"
                type="button"
                (buttonClick)="goToAdmin()"
              >
                {{ t('adminPanel') }}
              </app-button>
            }
            <app-button
              variant="secondary"
              type="button"
              (buttonClick)="logout()"
            >
              {{ t('logout') }}
            </app-button>
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
      </app-card>

      @if (isAdmin()) {
        <section
          class="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch"
        >
          <app-card
            variant="default"
            class="flex flex-col h-98 overflow-auto"
            padding="md"
          >
            <app-project-list
              class="flex-1 flex flex-col min-h-0"
              [projects]="store.projects()"
              (create)="store.createProject($event)"
              (edit)="openEditProject($event)"
              (delete)="confirmDeleteProject($event)"
            />
          </app-card>

          <app-card variant="default" class="flex flex-col h-98" padding="md">
            <app-task-form
              class="flex-1 flex flex-col"
              [projects]="store.projects()"
              [editingTask]="store.editingTask()"
              (submitTask)="store.saveTask($event)"
              (cancelEdit)="store.cancelEdit()"
            />
          </app-card>
        </section>
      } @else {
        <section class="mt-6 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
          <app-task-form
            [projects]="store.projects()"
            [editingTask]="store.editingTask()"
            (submitTask)="store.saveTask($event)"
            (cancelEdit)="store.cancelEdit()"
          />
        </section>
      }

      <section class="mt-6">
        <app-card variant="default">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {{ t('tasks') }}
            </h2>
            <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <div class="w-full sm:w-auto min-w-[212px]">
                <app-project-filter
                  [projects]="store.projects()"
                  [selectedProjectId]="store.filter().projectId ?? 0"
                  (projectChange)="onProjectFilter($event)"
                />
              </div>
              <div class="w-full sm:w-auto">
                <app-status-filter
                  [activeStatus]="store.filter().status ?? 'all'"
                  (statusChange)="onStatusFilter($event)"
                />
              </div>
              <div class="w-full sm:w-auto">
                <app-search-input
                  [searchTerm]="store.filter().searchTerm ?? ''"
                  (searchChange)="onSearchChange($event)"
                />
              </div>
            </div>
          </div>
          <app-task-list
            [tasks]="store.tasks()"
            [projects]="store.projects()"
            (reorder)="onReorder($event)"
            (editTask)="store.startEdit($event)"
            (refresh)="store.loadTasks()"
          />
          <app-pagination
            [currentPage]="store.page()"
            [totalPages]="store.totalPages()"
            (pageChange)="store.setPage($event)"
          />
        </app-card>
      </section>
    </main>
  `,
})
export class DashboardComponent {
  readonly store = inject(DashboardStore);
  readonly auth = inject(AuthStore);
  readonly #router = inject(Router);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #languageService = inject(LanguageService);
  readonly #dashboardService = inject(DashboardService);

  readonly isPhone = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

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

  goToAdmin(): void {
    this.#router.navigate(['/admin']);
  }

  goToProfile(): void {
    this.#router.navigate(['/profile']);
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

  onProjectFilter(projectId: number): void {
    const current = this.store.filter();
    this.store.setFilter({
      ...current,
      projectId: projectId || undefined,
    });
  }

  openEditProject(project: ProjectModel): void {
    this.store.startEditProject(project);
    const result$ = this.isPhone()
      ? this.#bottomSheet
          .open(ProjectEditBottomSheetComponent, {
            data: { name: project.name },
          })
          .afterDismissed()
      : this.#dialog
          .open(ProjectEditDialogComponent, {
            data: { name: project.name },
            width: '400px',
          })
          .afterClosed();

    result$.subscribe((result) => {
      if (!result) {
        this.store.cancelEditProject();
        return;
      }
      this.store.updateProject(result);
    });
  }

  confirmDeleteProject(project: ProjectModel): void {
    this.#dashboardService
      .getTasks({ projectId: project.id, limit: 1000 })
      .subscribe((response) => {
        const undoneCount = response.data.filter(
          (t) => t.status !== 'done',
        ).length;

        const result$ = this.isPhone()
          ? this.#bottomSheet
              .open(ProjectDeleteConfirmBottomSheetComponent, {
                data: { undoneCount },
              })
              .afterDismissed()
          : this.#dialog
              .open(ProjectDeleteConfirmComponent, {
                data: { undoneCount },
                width: '400px',
              })
              .afterClosed();

        result$.subscribe((confirmed) => {
          if (!confirmed) return;
          this.store.deleteProject(project);
        });
      });
  }
}
