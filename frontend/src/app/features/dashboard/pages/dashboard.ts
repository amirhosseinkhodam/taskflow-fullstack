import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { DashboardStore } from '../store/dashboard';
import { TaskFormService } from '../forms/task';
import { AuthStore } from '../../auth/store/auth';
import { TaskFormComponent } from '../components/task-form';
import { TaskListComponent } from '../components/task-list';
import { ProjectEditDialogComponent } from '../components/project-edit-dialog';
import { ProjectDeleteConfirmComponent } from '../components/project-delete-confirm';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { ConfirmBottomSheetComponent } from '../../../shared/components/confirm-bottom-sheet';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { LanguageService } from '../../../shared/services/language';
import { JalaliDatePipe } from '../../../shared/pipes/jalali-date';
import { DashboardService } from '../services/dashboard';
import type { TaskModel } from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  providers: [DashboardStore],
  imports: [
    FormsModule,
    ThemeToggleComponent,
    LanguageToggleComponent,
    TaskFormComponent,
    TaskListComponent,
    RouterLink,
    JalaliDatePipe,
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
          <div class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {{ t('projects') }}
            </h2>
            <form class="mt-4 flex gap-2" (ngSubmit)="createProject()">
              <input
                class="min-w-0 flex-1 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                name="projectName"
                [placeholder]="t('newProjectName')"
                [(ngModel)]="projectName"
              />
              <button
                class="rounded-lg bg-slate-900 dark:bg-slate-600 px-4 py-2 text-white"
                type="submit"
              >
                {{ t('add') }}
              </button>
            </form>

            <ul class="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
              @for (project of store.projects(); track project.id) {
                <li
                  class="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  <div class="min-w-0">
                    <span
                      class="text-sm text-slate-700 dark:text-slate-300 truncate block"
                    >
                      {{ project.name }}
                    </span>
                    <div
                      class="flex flex-wrap gap-x-3 text-xs text-slate-400 dark:text-slate-500 mt-0.5"
                    >
                      <span
                        >{{ t('created') }}:
                        {{ project.createdAt | jalaliDate }}</span
                      >
                      @if (project.updatedAt !== project.createdAt) {
                        <span
                          >{{ t('modified') }}:
                          {{ project.updatedAt | jalaliDate }}</span
                        >
                      }
                    </div>
                  </div>
                  <div class="flex items-center gap-1 shrink-0 ms-2">
                    <button
                      class="rounded p-1 text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 transition-colors"
                      type="button"
                      [attr.aria-label]="t('edit')"
                      (click)="openEditProject(project)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
                        />
                      </svg>
                    </button>
                    <button
                      class="rounded p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 transition-colors"
                      type="button"
                      [attr.aria-label]="t('delete')"
                      (click)="confirmDeleteProject(project)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        class="w-4 h-4"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </li>
              } @empty {
                <li
                  class="py-4 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  {{ t('noProjectsYet') }}
                </li>
              }
            </ul>
          </div>

          <section class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
            <app-task-form
              [projects]="store.projects()"
              [form]="taskForm.form"
              (submitForm)="store.saveTask()"
              (cancelEdit)="store.cancelEdit()"
              (projectChange)="store.setSelectedProjectId($event)"
            />
          </section>
        </section>
      } @else {
        <section class="mt-6 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
          <app-task-form
            [projects]="store.projects()"
            [form]="taskForm.form"
            (submitForm)="store.saveTask()"
            (cancelEdit)="store.cancelEdit()"
            (projectChange)="store.setSelectedProjectId($event)"
          />
        </section>
      }

      <section class="mt-6 rounded-2xl bg-white dark:bg-slate-800 p-6 shadow">
        <app-task-list
          [tasks]="store.tasks()"
          [projects]="store.projects()"
          (reorder)="onReorder($event)"
          (editTask)="store.startEdit($event)"
          (toggleTask)="store.toggleTask($event)"
          (deleteTask)="confirmDelete($event)"
          (refresh)="store.loadTasks()"
        />
      </section>
    </main>
  `,
})
export class DashboardComponent {
  readonly store = inject(DashboardStore);
  readonly taskForm = inject(TaskFormService);
  readonly auth = inject(AuthStore);
  readonly #router = inject(Router);
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #languageService = inject(LanguageService);
  readonly #dashboardService = inject(DashboardService);

  projectName = signal('');
  isPhone = signal(false);

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

  createProject(): void {
    const name = this.projectName().trim();
    if (!name) return;
    this.store.createProject(name);
    this.projectName.set('');
  }

  onReorder(event: { previousIndex: number; currentIndex: number }): void {
    const current = this.store.tasks();
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.store.reorderTasks(current);
  }

  confirmDelete(task: TaskModel): void {
    const confirmed$ = this.isPhone()
      ? this.#bottomSheet.open(ConfirmBottomSheetComponent).afterDismissed()
      : this.#dialog.open(ConfirmDialogComponent).afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;
      this.store.deleteTask(task);
    });
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
    this.#dashboardService.getTasks(project.id).subscribe((tasks) => {
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
