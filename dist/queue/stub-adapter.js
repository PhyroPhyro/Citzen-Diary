"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubQueueAdapter = void 0;
class StubQueueAdapter {
    async connect() {
        console.log('[Queue] Stub adapter connected (Redis not yet configured)');
    }
    async disconnect() {
        console.log('[Queue] Stub adapter disconnected');
    }
    async enqueueCharacterTick(characterId, delayMs) {
        console.log(`[Queue] Stub: enqueue character_tick for ${characterId} (delay: ${delayMs}ms)`);
    }
    async enqueueWorldTick() {
        console.log('[Queue] Stub: enqueue world_tick');
    }
    async scheduleNextTick(characterId, nextTickAt) {
        const delay = nextTickAt.getTime() - Date.now();
        console.log(`[Queue] Stub: schedule next tick for ${characterId} at ${nextTickAt.toISOString()} (delay: ${delay}ms)`);
    }
    async cancelPendingTicks(characterId) {
        console.log(`[Queue] Stub: cancel pending ticks for ${characterId}`);
    }
}
exports.StubQueueAdapter = StubQueueAdapter;
//# sourceMappingURL=stub-adapter.js.map