import type { TaskStatus } from './task';

export interface HealthResponseModel {
  readonly status: string;
}

export interface CreateProjectRequestModel {
  readonly name: string;
}

export interface CreateTaskRequestModel {
  readonly title: string;
  readonly description: string;
  readonly projectId: number;
  readonly assigneeEmail?: string;
}

export interface UpdateProjectRequestModel {
  readonly name: string;
}

export interface UpdateTaskRequestModel {
  readonly title?: string;
  readonly description?: string;
  readonly status?: TaskStatus;
  readonly assigneeEmail?: string;
}
