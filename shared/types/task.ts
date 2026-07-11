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
