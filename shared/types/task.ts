export interface TaskModel {
  readonly id: number;
  readonly title: string;
  readonly description: string;
  readonly status: string;
  readonly projectId: number;
  readonly position: number;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly userId: number;
  readonly creatorName?: string;
  readonly assigneeId: number | null;
  readonly assigneeName: string | null;
  readonly assigneeEmail?: string | null;
}

export interface CommentModel {
  readonly id: number;
  readonly taskId: number;
  readonly userId: number;
  readonly userName: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TaskFilterModel {
  readonly projectId?: number;
  readonly status?: string;
  readonly searchTerm?: string;
  readonly page?: number;
  readonly limit?: number;
}

export interface PaginatedResponseModel<T> {
  readonly data: T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly totalPages: number;
}
