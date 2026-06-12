import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
import { LLMProvider, CascadeLLMProvider } from '../../llm';
import { executeCharacterTick, shouldConvertToNPC } from './character-tick';
import { wsServer } from '../../api/websocket';

const TICK_CHECK_INTERVAL = 30000;
const LLM_RETRY_CHECK_INTERVAL = 60 * 60 * 1000;
const MAX_TICKS_PER_CYCLE = parseInt(process.env.MAX_TICKS_PER_CYCLE || '10', 10);

export interface SchedulerMetrics {
  totalTicks: number;
  totalErrors: number;
  avgTickTimeMs: number;
  llmCalls: { gemini: number; cerebras: number; mock: number };
  lastCycleAt: Date | null;
  retryAttempts: number;
  retrySuccesses: number;
  retryFailures: number;
}

export class WorldTickScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private retryIntervalId: NodeJS.Timeout | null = null;
  private running = false;
  private metrics: SchedulerMetrics = {
    totalTicks: 0,
    totalErrors: 0,
    avgTickTimeMs: 0,
    llmCalls: { gemini: 0, cerebras: 0, mock: 0 },
    lastCycleAt: null,
    retryAttempts: 0,
    retrySuccesses: 0,
    retryFailures: 0,
  };

  constructor(
    private db: DBAdapter,
    private queue: QueueAdapter,
    private llm: LLMProvider
  ) {}

  getMetrics(): SchedulerMetrics {
    return { ...this.metrics };
  }

  start() {
    if (this.intervalId) return;
    console.log(`[Scheduler] World Tick Scheduler started (interval: ${TICK_CHECK_INTERVAL}ms, max ticks: ${MAX_TICKS_PER_CYCLE})`);

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

    this.startLlmRetryChecker();
    this.processTicks();
  }

  private startLlmRetryChecker() {
    this.retryIntervalId = setInterval(() => {
      if (this.llm instanceof CascadeLLMProvider) {
        this.llm.resetToGemini();
        this.llm.resetToCerebras();
      }
    }, LLM_RETRY_CHECK_INTERVAL);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Scheduler] World Tick Scheduler stopped');
    }
    if (this.retryIntervalId) {
      clearInterval(this.retryIntervalId);
      this.retryIntervalId = null;
    }
  }

  private async processTicks() {
    const characters = await this.db.character.getAllActive();
    const now = Date.now();
    let processed = 0;
    let npcConverted = 0;
    let cycleStart = Date.now();
    let tickTimes: number[] = [];

    for (const character of characters) {
      if (processed >= MAX_TICKS_PER_CYCLE) {
        console.log(`[Scheduler] Rate limit reached (${MAX_TICKS_PER_CYCLE} ticks/cycle), deferring remaining characters`);
        break;
      }

      if (shouldConvertToNPC(character)) {
        await this.convertToNpc(character.id);
        npcConverted++;
        console.log(`[Scheduler] ${character.name} converted to NPC mode`);
        continue;
      }

      const nextTickTime = character.nextTickAt.getTime();
      if (nextTickTime > now) continue;

      const tickStart = Date.now();
      try {
        const result = await executeCharacterTick(character, this.db, this.queue, this.llm);
        const tickTime = Date.now() - tickStart;
        tickTimes.push(tickTime);

        if (result) {
          processed++;
          this.metrics.totalTicks++;
          console.log(`[Scheduler] Tick processed for ${character.name} → ${result.chosenTask.task.name} (${tickTime}ms)`);

          if (this.llm instanceof CascadeLLMProvider) {
            const provider = (this.llm as any).activeProvider;
            if (provider === 'gemini') this.metrics.llmCalls.gemini++;
            else if (provider === 'cerebras') this.metrics.llmCalls.cerebras++;
            else this.metrics.llmCalls.mock++;
          }
        }
      } catch (error) {
        this.metrics.totalErrors++;
        console.error(`[Scheduler] Error ticking character ${character.id}:`, error);
        this.metrics.retryAttempts++;
        try {
          await executeCharacterTick(character, this.db, this.queue, this.llm);
          this.metrics.retrySuccesses++;
          console.log(`[Scheduler] Retry succeeded for character ${character.id}`);
        } catch (retryError) {
          this.metrics.retryFailures++;
          console.error(`[Scheduler] Retry failed for character ${character.id}:`, retryError);
        }
      }
    }

    if (tickTimes.length > 0) {
      const avgTime = tickTimes.reduce((a, b) => a + b, 0) / tickTimes.length;
      this.metrics.avgTickTimeMs = Math.round(avgTime);
    }
    this.metrics.lastCycleAt = new Date();

    if (processed > 0) {
      console.log(`[Scheduler] Processed ${processed} tick(s) in ${Date.now() - cycleStart}ms`);
    }
    if (npcConverted > 0) {
      console.log(`[Scheduler] Converted ${npcConverted} character(s) to NPC mode`);
    }
  }

  private async convertToNpc(characterId: string) {
    const character = await this.db.character.getById(characterId);
    if (!character) return;
    await this.db.character.update(characterId, {
      isNpc: true,
      nextTickAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });
    wsServer.broadcastToCharacter(characterId, {
      type: 'npc_conversion',
      data: {
        characterId: character.id,
        characterName: character.name,
        reason: 'player_absence_48h',
        convertedAt: new Date().toISOString(),
      },
    });
  }
}
