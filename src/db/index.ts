import { DBAdapter } from './adapter';
import { StubDBAdapter } from './stub-adapter';
import { PostgreSQLAdapter } from './pg-adapter';

export function createDBAdapter(): DBAdapter {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl) {
    return new PostgreSQLAdapter(dbUrl);
  }
  console.log('[DB] No DATABASE_URL found, using stub adapter');
  return new StubDBAdapter();
}

export * from './adapter';
export * from './stub-adapter';
export * from './pg-adapter';
