import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { TaskStatus, Task } from '@models/task';
import type { Project } from '@models/project';
import type {
  HealthResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '@models/api';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:3000';

  getHealth() {
    return this.http.get<HealthResponse>(`${this.apiBaseUrl}/api/health`);
  }

  login(email: string, password: string) {
    return this.http.post<{
      token: string;
      user: { id: number; email: string; name: string };
    }>(`${this.apiBaseUrl}/auth/login`, { email, password });
  }

  register(email: string, password: string, name: string) {
    return this.http.post<{
      token: string;
      user: { id: number; email: string; name: string };
    }>(`${this.apiBaseUrl}/auth/register`, { email, password, name });
  }

  getProjects() {
    return this.http.get<Project[]>(`${this.apiBaseUrl}/projects`);
  }

  getTasks(projectId?: number) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.http.get<Task[]>(`${this.apiBaseUrl}/tasks${query}`);
  }

  createProject(name: string) {
    return this.http.post<Project>(
      `${this.apiBaseUrl}/projects`,
      { name },
    );
  }

  createTask(title: string, description: string, projectId: number) {
    const taskRequest: CreateTaskRequest = { title, description, projectId };
    return this.http.post<Task>(`${this.apiBaseUrl}/tasks`, taskRequest);
  }

  updateTask(
    id: number,
    title?: string,
    description?: string,
    status?: TaskStatus,
  ) {
    const taskRequest: UpdateTaskRequest = {};
    if (title !== undefined) taskRequest.title = title;
    if (description !== undefined) taskRequest.description = description;
    if (status !== undefined) taskRequest.status = status;
    return this.http.put<Task>(`${this.apiBaseUrl}/tasks/${id}`, taskRequest);
  }

  updateTaskStatus(id: number, status: TaskStatus) {
    return this.updateTask(id, undefined, undefined, status);
  }

  deleteTask(id: number) {
    return this.http.delete<void>(`${this.apiBaseUrl}/tasks/${id}`);
  }
}
