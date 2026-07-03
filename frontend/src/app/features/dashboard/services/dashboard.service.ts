import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { TaskStatus } from '../../../shared/models/task';
import type { TaskModel } from '@shared/types/task.model';
import type { ProjectModel } from '@shared/types/project.model';
import type {
  HealthResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
} from '../../../shared/models/api';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getHealth() {
    return this.#http.get<HealthResponse>(`${this.#apiBaseUrl}/api/health`);
  }

  getProjects() {
    return this.#http.get<ProjectModel[]>(`${this.#apiBaseUrl}/projects`);
  }

  getTasks(projectId?: number) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.#http.get<TaskModel[]>(`${this.#apiBaseUrl}/tasks${query}`);
  }

  createProject(name: string) {
    return this.#http.post<ProjectModel>(`${this.#apiBaseUrl}/projects`, {
      name,
    });
  }

  createTask(title: string, description: string, projectId: number) {
    const taskRequest: CreateTaskRequest = { title, description, projectId };
    return this.#http.post<TaskModel>(`${this.#apiBaseUrl}/tasks`, taskRequest);
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
    return this.#http.put<TaskModel>(
      `${this.#apiBaseUrl}/tasks/${id}`,
      taskRequest,
    );
  }

  updateTaskStatus(id: number, status: TaskStatus) {
    return this.updateTask(id, undefined, undefined, status);
  }

  reorderTasks(taskIds: number[]) {
    return this.#http.patch<void>(`${this.#apiBaseUrl}/tasks/reorder`, {
      taskIds,
    });
  }

  deleteTask(id: number) {
    return this.#http.delete<void>(`${this.#apiBaseUrl}/tasks/${id}`);
  }
}
