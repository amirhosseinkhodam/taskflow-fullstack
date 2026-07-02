import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BreakpointObserver } from '@angular/cdk/layout';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { MatDialog } from '@angular/material/dialog';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ApiService } from './api.service';
import type { ProjectModel } from '@shared/types/project.model';
import type { TaskModel } from '@shared/types/task.model';
import { AuthService } from './auth.service';
import { ConfirmDialogComponent } from './confirm-dialog.component';
import { ConfirmBottomSheetComponent } from './confirm-bottom-sheet.component';
import { ThemeToggleComponent } from './theme-toggle.component';
import { LanguageToggleComponent } from './language-toggle.component';
import { LanguageService } from './language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule, DragDropModule, ThemeToggleComponent, LanguageToggleComponent, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly dialog = inject(MatDialog);
  private readonly bottomSheet = inject(MatBottomSheet);
  private readonly languageService = inject(LanguageService);

  projects = signal<ProjectModel[]>([]);
  tasks = signal<TaskModel[]>([]);
  healthStatus = signal('checking');
  isPhone = signal(false);
  projectName = '';
  taskTitle = '';
  taskDescription = '';
  selectedProjectId = 0;
  editingTaskId: number | null = null;
  message = '';

  constructor() {
    this.breakpointObserver
      .observe(['(max-width: 767px)'])
      .subscribe((result) => this.isPhone.set(result.matches));
  }

  ngOnInit(): void {
    this.loadHealth();
    this.loadAll();
  }

  t(key: string): string {
    return this.languageService.translate(key);
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  loadHealth(): void {
    this.api.getHealth().subscribe({
      next: (health) => this.healthStatus.set(health.status),
      error: () => this.healthStatus.set('offline'),
    });
  }

  loadAll(): void {
    this.api.getProjects().subscribe({
      next: (projects) => {
        this.projects.set(projects);
        if (!this.selectedProjectId && projects[0]) {
          this.selectedProjectId = projects[0].id;
        }
        this.loadTasks();
      },
      error: () =>
        (this.message = this.t('couldNotLoadProjects')),
    });
  }

  loadTasks(): void {
    this.api.getTasks(this.selectedProjectId || undefined).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => (this.message = this.t('couldNotLoadTasks')),
    });
  }

  createProject(): void {
    const name = this.projectName.trim();
    if (!name) return;

    this.api.createProject(name).subscribe({
      next: (project) => {
        this.projectName = '';
        this.selectedProjectId = project.id;
        this.message = this.t('projectCreated');
        this.loadAll();
      },
      error: () => (this.message = this.t('couldNotCreateProject')),
    });
  }

  editTask(task: TaskModel): void {
    this.editingTaskId = task.id;
    this.taskTitle = task.title;
    this.taskDescription = task.description;
  }

  cancelEdit(): void {
    this.editingTaskId = null;
    this.taskTitle = '';
    this.taskDescription = '';
  }

  saveTask(): void {
    const title = this.taskTitle.trim();
    if (!title || !this.selectedProjectId) return;

    if (this.editingTaskId) {
      this.api
        .updateTask(this.editingTaskId, title, this.taskDescription)
        .subscribe({
          next: () => {
            this.cancelEdit();
            this.message = this.t('taskUpdated');
            this.loadTasks();
          },
          error: () => (this.message = this.t('couldNotUpdateTask')),
        });
    } else {
      this.api
        .createTask(title, this.taskDescription, this.selectedProjectId)
        .subscribe({
          next: () => {
            this.taskTitle = '';
            this.taskDescription = '';
            this.message = this.t('taskCreated');
            this.loadTasks();
          },
          error: () => (this.message = this.t('couldNotCreateTask')),
        });
    }
  }

  onDrop(event: CdkDragDrop<TaskModel[]>): void {
    const current = this.tasks();
    moveItemInArray(current, event.previousIndex, event.currentIndex);
    this.tasks.set(current);

    this.api
      .reorderTasks(current.map((t) => t.id))
      .subscribe({ error: () => this.loadTasks() });
  }

  toggleTask(task: TaskModel): void {
    const status = task.status === 'done' ? 'pending' : 'done';

    this.api.updateTaskStatus(task.id, status).subscribe({
      next: () => this.loadTasks(),
      error: () => (this.message = this.t('couldNotUpdateTask')),
    });
  }

  deleteTask(task: TaskModel): void {
    const confirmed$ = this.isPhone()
      ? this.bottomSheet.open(ConfirmBottomSheetComponent).afterDismissed()
      : this.dialog.open(ConfirmDialogComponent).afterClosed();

    confirmed$.subscribe((confirmed) => {
      if (!confirmed) return;

      this.api.deleteTask(task.id).subscribe({
        next: () => this.loadTasks(),
        error: () => (this.message = this.t('couldNotDeleteTask')),
      });
    });
  }
}
