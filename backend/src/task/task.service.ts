import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import type { TaskModel, PaginatedResponseModel } from '@shared/types/task';

@Injectable()
export class TaskService {
  readonly #db: Pool;
  constructor(@Inject('DATABASE') db: Pool) {
    this.#db = db;
  }

  readonly #taskColumns = `t.id, t.title, t.description, t.status, t."projectId", t."position", t."createdAt", t."updatedAt", t."userId", u.name as "creatorName"`;

  async create(
    title: string,
    description: string,
    projectId: number,
    userId: number,
  ): Promise<TaskModel> {
    const posResult = await this.#db.query<{ max: number | null }>(
      `SELECT MAX("position") as max FROM tasks WHERE "projectId" = $1`,
      [projectId],
    );
    const nextPos = (posResult.rows[0]?.max ?? -1) + 1;

    const result = await this.#db.query<{ id: number }>(
      `INSERT INTO tasks (title, description, "projectId", "position", "userId")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [title, description, projectId, nextPos, userId],
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
      `SELECT ${this.#taskColumns} FROM tasks t LEFT JOIN users u ON t."userId" = u.id${whereClause}
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
       WHERE t.id = $1`,
      [id],
    );

    return result.rows[0] ?? null;
  }

  async update(
    id: number,
    title?: string,
    description?: string,
    status?: string,
    projectId?: number,
  ): Promise<boolean> {
    const fields: string[] = [];
    const params: (string | number)[] = [];

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

  async reorder(taskIds: number[]): Promise<void> {
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

  async delete(id: number): Promise<boolean> {
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
