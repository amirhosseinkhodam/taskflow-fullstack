import { Injectable, inject } from '@angular/core';
import { ApiService } from '@core/services/api';
import type { TaskStatus } from '../../../shared/models/task';
import type {
  TaskModel,
  TaskFilterModel,
  PaginatedResponseModel,
} from '@shared/types/task';
import type { ProjectModel } from '@shared/types/project';
import type {
  CreateTaskRequestModel,
  UpdateProjectRequestModel,
  UpdateTaskRequestModel,
} from '../../../shared/models/api';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  readonly #api = inject(ApiService);

  getTask(id: number) {
    return this.#api.get<TaskModel>(`/tasks/${id}`);
  }

  getProjects() {
    return this.#api.get<ProjectModel[]>('/projects');
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
    return this.#api.get<PaginatedResponseModel<TaskModel>>(
      `/tasks${query ? '?' + query : ''}`,
    );
  }

  createProject(name: string) {
    return this.#api.post<ProjectModel>('/projects', { name });
  }

  updateProject(id: number, value: UpdateProjectRequestModel) {
    return this.#api.put<ProjectModel>(`/projects/${id}`, value);
  }

  deleteProject(id: number) {
    return this.#api.delete<boolean>(`/projects/${id}`);
  }

  createTask(value: CreateTaskRequestModel) {
    return this.#api.post<TaskModel>('/tasks', value);
  }

  updateTask(id: number, value: UpdateTaskRequestModel) {
    return this.#api.put<TaskModel>(`/tasks/${id}`, value);
  }

  updateTaskStatus(id: number, status: TaskStatus) {
    return this.updateTask(id, { status });
  }

  reorderTasks(taskIds: number[]) {
    return this.#api.patch<void>('/tasks/reorder', { taskIds });
  }

  deleteTask(id: number) {
    return this.#api.delete<void>(`/tasks/${id}`);
  }
}
