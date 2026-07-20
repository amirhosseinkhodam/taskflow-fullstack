import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import type { CommentModel } from '@shared/types/task';

@Injectable()
export class CommentService {
  readonly #db: Pool;
  constructor(@Inject('DATABASE') db: Pool) {
    this.#db = db;
  }

  async create(
    taskId: number,
    userId: number,
    content: string,
  ): Promise<CommentModel> {
    const taskCheck = await this.#db.query<{ id: number }>(
      `SELECT id FROM tasks WHERE id = $1`,
      [taskId],
    );
    if (taskCheck.rows.length === 0) {
      throw new NotFoundException('Task not found');
    }

    const result = await this.#db.query<CommentModel>(
      `INSERT INTO task_comments ("taskId", "userId", content)
       VALUES ($1, $2, $3)
       RETURNING id, "taskId", "userId", content, "createdAt", "updatedAt"`,
      [taskId, userId, content],
    );

    const comment = result.rows[0];
    if (!comment) {
      throw new Error('Comment creation failed');
    }

    // Fetch with user name
    const userResult = await this.#db.query<{
      name: string;
      firstName: string | null;
      lastName: string | null;
    }>(`SELECT name, "firstName", "lastName" FROM users WHERE id = $1`, [
      userId,
    ]);
    const user = userResult.rows[0];
    const userName =
      user?.name ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ');

    return {
      ...comment,
      userName,
    };
  }

  async findByTask(taskId: number): Promise<CommentModel[]> {
    const result = await this.#db.query<
      CommentModel & {
        name: string;
        firstName: string | null;
        lastName: string | null;
      }
    >(
      `SELECT c.id, c."taskId", c."userId", c.content, c."createdAt", c."updatedAt",
              u.name, u."firstName", u."lastName"
       FROM task_comments c
       LEFT JOIN users u ON c."userId" = u.id
       WHERE c."taskId" = $1
       ORDER BY c."createdAt" ASC`,
      [taskId],
    );

    return result.rows.map((row) => ({
      id: row.id,
      taskId: row.taskId,
      userId: row.userId,
      userName:
        row.name ?? [row.firstName, row.lastName].filter(Boolean).join(' '),
      content: row.content,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));
  }

  async update(
    id: number,
    requesterId: number,
    requesterRole: string,
    content: string,
  ): Promise<CommentModel> {
    const commentResult = await this.#db.query<{
      id: number;
      userId: number;
      taskId: number;
    }>(`SELECT id, "userId", "taskId" FROM task_comments WHERE id = $1`, [id]);
    const comment = commentResult.rows[0];
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user can edit: comment author OR task assignee OR admin
    const isAdmin = requesterRole === 'admin' || requesterRole === 'superAdmin';
    const isAuthor = comment.userId === requesterId;

    // Check if requester is task assignee
    const taskResult = await this.#db.query<{ assigneeId: number | null }>(
      `SELECT "assigneeId" FROM tasks WHERE id = $1`,
      [comment.taskId],
    );
    const isAssignee = taskResult.rows[0]?.assigneeId === requesterId;

    if (!isAdmin && !isAuthor && !isAssignee) {
      throw new ForbiddenException(
        'You can only edit your own comments or comments on tasks assigned to you',
      );
    }

    const result = await this.#db.query<CommentModel>(
      `UPDATE task_comments SET content = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2
       RETURNING id, "taskId", "userId", content, "createdAt", "updatedAt"`,
      [content, id],
    );

    const updatedComment = result.rows[0];
    if (!updatedComment) {
      throw new NotFoundException('Comment not found after update');
    }

    // Fetch user name
    const userResult = await this.#db.query<{
      name: string;
      firstName: string | null;
      lastName: string | null;
    }>(`SELECT name, "firstName", "lastName" FROM users WHERE id = $1`, [
      comment.userId,
    ]);
    const user = userResult.rows[0];
    const userName =
      user?.name ?? [user?.firstName, user?.lastName].filter(Boolean).join(' ');

    return {
      ...updatedComment,
      userName,
    };
  }

  async delete(
    id: number,
    requesterId: number,
    requesterRole: string,
  ): Promise<boolean> {
    const commentResult = await this.#db.query<{
      id: number;
      userId: number;
      taskId: number;
    }>(`SELECT id, "userId", "taskId" FROM task_comments WHERE id = $1`, [id]);
    const comment = commentResult.rows[0];
    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    // Check if user can delete: comment author OR task assignee OR admin
    const isAdmin = requesterRole === 'admin' || requesterRole === 'superAdmin';
    const isAuthor = comment.userId === requesterId;

    const taskResult = await this.#db.query<{ assigneeId: number | null }>(
      `SELECT "assigneeId" FROM tasks WHERE id = $1`,
      [comment.taskId],
    );
    const isAssignee = taskResult.rows[0]?.assigneeId === requesterId;

    if (!isAdmin && !isAuthor && !isAssignee) {
      throw new ForbiddenException(
        'You can only delete your own comments or comments on tasks assigned to you',
      );
    }

    const result = await this.#db.query(
      `DELETE FROM task_comments WHERE id = $1`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
