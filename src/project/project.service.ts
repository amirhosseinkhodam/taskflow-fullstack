import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import { Database } from 'sql.js';
import { TaskService } from '../task/task.service';
import { ProjectModel } from './project.model';

@Injectable()
export class ProjectService implements OnModuleInit {
  private db: Database | null = null;
  private DB_PATH = path.resolve(process.cwd(), 'database.sqlite');

  constructor(
    @Inject('DATABASE') private readonly dbInstance: Database,
    private readonly taskService: TaskService,
  ) {}

  async onModuleInit() {
    if (this.dbInstance) {
      this.db = this.dbInstance;
      this.db.run(`
        CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL
        )
      `);
      this.save();
      console.log('Database is ready and projects table ensured.');
    } else {
      console.error('Database instance not provided!');
    }
  }

  private save() {
    if (!this.db) return;
    try {
      const data = this.db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(this.DB_PATH, buffer);
    } catch (error) {
      console.error('Error saving database:', error);
    }
  }

  findAll(): ProjectModel[] {
    if (!this.db) return [];

    const result = this.db.exec('SELECT * FROM projects');
    if (!result.length || !result[0] || !result[0].values.length) {
      return [];
    }

    const rows = result[0].values;
    return rows.map((row) => ({
      id: row[0] as number,
      name: row[1] as string,
    }));
  }

  create(name: string): ProjectModel {
    if (!this.db) {
      throw new Error('Database is not initialized');
    }

    const stmt = this.db.prepare(`INSERT INTO projects (name) VALUES (?)`);
    stmt.run([name]);
    stmt.free();

    const result = this.db.exec(`SELECT last_insert_rowid() AS lastId`);
    const lastId =
      result.length > 0 && result[0].values.length > 0
        ? (result[0].values[0][0] as number)
        : null;

    if (lastId !== null) {
      this.save();
      return { id: lastId, name };
    } else {
      throw new Error('Failed to retrieve last inserted ID');
    }
  }
}
