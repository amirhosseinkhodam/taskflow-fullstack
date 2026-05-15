import { Inject, Injectable } from '@nestjs/common';
import { Database } from 'sql.js';
import { TaskModel } from './task.model';

@Injectable()
export class TaskService {
  constructor(@Inject('DATABASE') private db: Database) {
    this.createTable();
  }

  private createTable(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        projectId INTEGER NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (projectId) REFERENCES projects(id)
      )
    `);
  }

  async create(
    title: string,
    description: string,
    projectId: number,
  ): Promise<TaskModel> {
    const stmt = this.db.prepare(
      `INSERT INTO tasks (title, description, projectId) VALUES (?, ?, ?)`,
    );

    stmt.run([title, description, projectId]);
    stmt.free();

    const result = this.db.exec(`SELECT last_insert_rowid() AS id`);
    const id = result[0]?.values[0]?.[0] as number;

    const task = await this.findOne(id);
    if (!task) {
      throw new Error('Task creation failed');
    }

    return task;
  }

  async findAll(projectId?: number): Promise<TaskModel[]> {
    let query = `SELECT * FROM tasks`;
    const params: (string | number)[] = [];

    if (projectId !== undefined) {
      query += ` WHERE projectId = ?`;
      params.push(projectId);
    }

    const result =
      params.length > 0 ? this.db.exec(query, params) : this.db.exec(query);

    if (!result.length || !result[0]) {
      return [];
    }

    return result[0].values.map((row) =>
      this.mapRowToTask(result[0].columns, row),
    );
  }

  async findOne(id: number): Promise<TaskModel | null> {
    const result = this.db.exec(`SELECT * FROM tasks WHERE id = ?`, [id]);

    if (!result.length || !result[0] || !result[0].values.length) {
      return null;
    }

    return this.mapRowToTask(result[0].columns, result[0].values[0]);
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
      fields.push(`title = ?`);
      params.push(title);
    }

    if (description !== undefined) {
      fields.push(`description = ?`);
      params.push(description);
    }

    if (status !== undefined) {
      fields.push(`status = ?`);
      params.push(status);
    }

    if (projectId !== undefined) {
      fields.push(`projectId = ?`);
      params.push(projectId);
    }

    if (!fields.length) {
      return false;
    }

    fields.push(`updatedAt = CURRENT_TIMESTAMP`);
    params.push(id);

    const stmt = this.db.prepare(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?`,
    );
    stmt.run(params);
    const changed = stmt.getAsObject ? true : false;
    stmt.free();

    return changed;
  }

  async delete(id: number): Promise<boolean> {
    const stmt = this.db.prepare(`DELETE FROM tasks WHERE id = ?`);
    stmt.run([id]);
    stmt.free();
    return true;
  }

  private mapRowToTask(columns: string[], row: any[]): TaskModel {
    const task: any = {};

    columns.forEach((column, index) => {
      task[column] = row[index];
    });

    return task as TaskModel;
  }
}
