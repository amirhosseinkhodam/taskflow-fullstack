import { Inject, Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { TaskService } from '../task/task.service';
import { ProjectModel } from '@shared/types/project';

@Injectable()
export class ProjectService {
  readonly #db: Pool;
  readonly #taskService: TaskService;
  constructor(@Inject('DATABASE') db: Pool, taskService: TaskService) {
    this.#db = db;
    this.#taskService = taskService;
  }

  async findAll(): Promise<ProjectModel[]> {
    const result = await this.#db.query<ProjectModel>(
      'SELECT id, name, "createdAt", "updatedAt" FROM projects ORDER BY id',
    );
    return result.rows;
  }

  async findOne(id: number): Promise<ProjectModel | null> {
    const result = await this.#db.query<ProjectModel>(
      'SELECT id, name, "createdAt", "updatedAt" FROM projects WHERE id = $1',
      [id],
    );

    return result.rows[0] ?? null;
  }

  async create(name: string): Promise<ProjectModel> {
    const result = await this.#db.query<ProjectModel>(
      'INSERT INTO projects (name) VALUES ($1) RETURNING id, name, "createdAt", "updatedAt"',
      [name],
    );

    return result.rows[0];
  }

  async update(id: number, name?: string): Promise<ProjectModel | null> {
    if (name === undefined) {
      return null;
    }

    const result = await this.#db.query<ProjectModel>(
      'UPDATE projects SET name = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, name, "createdAt", "updatedAt"',
      [name, id],
    );

    return result.rows[0] ?? null;
  }

  async delete(id: number): Promise<boolean> {
    await this.#taskService.deleteByProject(id);
    const result = await this.#db.query('DELETE FROM projects WHERE id = $1', [
      id,
    ]);

    return (result.rowCount ?? 0) > 0;
  }
}
