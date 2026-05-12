import { Injectable, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import initSqlJs, { DatabaseModel, SqlJsStatic } from 'sql.js';
import { ProjectModel } from 'src/shared/models/projects/project.model';

@Injectable()
export class ProjectService implements OnModuleInit {
  private db: DatabaseModel | null = null;
  private DB_PATH = 'database.sqlite';

  async onModuleInit() {
    const SQL: SqlJsStatic = await initSqlJs();
    let dbData: Uint8Array | undefined;
    if (fs.existsSync(this.DB_PATH)) {
      const buffer = fs.readFileSync(this.DB_PATH);
      dbData = new Uint8Array(buffer);
    }
    this.db = new SQL.Database(dbData)
    ;
    this.db.run(
      `CREATE TABLE IF NOT EXISTS projects(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)`,
    );
    this.save();
    console.log('db is ready');
  }

  private save() {
    const data: any = this.db?.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(this.DB_PATH, buffer);
  }

  findAll(): ProjectModel[] {
    const result = this.db?.exec('SELECT * FROM projects');
    if (!result || result.length === 0) return [];
    const rows = result[0].values;
    return rows.map((row) => ({
      id: row[0] as number,
      name: row[1] as string,
    }));
  }

  create(name: string): ProjectModel {
    this.db.run('INSERT INTO projects(name) VALUES (?)', [name]);
    this.save();
    const result = this.db.exec('SELECT last_insert_row()');
    const id = result[0].values[0][0];
    return { id, name };
  }
}
