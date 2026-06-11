import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
import { LLMProvider } from '../../llm';
export declare class WorldTickScheduler {
    private db;
    private queue;
    private llm;
    private intervalId;
    private running;
    constructor(db: DBAdapter, queue: QueueAdapter, llm: LLMProvider);
    start(): void;
    stop(): void;
    private processTicks;
}
//# sourceMappingURL=world-tick-scheduler.d.ts.map