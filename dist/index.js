"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./api/app");
const db_1 = require("./db");
const queue_1 = require("./queue");
const llm_1 = require("./llm");
const world_tick_scheduler_1 = require("./core/tick/world-tick-scheduler");
async function checkPostgreSQL() {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl)
        return false;
    try {
        const { Pool } = await Promise.resolve().then(() => __importStar(require('pg')));
        const pool = new Pool({ connectionString: dbUrl, connectionTimeoutMillis: 5000 });
        await pool.query('SELECT 1');
        await pool.end();
        return true;
    }
    catch {
        return false;
    }
}
async function checkRedis() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl)
        return false;
    try {
        const Redis = require('ioredis');
        const redis = new Redis(redisUrl, { connectTimeout: 5000, maxRetriesPerRequest: 1 });
        await redis.ping();
        await redis.quit();
        return true;
    }
    catch {
        return false;
    }
}
async function bootstrap() {
    console.log('[Bootstrap] Starting Citizen Diary server...');
    console.log('[Bootstrap] Checking PostgreSQL...');
    const pgOk = await checkPostgreSQL();
    if (pgOk) {
        console.log('[Bootstrap] PostgreSQL is reachable');
    }
    else {
        console.warn('[Bootstrap] PostgreSQL is NOT reachable or DATABASE_URL not set');
    }
    console.log('[Bootstrap] Checking Redis...');
    const redisOk = await checkRedis();
    if (redisOk) {
        console.log('[Bootstrap] Redis is reachable');
    }
    else {
        console.warn('[Bootstrap] Redis is NOT reachable or REDIS_URL not set');
    }
    const db = (0, db_1.createDBAdapter)();
    const queue = (0, queue_1.createQueueAdapter)();
    const llm = (0, llm_1.createLLMProvider)();
    try {
        await db.connect();
    }
    catch (error) {
        console.error('[Bootstrap] Failed to connect to database:', error);
        if (!pgOk) {
            console.error('[Bootstrap] Make sure PostgreSQL is running and DATABASE_URL is correct in .env');
        }
        process.exit(1);
    }
    try {
        await queue.connect();
    }
    catch (error) {
        console.error('[Bootstrap] Failed to connect to queue:', error);
        if (!redisOk) {
            console.error('[Bootstrap] Make sure Redis is running and REDIS_URL is correct in .env');
        }
        process.exit(1);
    }
    const scheduler = new world_tick_scheduler_1.WorldTickScheduler(db, queue, llm);
    scheduler.start();
    const app = (0, app_1.setupAPI)({ db, queue, llm });
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
//# sourceMappingURL=index.js.map