import { provideHttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { ApiService, Project, Task } from './app/api.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app/app.component.html',
})
class AppComponent implements OnInit {
  private readonly api = inject(ApiService);

  projects = signal<Project[]>([]);
  tasks = signal<Task[]>([]);
  healthStatus = signal('checking');
  projectName = '';
  taskTitle = '';
  taskDescription = '';
  selectedProjectId = 0;
  message = '';

  ngOnInit(): void {
    this.loadHealth();
    this.loadAll();
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

  createTask(): void {
    const title = this.taskTitle.trim();
    if (!title || !this.selectedProjectId) return;

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

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
}).catch((error) => console.error(error));
