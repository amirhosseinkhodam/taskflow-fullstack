import { Component, inject, OnInit, signal } from '@angular/core';
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
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog';
import { ConfirmBottomSheetComponent } from '../../../shared/components/confirm-bottom-sheet';
import { ThemeToggleComponent } from '../../../shared/components/theme-toggle';
import { LanguageToggleComponent } from '../../../shared/components/language-toggle';
import { LanguageService } from '../../../shared/services/language';
import type { TaskModel } from '@shared/types/task';

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
          <form
            class="rounded-2xl bg-white dark:bg-slate-800 p-6 shadow"
            (ngSubmit)="createProject()"
          >
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {{ t('projects') }}
            </h2>
            <div class="mt-4 flex gap-2">
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
            </div>
          </form>

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
export class DashboardComponent implements OnInit {
  readonly store = inject(DashboardStore);
  readonly taskForm = inject(TaskFormService);
  readonly auth = inject(AuthStore);
  readonly #router = inject(Router);
  readonly #breakpointObserver = inject(BreakpointObserver);
  readonly #dialog = inject(MatDialog);
  readonly #bottomSheet = inject(MatBottomSheet);
  readonly #languageService = inject(LanguageService);

  projectName = signal('');
  isPhone = signal(false);

  constructor() {
    this.#breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  ngOnInit(): void {
    this.store.loadAll();
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
}
