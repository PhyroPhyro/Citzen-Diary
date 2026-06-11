import { QueueAdapter, JobData } from './adapter';

export class StubQueueAdapter implements QueueAdapter {
  async connect(): Promise<void> {
    console.log('[Queue] Stub adapter connected (Redis not yet configured)');
  }

  async disconnect(): Promise<void> {
    console.log('[Queue] Stub adapter disconnected');
  }

  async enqueueCharacterTick(characterId: string, delayMs?: number): Promise<void> {
    console.log(`[Queue] Stub: enqueue character_tick for ${characterId} (delay: ${delayMs}ms)`);
  }

  async enqueueWorldTick(): Promise<void> {
    console.log('[Queue] Stub: enqueue world_tick');
  }

  async scheduleNextTick(characterId: string, nextTickAt: Date): Promise<void> {
    const delay = nextTickAt.getTime() - Date.now();
    console.log(`[Queue] Stub: schedule next tick for ${characterId} at ${nextTickAt.toISOString()} (delay: ${delay}ms)`);
  }

  async cancelPendingTicks(characterId: string): Promise<void> {
    console.log(`[Queue] Stub: cancel pending ticks for ${characterId}`);
  }
}
