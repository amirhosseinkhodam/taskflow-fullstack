import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { TaskModel } from './task.model';

@Injectable()
export class TaskService {
  constructor(@Inject('DATABASE') private db: Pool) {}

  async create(
    title: string,
    description: string,
    projectId: number,
  ): Promise<TaskModel> {
    const result = await this.db.query<{ id: number }>(
      `INSERT INTO tasks (title, description, "projectId")
       VALUES ($1, $2, $3)
       RETURNING id`,
      [title, description, projectId],
    );
    const id = result.rows[0]?.id;

    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task creation failed');
    }

    return task;
  }

  async findAll(projectId?: number): Promise<TaskModel[]> {
    let query = `SELECT id, title, description, status, "projectId", "createdAt", "updatedAt" FROM tasks`;
    const params: (string | number)[] = [];

    if (projectId !== undefined) {
      query += ` WHERE "projectId" = $1`;
      params.push(projectId);
    }

    query += ` ORDER BY id`;

    const result = await this.db.query<TaskModel>(query, params);
    return result.rows;
  }

  async findOne(id: number): Promise<TaskModel | null> {
    const result = await this.db.query<TaskModel>(
      `SELECT id, title, description, status, "projectId", "createdAt", "updatedAt"
       FROM tasks
       WHERE id = $1`,
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

    const result = await this.db.query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = $${params.length}`,
      params,
    );

    return (result.rowCount ?? 0) > 0;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db.query(`DELETE FROM tasks WHERE id = $1`, [id]);
    return (result.rowCount ?? 0) > 0;
  }

  async deleteByProject(projectId: number): Promise<void> {
    await this.db.query(`DELETE FROM tasks WHERE "projectId" = $1`, [
      projectId,
    ]);
  }
}
