"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldTickScheduler = void 0;
const llm_1 = require("../../llm");
const character_tick_1 = require("./character-tick");
const TICK_CHECK_INTERVAL = 30000;
const LLM_RETRY_CHECK_INTERVAL = 60 * 60 * 1000;
class WorldTickScheduler {
    db;
    queue;
    llm;
    intervalId = null;
    retryIntervalId = null;
    running = false;
    constructor(db, queue, llm) {
        this.db = db;
        this.queue = queue;
        this.llm = llm;
    }
    start() {
        if (this.intervalId)
            return;
        console.log(`[Scheduler] World Tick Scheduler started (interval: ${TICK_CHECK_INTERVAL}ms)`);
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
        for (const character of characters) {
            if ((0, character_tick_1.shouldConvertToNPC)(character)) {
                await this.convertToNpc(character.id);
                npcConverted++;
                console.log(`[Scheduler] ${character.name} converted to NPC mode`);
                continue;
            }
            const nextTickTime = character.nextTickAt.getTime();
            if (nextTickTime > now)
                continue;
            try {
                const result = await (0, character_tick_1.executeCharacterTick)(character, this.db, this.queue, this.llm);
                if (result) {
                    processed++;
                    console.log(`[Scheduler] Tick processed for ${character.name} → ${result.chosenTask.task.name}`);
                }
            }
            catch (error) {
                console.error(`[Scheduler] Error ticking character ${character.id}:`, error);
            }
        }
        if (processed > 0) {
            console.log(`[Scheduler] Processed ${processed} tick(s)`);
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