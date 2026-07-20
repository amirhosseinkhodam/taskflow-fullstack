import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Pool } from 'pg';
import type { TaskModel, PaginatedResponseModel } from '@shared/types/task';

@Injectable()
export class TaskService {
  readonly #db: Pool;
  constructor(@Inject('DATABASE') db: Pool) {
    this.#db = db;
  }

  readonly #taskColumns = `t.id, t.title, t.description, t.status, t."projectId", t."position", t."createdAt", t."updatedAt", t."userId", u.name as "creatorName", t."assigneeId", u2.name as "assigneeName"`;

  async create(
    title: string,
    description: string,
    projectId: number,
    userId: number,
    assigneeEmail?: string,
  ): Promise<TaskModel> {
    const projectCheck = await this.#db.query<{ id: number }>(
      `SELECT id FROM projects WHERE id = $1`,
      [projectId],
    );
    if (projectCheck.rows.length === 0) {
      throw new NotFoundException('Project not found');
    }

    let assigneeId: number | null = null;
    if (assigneeEmail) {
      const userCheck = await this.#db.query<{ id: number }>(
        `SELECT id FROM users WHERE email = $1`,
        [assigneeEmail],
      );
      if (userCheck.rows.length === 0) {
        throw new NotFoundException('Assignee not found');
      }
      assigneeId = userCheck.rows[0].id;
    }

    const posResult = await this.#db.query<{ max: number | null }>(
      `SELECT MAX("position") as max FROM tasks WHERE "projectId" = $1`,
      [projectId],
    );
    const nextPos = (posResult.rows[0]?.max ?? -1) + 1;

    const result = await this.#db.query<{ id: number }>(
      `INSERT INTO tasks (title, description, "projectId", "position", "userId", "assigneeId")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [title, description, projectId, nextPos, userId, assigneeId],
    );
    const id = result.rows[0]?.id;

    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task creation failed');
    }

    return task;
  }

  async findAll(filters: {
    projectId?: number;
    status?: string;
    searchTerm?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseModel<TaskModel>> {
    const conditions: string[] = [];
    const params: (string | number)[] = [];

    if (filters.projectId !== undefined) {
      params.push(filters.projectId);
      conditions.push(`t."projectId" = $${params.length}`);
    }
    if (filters.status && filters.status !== 'all') {
      params.push(filters.status);
      conditions.push(`t.status = $${params.length}`);
    }
    if (filters.searchTerm) {
      params.push(`%${filters.searchTerm}%`);
      conditions.push(
        `(t.title ILIKE $${params.length} OR t.description ILIKE $${params.length})`,
      );
    }

    const whereClause = conditions.length
      ? ` WHERE ${conditions.join(' AND ')}`
      : '';

    const countResult = await this.#db.query<{ count: string }>(
      `SELECT COUNT(*) as count FROM tasks t${whereClause}`,
      params,
    );
    const total = Number(countResult.rows[0]?.count ?? 0);

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.max(1, Math.min(100, filters.limit ?? 5));
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;

    const dataParams = [...params];
    dataParams.push(limit);
    dataParams.push(offset);

    const result = await this.#db.query<TaskModel>(
      `SELECT ${this.#taskColumns} FROM tasks t
       LEFT JOIN users u ON t."userId" = u.id
       LEFT JOIN users u2 ON t."assigneeId" = u2.id
       ${whereClause}
       ORDER BY t."position" ASC, t.id ASC
       LIMIT $${dataParams.length - 1} OFFSET $${dataParams.length}`,
      dataParams,
    );

    return {
      data: result.rows,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<TaskModel | null> {
    const result = await this.#db.query<TaskModel>(
      `SELECT ${this.#taskColumns}
       FROM tasks t
       LEFT JOIN users u ON t."userId" = u.id
       LEFT JOIN users u2 ON t."assigneeId" = u2.id
       WHERE t.id = $1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async update(
    id: number,
    requesterId: number,
    requesterRole: string,
    title?: string,
    description?: string,
    status?: string,
    projectId?: number,
    assigneeEmail?: string,
  ): Promise<boolean> {
    const taskResult = await this.#db.query<{
      id: number;
      userId: number;
      assigneeId: number | null;
    }>(`SELECT id, "userId", "assigneeId" FROM tasks WHERE id = $1`, [id]);
    const task = taskResult.rows[0];
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isAdmin = requesterRole === 'admin' || requesterRole === 'superAdmin';
    const isCreator = task.userId === requesterId;
    const isAssignee = task.assigneeId === requesterId;
    if (!isAdmin && !isCreator && !isAssignee) {
      throw new ForbiddenException(
        'You can only update your own tasks or tasks assigned to you',
      );
    }

    let assigneeId: number | null = task.assigneeId;
    if (assigneeEmail !== undefined) {
      if (!isAdmin) {
        throw new ForbiddenException('Only admins can reassign tasks');
      }
      if (assigneeEmail === '') {
        assigneeId = null;
      } else {
        const userCheck = await this.#db.query<{ id: number }>(
          `SELECT id FROM users WHERE email = $1`,
          [assigneeEmail],
        );
        if (userCheck.rows.length === 0) {
          throw new NotFoundException('Assignee not found');
        }
        assigneeId = userCheck.rows[0].id;
      }
    }

    if (projectId !== undefined && !isAdmin) {
      throw new ForbiddenException(
        'Only admins can move tasks between projects',
      );
    }

    if (projectId !== undefined) {
      const projectCheck = await this.#db.query<{ id: number }>(
        `SELECT id FROM projects WHERE id = $1`,
        [projectId],
      );
      if (projectCheck.rows.length === 0) {
        throw new NotFoundException('Target project not found');
      }
    }

    const fields: string[] = [];
    const params: (string | number | null)[] = [];

    if (title !== undefined) {
      params.push(title);
      fields.push(`title = $${params.length}`);
    }

    if (description !== undefined) {
      params.push(description);
      fields.push(`description = $${params.length}`);
    }

    if (status !== undefined) {
      params.push(status);
      fields.push(`status = $${params.length}`);
    }

    if (projectId !== undefined) {
      params.push(projectId);
      fields.push(`"projectId" = $${params.length}`);
    }

    if (assigneeEmail !== undefined) {
      params.push(assigneeId);
      fields.push(`"assigneeId" = $${params.length}`);
    }

    if (!fields.length) {
      return false;
    }

    fields.push(`"updatedAt" = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await this.#db.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${params.length}`,
      params,
    );

    return (result.rowCount ?? 0) > 0;
  }

  async reorder(
    taskIds: number[],
    requesterId: number,
    requesterRole: string,
  ): Promise<void> {
    if (taskIds.length === 0) {
      throw new BadRequestException('taskIds must not be empty');
    }

    const uniqueIds = [...new Set(taskIds)];
    if (uniqueIds.length !== taskIds.length) {
      throw new BadRequestException('taskIds must not contain duplicates');
    }

    const result = await this.#db.query<{
      id: number;
      projectId: number;
      userId: number | null;
      assigneeId: number | null;
    }>(
      `SELECT id, "projectId", "userId", "assigneeId" FROM tasks WHERE id = ANY($1)`,
      [uniqueIds],
    );

    if (result.rows.length !== uniqueIds.length) {
      throw new BadRequestException('One or more task IDs do not exist');
    }

    const projectIds = new Set(result.rows.map((r) => r.projectId));
    if (projectIds.size !== 1) {
      throw new BadRequestException(
        'All tasks must belong to the same project',
      );
    }

    const isAdmin = requesterRole === 'admin' || requesterRole === 'superAdmin';
    if (!isAdmin) {
      const unauthorizedTask = result.rows.find(
        (r) => r.userId !== requesterId && r.assigneeId !== requesterId,
      );
      if (unauthorizedTask) {
        throw new ForbiddenException(
          'You can only reorder your own tasks or tasks assigned to you',
        );
      }
    }

    const client = await this.#db.connect();
    try {
      await client.query('BEGIN');
      for (let i = 0; i < taskIds.length; i++) {
        await client.query(
          `UPDATE tasks SET "position" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2`,
          [i, taskIds[i]],
        );
      }
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async delete(
    id: number,
    requesterId: number,
    requesterRole: string,
  ): Promise<boolean> {
    const taskResult = await this.#db.query<{
      id: number;
      userId: number;
      assigneeId: number | null;
    }>(`SELECT id, "userId", "assigneeId" FROM tasks WHERE id = $1`, [id]);
    const task = taskResult.rows[0];
    if (!task) {
      throw new NotFoundException('Task not found');
    }

    const isAdmin = requesterRole === 'admin' || requesterRole === 'superAdmin';
    const isCreator = task.userId === requesterId;
    const isAssignee = task.assigneeId === requesterId;
    if (!isAdmin && !isCreator && !isAssignee) {
      throw new ForbiddenException(
        'You can only delete your own tasks or tasks assigned to you',
      );
    }

    const result = await this.#db.query(`DELETE FROM tasks WHERE id = $1`, [
      id,
    ]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByProject(projectId: number): Promise<void> {
    await this.#db.query(`DELETE FROM tasks WHERE "projectId" = $1`, [
      projectId,
    ]);
  }
}
