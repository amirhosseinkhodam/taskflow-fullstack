export interface TaskModel {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly projectId: number;
  readonly position: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}
