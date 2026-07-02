import type { TaskStatus } from './task';

export interface HealthResponse {
  status: string;
}

export interface CreateProjectRequest {
  name: string;
}

export interface CreateTaskRequest {
  title: string;
  description: string;
  projectId: number;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  status?: TaskStatus;
}
