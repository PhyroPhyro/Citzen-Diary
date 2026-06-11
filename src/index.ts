import { setupAPI } from './api/app';
import { createDBAdapter, PostgreSQLAdapter } from './db';
import { createQueueAdapter, BullMQAdapter } from './queue';
import { createLLMProvider } from './llm';
import { WorldTickScheduler } from './core/tick/world-tick-scheduler';

async function checkPostgreSQL(): Promise<boolean> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;

  try {
    const { Pool } = await import('pg');
    const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
    await pool.query('SELECT 1');
    await pool.end();
    return true;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) return false;

  try {
    const Redis = require('ioredis');
    const redis = new Redis(redisUrl, { connectTimeout: 5000, maxRetriesPerRequest: 1 });
    await redis.ping();
    await redis.quit();
    return true;
  } catch {
    return false;
  }
}

async function bootstrap() {
  console.log('[Bootstrap] Starting Citizen Diary server...');

  console.log('[Bootstrap] Checking PostgreSQL...');
  const pgOk = await checkPostgreSQL();
  if (pgOk) {
    console.log('[Bootstrap] PostgreSQL is reachable');
  } else {
    console.warn('[Bootstrap] PostgreSQL is NOT reachable or DATABASE_URL not set');
  }

  console.log('[Bootstrap] Checking Redis...');
  const redisOk = await checkRedis();
  if (redisOk) {
    console.log('[Bootstrap] Redis is reachable');
  } else {
    console.warn('[Bootstrap] Redis is NOT reachable or REDIS_URL not set');
  }

  const db = createDBAdapter();
  const queue = createQueueAdapter();
  const llm = createLLMProvider();

  try {
    await db.connect();
  } catch (error) {
    console.error('[Bootstrap] Failed to connect to database:', error);
    if (!pgOk) {
      console.error('[Bootstrap] Make sure PostgreSQL is running and DATABASE_URL is correct in .env');
    }
    process.exit(1);
  }

  try {
    await queue.connect();
  } catch (error) {
    console.error('[Bootstrap] Failed to connect to queue:', error);
    if (!redisOk) {
      console.error('[Bootstrap] Make sure Redis is running and REDIS_URL is correct in .env');
    }
    process.exit(1);
  }

  const scheduler = new WorldTickScheduler(db, queue, llm);
  scheduler.start();

  const app = setupAPI({ db, queue, llm });

  const PORT = process.env.PORT || 3000;

  const server = app.listen(PORT, () => {
    console.log(`[Server] Listening on port ${PORT}`);
    console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    console.log(`[Server] API docs: http://localhost:${PORT}/docs`);
  });

  process.on('SIGINT', async () => {
    console.log('[Server] Shutting down...');
    server.close();
    scheduler.stop();
    await queue.disconnect();
    await db.disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('[Server] Shutting down...');
    server.close();
    scheduler.stop();
    await queue.disconnect();
    await db.disconnect();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('[Bootstrap] Failed to start:', error);
  process.exit(1);
});
