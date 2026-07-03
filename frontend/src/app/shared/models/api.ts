import type { TaskStatus } from './task';

export interface HealthResponseModel {
  status: string;
}

export interface CreateProjectRequestModel {
  name: string;
}

export interface CreateTaskRequestModel {
  title: string;
  description: string;
  projectId: number;
}

export interface UpdateTaskRequestModel {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
