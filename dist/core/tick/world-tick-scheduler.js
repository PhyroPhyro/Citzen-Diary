"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldTickScheduler = void 0;
const llm_1 = require("../../llm");
const character_tick_1 = require("./character-tick");
const TICK_CHECK_INTERVAL = 30000;
const LLM_RETRY_CHECK_INTERVAL = 60 * 60 * 1000;
const MAX_TICKS_PER_CYCLE = parseInt(process.env.MAX_TICKS_PER_CYCLE || '10', 10);
class WorldTickScheduler {
    db;
    queue;
    llm;
    intervalId = null;
    retryIntervalId = null;
    running = false;
    metrics = {
        totalTicks: 0,
        totalErrors: 0,
        avgTickTimeMs: 0,
        llmCalls: { gemini: 0, cerebras: 0, mock: 0 },
        lastCycleAt: null,
    };
    constructor(db, queue, llm) {
        this.db = db;
        this.queue = queue;
        this.llm = llm;
    }
    getMetrics() {
        return { ...this.metrics };
    }
    start() {
        if (this.intervalId)
            return;
        console.log(`[Scheduler] World Tick Scheduler started (interval: ${TICK_CHECK_INTERVAL}ms, max ticks: ${MAX_TICKS_PER_CYCLE})`);
        this.intervalId = setInterval(async () => {
            if (this.running)
                return;
            this.running = true;
            try {
                await this.processTicks();
            }
            catch (error) {
                console.error('[Scheduler] Error processing ticks:', error);
            }
            finally {
                this.running = false;
            }
        }, TICK_CHECK_INTERVAL);
        this.startLlmRetryChecker();
        this.processTicks();
    }
    startLlmRetryChecker() {
        this.retryIntervalId = setInterval(() => {
            if (this.llm instanceof llm_1.CascadeLLMProvider) {
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
    async processTicks() {
        const characters = await this.db.character.getAllActive();
        const now = Date.now();
        let processed = 0;
        let npcConverted = 0;
        let cycleStart = Date.now();
        let tickTimes = [];
        for (const character of characters) {
            if (processed >= MAX_TICKS_PER_CYCLE) {
                console.log(`[Scheduler] Rate limit reached (${MAX_TICKS_PER_CYCLE} ticks/cycle), deferring remaining characters`);
                break;
            }
            if ((0, character_tick_1.shouldConvertToNPC)(character)) {
                await this.convertToNpc(character.id);
                npcConverted++;
                console.log(`[Scheduler] ${character.name} converted to NPC mode`);
                continue;
            }
            const nextTickTime = character.nextTickAt.getTime();
            if (nextTickTime > now)
                continue;
            const tickStart = Date.now();
            try {
                const result = await (0, character_tick_1.executeCharacterTick)(character, this.db, this.queue, this.llm);
                const tickTime = Date.now() - tickStart;
                tickTimes.push(tickTime);
                if (result) {
                    processed++;
                    this.metrics.totalTicks++;
                    console.log(`[Scheduler] Tick processed for ${character.name} → ${result.chosenTask.task.name} (${tickTime}ms)`);
                    if (this.llm instanceof llm_1.CascadeLLMProvider) {
                        const provider = this.llm.activeProvider;
                        if (provider === 'gemini')
                            this.metrics.llmCalls.gemini++;
                        else if (provider === 'cerebras')
                            this.metrics.llmCalls.cerebras++;
                        else
                            this.metrics.llmCalls.mock++;
                    }
                }
            }
            catch (error) {
                this.metrics.totalErrors++;
                console.error(`[Scheduler] Error ticking character ${character.id}:`, error);
                try {
                    await (0, character_tick_1.executeCharacterTick)(character, this.db, this.queue, this.llm);
                    console.log(`[Scheduler] Retry succeeded for character ${character.id}`);
                }
                catch (retryError) {
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
    async convertToNpc(characterId) {
        await this.db.character.update(characterId, {
            isNpc: true,
            nextTickAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        });
    }
}
exports.WorldTickScheduler = WorldTickScheduler;
//# sourceMappingURL=world-tick-scheduler.js.map