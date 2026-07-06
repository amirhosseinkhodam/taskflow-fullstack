import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { TaskStatus } from '../../../shared/models/task';
import type { TaskModel } from '@shared/types/task';
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

  getTasks(projectId?: number) {
    const query = projectId ? `?projectId=${projectId}` : '';
    return this.#http.get<TaskModel[]>(`${this.#apiBaseUrl}/tasks${query}`);
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
