"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StubDBAdapter = void 0;
class StubDBAdapter {
    async connect() {
        console.log('[DB] Stub adapter connected (PostgreSQL not yet configured)');
    }
    async disconnect() {
        console.log('[DB] Stub adapter disconnected');
    }
    character = {
        async getById() { return null; },
        async create() { return {}; },
        async update() { return {}; },
        async getAllActive() { return []; },
        async getByPlayerId() { return []; },
        async updateObjectiveProgress() { },
    };
    diary = {
        async getByCharacterId(_characterId) { return []; },
        async create() { return {}; },
        async getAnchored() { return []; },
        async enforceLimit() { },
    };
    milestones = {
        async getByCharacterId(_characterId) { return []; },
        async create() { return {}; },
        async getActiveContext() { return []; },
    };
    npcs = {
        async getById() { return null; },
        async create() { return {}; },
        async update() { return {}; },
        async getAll() { return []; },
    };
    relations = {
        async getByCharacterId(_characterId) { return []; },
        async create() { return {}; },
        async update() { return {}; },
        async getByTarget() { return null; },
    };
    suggestions = {
        async getPending() { return null; },
        async getByCharacterId(_characterId) { return []; },
        async create() { return {}; },
        async markProcessed() { },
        async replacePending() { return {}; },
    };
    world = {
        async getLocations() { return []; },
        async getRegions() { return []; },
        async getActiveEvents() { return []; },
    };
}
exports.StubDBAdapter = StubDBAdapter;
//# sourceMappingURL=stub-adapter.js.map