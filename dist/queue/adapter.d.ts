export type JobType = 'world_tick' | 'character_tick';
export interface JobData {
    characterId?: string;
}
export interface QueueAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    enqueueCharacterTick(characterId: string, delayMs?: number): Promise<void>;
    enqueueWorldTick(): Promise<void>;
    scheduleNextTick(characterId: string, nextTickAt: Date): Promise<void>;
    cancelPendingTicks(characterId: string): Promise<void>;
}
//# sourceMappingURL=adapter.d.ts.map