"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorldTickScheduler = void 0;
const character_tick_1 = require("./character-tick");
const TICK_CHECK_INTERVAL = 30000;
class WorldTickScheduler {
    db;
    queue;
    llm;
    intervalId = null;
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
        this.processTicks();
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            console.log('[Scheduler] World Tick Scheduler stopped');
        }
    }
    async processTicks() {
        const characters = await this.db.character.getAllActive();
        const now = Date.now();
        let processed = 0;
        for (const character of characters) {
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
    }
}
exports.WorldTickScheduler = WorldTickScheduler;
//# sourceMappingURL=world-tick-scheduler.js.map