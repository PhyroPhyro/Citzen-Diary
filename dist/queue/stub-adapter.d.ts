import { QueueAdapter } from './adapter';
export declare class StubQueueAdapter implements QueueAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    enqueueCharacterTick(characterId: string, delayMs?: number): Promise<void>;
    enqueueWorldTick(): Promise<void>;
    scheduleNextTick(characterId: string, nextTickAt: Date): Promise<void>;
    cancelPendingTicks(characterId: string): Promise<void>;
}
//# sourceMappingURL=stub-adapter.d.ts.map