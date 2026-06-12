import { Worker, Job } from 'bullmq';
import { QueueAdapter, JobData } from './adapter';
export declare class BullMQAdapter implements QueueAdapter {
    private characterTickQueue;
    private worldTickQueue;
    private worker;
    private queueEvents;
    constructor(redisUrl: string);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    enqueueCharacterTick(characterId: string, delayMs?: number): Promise<void>;
    enqueueWorldTick(): Promise<void>;
    scheduleNextTick(characterId: string, nextTickAt: Date): Promise<void>;
    cancelPendingTicks(characterId: string): Promise<void>;
    getQueueStats(): Promise<{
        waiting: number;
        active: number;
        delayed: number;
        failed: number;
    }>;
    createWorker(processFn: (job: Job<JobData>) => Promise<void>): Worker;
}
//# sourceMappingURL=bullmq-adapter.d.ts.map