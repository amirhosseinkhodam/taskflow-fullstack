import initSqlJs from 'sql.js';

export const databaseProvider = {
  provide: 'DATABASE',
  useFactory: async () => {
    const SQL = await initSqlJs({});
    const db = new SQL.Database();
    return db;
  },
};
