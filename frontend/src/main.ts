import { HttpClient, provideHttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

type TaskStatus = 'pending' | 'done';

interface Project {
  id: number;
  name: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  projectId: number;
}

interface CreateProjectRequest {
  name: string;
}

interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: number;
}

interface UpdateTaskRequest {
  status: TaskStatus;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './app/app.component.html',
})
class AppComponent implements OnInit {
  private readonly http = inject(HttpClient);

  projects = signal<Project[]>([]);
  tasks = signal<Task[]>([]);
  projectName = '';
  taskTitle = '';
  taskDescription = '';
  selectedProjectId = 0;
  message = '';

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.http.get<Project[]>('/api/projects').subscribe({
      next: (projects) => {
        this.projects.set(projects);
        if (!this.selectedProjectId && projects[0]) {
          this.selectedProjectId = projects[0].id;
        }
        this.loadTasks();
      },
      error: () => (this.message = 'Could not load projects. Is the API running?'),
    });
  }

  loadTasks(): void {
    const query = this.selectedProjectId ? `?projectId=${this.selectedProjectId}` : '';
    this.http.get<Task[]>(`/api/tasks${query}`).subscribe({
      next: (tasks) => this.tasks.set(tasks),
      error: () => (this.message = 'Could not load tasks.'),
    });
  }

  createProject(): void {
    const name = this.projectName.trim();
    if (!name) return;

    const projectRequest: CreateProjectRequest = { name };

    this.http.post<Project>('/api/projects', projectRequest).subscribe({
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

    const taskRequest: CreateTaskRequest = {
      title,
      description: this.taskDescription,
      projectId: this.selectedProjectId,
    };

    this.http.post<Task>('/api/tasks', taskRequest).subscribe({
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
    const taskRequest: UpdateTaskRequest = { status };

    this.http.put<Task>(`/api/tasks/${task.id}`, taskRequest).subscribe({
      next: () => this.loadTasks(),
      error: () => (this.message = 'Could not update task.'),
    });
  }

  deleteTask(task: Task): void {
    this.http.delete<void>(`/api/tasks/${task.id}`).subscribe({
      next: () => this.loadTasks(),
      error: () => (this.message = 'Could not delete task.'),
    });
  }
}

bootstrapApplication(AppComponent, {
  providers: [provideHttpClient()],
}).catch((error) => console.error(error));
