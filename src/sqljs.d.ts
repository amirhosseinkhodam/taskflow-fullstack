import { ProjectModel } from './shared/models/projects/project.model';

declare module 'sql.js' {
  export interface DatabaseModel {
    run(sql: string, params?: unknown[]): void;
    exec(sql: string): Array<{
      columns: string[];
      values: ProjectModel[][];
    }>;
    export(): Uint8Array;
  }

  export interface SqlJsStatic {
    Database(data?: Uint8Array): Database;
  }

  export default function initSqlJs(): Promise<SqlJsStatic>;
}
