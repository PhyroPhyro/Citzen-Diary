import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
import { LLMProvider } from '../../llm';
export interface SchedulerMetrics {
    totalTicks: number;
    totalErrors: number;
    avgTickTimeMs: number;
    llmCalls: {
        gemini: number;
        cerebras: number;
        mock: number;
    };
    lastCycleAt: Date | null;
}
export declare class WorldTickScheduler {
    private db;
    private queue;
    private llm;
    private intervalId;
    private retryIntervalId;
    private running;
    private metrics;
    constructor(db: DBAdapter, queue: QueueAdapter, llm: LLMProvider);
    getMetrics(): SchedulerMetrics;
    start(): void;
    private startLlmRetryChecker;
    stop(): void;
    private processTicks;
    private convertToNpc;
}
//# sourceMappingURL=world-tick-scheduler.d.ts.map