import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { TaskStatus } from '../../../shared/models/task';
import type {
  TaskModel,
  TaskFilterModel,
  PaginatedResponseModel,
} from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';
import type {
  HealthResponseModel,
  CreateTaskRequestModel,
  UpdateProjectRequestModel,
  UpdateTaskRequestModel,
} from '../../../shared/models/api';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly #http = inject(HttpClient);
  readonly #apiBaseUrl = 'http://localhost:3000';

  getHealth() {
    return this.#http.get<HealthResponseModel>(
      `${this.#apiBaseUrl}/api/health`,
    );
  }

  getTask(id: number) {
    return this.#http.get<TaskModel>(`${this.#apiBaseUrl}/tasks/${id}`);
  }

  getProjects() {
    return this.#http.get<ProjectModel[]>(`${this.#apiBaseUrl}/projects`);
  }

  getTasks(filters?: TaskFilterModel) {
    const params = new URLSearchParams();
    if (filters?.projectId) params.set('projectId', String(filters.projectId));
    if (filters?.status && filters.status !== 'all')
      params.set('status', filters.status);
    if (filters?.searchTerm) params.set('search', filters.searchTerm);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const query = params.toString();
    return this.#http.get<PaginatedResponseModel<TaskModel>>(
      `${this.#apiBaseUrl}/tasks${query ? '?' + query : ''}`,
    );
  }

  createProject(name: string) {
    return this.#http.post<ProjectModel>(`${this.#apiBaseUrl}/projects`, {
      name,
    });
  }

  updateProject(id: number, value: UpdateProjectRequestModel) {
    return this.#http.put<ProjectModel>(
      `${this.#apiBaseUrl}/projects/${id}`,
      value,
    );
  }

  deleteProject(id: number) {
    return this.#http.delete<boolean>(`${this.#apiBaseUrl}/projects/${id}`);
  }

  createTask(value: CreateTaskRequestModel) {
    return this.#http.post<TaskModel>(`${this.#apiBaseUrl}/tasks`, value);
  }

  updateTask(id: number, value: UpdateTaskRequestModel) {
    return this.#http.put<TaskModel>(`${this.#apiBaseUrl}/tasks/${id}`, value);
  }

  updateTaskStatus(id: number, status: TaskStatus) {
    return this.updateTask(id, { status });
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
