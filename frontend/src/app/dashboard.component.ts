import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import type { Project } from '@models/project';
import type { Task } from '@models/task';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  projects = signal<Project[]>([]);
  tasks = signal<Task[]>([]);
  healthStatus = signal('checking');
  projectName = '';
  taskTitle = '';
  taskDescription = '';
  selectedProjectId = 0;
  editingTaskId: number | null = null;
  message = '';

  ngOnInit(): void {
    this.loadHealth();
    this.loadAll();
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
        (this.message = 'Could not load projects. Is the API running?'),
    });
  }

  loadTasks(): void {
    this.api.getTasks(this.selectedProjectId || undefined).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => (this.message = 'Could not load tasks.'),
    });
  }

  createProject(): void {
    const name = this.projectName.trim();
    if (!name) return;

    this.api.createProject(name).subscribe({
      next: (project) => {
        this.projectName = '';
        this.selectedProjectId = project.id;
        this.message = 'Project created.';
        this.loadAll();
      },
      error: () => (this.message = 'Could not create project.'),
    });
  }

  editTask(task: Task): void {
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
            this.message = 'Task updated.';
            this.loadTasks();
          },
          error: () => (this.message = 'Could not update task.'),
        });
    } else {
      this.api
        .createTask(title, this.taskDescription, this.selectedProjectId)
        .subscribe({
          next: () => {
            this.taskTitle = '';
            this.taskDescription = '';
            this.message = 'Task created.';
            this.loadTasks();
          },
          error: () => (this.message = 'Could not create task.'),
        });
    }
  }

  toggleTask(task: Task): void {
    const status = task.status === 'done' ? 'pending' : 'done';

    this.api.updateTaskStatus(task.id, status).subscribe({
      next: () => this.loadTasks(),
      error: () => (this.message = 'Could not update task.'),
    });
  }

  deleteTask(task: Task): void {
    this.api.deleteTask(task.id).subscribe({
      next: () => this.loadTasks(),
      error: () => (this.message = 'Could not delete task.'),
    });
  }
}
