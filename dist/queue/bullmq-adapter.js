"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BullMQAdapter = void 0;
const bullmq_1 = require("bullmq");
const CHARACTER_TICK_QUEUE = 'character-tick';
const WORLD_TICK_QUEUE = 'world-tick';
const CONCURRENCY = parseInt(process.env.BULLMQ_CONCURRENCY || '5', 10);
const MAX_RETRIES = parseInt(process.env.BULLMQ_MAX_RETRIES || '3', 10);
const BACKOFF_DELAY = parseInt(process.env.BULLMQ_BACKOFF_DELAY || '5000', 10);
class BullMQAdapter {
    characterTickQueue;
    worldTickQueue;
    worker = null;
    queueEvents = null;
    constructor(redisUrl) {
        const connection = {
            url: redisUrl,
        };
        this.characterTickQueue = new bullmq_1.Queue(CHARACTER_TICK_QUEUE, { connection });
        this.worldTickQueue = new bullmq_1.Queue(WORLD_TICK_QUEUE, { connection });
    }
    async connect() {
        await this.characterTickQueue.waitUntilReady();
        await this.worldTickQueue.waitUntilReady();
        console.log(`[Queue] BullMQ adapter connected (concurrency: ${CONCURRENCY}, max retries: ${MAX_RETRIES})`);
    }
    async disconnect() {
        await this.characterTickQueue.close();
        await this.worldTickQueue.close();
        if (this.worker) {
            await this.worker.close();
        }
        if (this.queueEvents) {
            await this.queueEvents.close();
        }
        console.log('[Queue] BullMQ adapter disconnected');
    }
    async healthCheck() {
        try {
            await this.characterTickQueue.getJobCounts();
            return true;
        }
        catch {
            return false;
        }
    }
    async enqueueCharacterTick(characterId, delayMs) {
        await this.characterTickQueue.add('character_tick', { characterId }, {
            delay: delayMs,
            removeOnComplete: true,
            removeOnFail: false,
            attempts: MAX_RETRIES,
            backoff: {
                type: 'exponential',
                delay: BACKOFF_DELAY,
            },
        });
    }
    async enqueueWorldTick() {
        await this.worldTickQueue.add('world_tick', {}, {
            removeOnComplete: true,
            removeOnFail: false,
        });
    }
    async scheduleNextTick(characterId, nextTickAt) {
        const delay = nextTickAt.getTime() - Date.now();
        await this.enqueueCharacterTick(characterId, Math.max(0, delay));
    }
    async cancelPendingTicks(characterId) {
        const jobs = await this.characterTickQueue.getJobs(['delayed', 'waiting']);
        for (const job of jobs) {
            if (job.data?.characterId === characterId) {
                await job.remove();
            }
        }
    }
    async getQueueStats() {
        const counts = await this.characterTickQueue.getJobCounts();
        return {
            waiting: counts.waiting,
            active: counts.active,
            delayed: counts.delayed,
            failed: counts.failed,
        };
    }
    createWorker(processFn) {
        this.worker = new bullmq_1.Worker(CHARACTER_TICK_QUEUE, async (job) => {
            await processFn(job);
        }, {
            connection: { url: this.characterTickQueue.opts.connection },
            concurrency: CONCURRENCY,
        });
        this.queueEvents = new bullmq_1.QueueEvents(CHARACTER_TICK_QUEUE, {
            connection: { url: this.characterTickQueue.opts.connection },
        });
        this.worker.on('completed', (job) => {
            console.log(`[Queue] Job ${job.id} completed`);
        });
        this.worker.on('failed', (job, err) => {
            console.error(`[Queue] Job ${job?.id} failed after ${job?.opts?.attempts} attempts:`, err.message);
        });
        return this.worker;
    }
}
exports.BullMQAdapter = BullMQAdapter;
//# sourceMappingURL=bullmq-adapter.js.map