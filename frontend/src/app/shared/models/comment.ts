export interface CommentModel {
  readonly id: number;
  readonly taskId: number;
  readonly userId: number;
  readonly userName: string;
  readonly content: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}
