import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
import { LLMProvider } from '../../llm';
import { executeCharacterTick } from './character-tick';

const TICK_CHECK_INTERVAL = 30000;

export class WorldTickScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private running = false;

  constructor(
    private db: DBAdapter,
    private queue: QueueAdapter,
    private llm: LLMProvider
  ) {}

  start() {
    if (this.intervalId) return;
    console.log(`[Scheduler] World Tick Scheduler started (interval: ${TICK_CHECK_INTERVAL}ms)`);

    this.intervalId = setInterval(async () => {
      if (this.running) return;
      this.running = true;

      try {
        await this.processTicks();
      } catch (error) {
        console.error('[Scheduler] Error processing ticks:', error);
      } finally {
        this.running = false;
      }
    }, TICK_CHECK_INTERVAL);

    this.processTicks();
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Scheduler] World Tick Scheduler stopped');
    }
  }

  private async processTicks() {
    const characters = await this.db.character.getAllActive();
    const now = Date.now();
    let processed = 0;

    for (const character of characters) {
      const nextTickTime = character.nextTickAt.getTime();
      if (nextTickTime > now) continue;

      try {
        const result = await executeCharacterTick(character, this.db, this.queue, this.llm);
        if (result) {
          processed++;
          console.log(`[Scheduler] Tick processed for ${character.name} → ${result.chosenTask.task.name}`);
        }
      } catch (error) {
        console.error(`[Scheduler] Error ticking character ${character.id}:`, error);
      }
    }

    if (processed > 0) {
      console.log(`[Scheduler] Processed ${processed} tick(s)`);
    }
  }
}
