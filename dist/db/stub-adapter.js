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
    economy = {
        async getInventory() { return { gold: 50, storageCapacity: 50, storageUsed: 0, items: [] }; },
        async updateGold() { },
        async updateInventory() { },
        async getMarketPrices() { return []; },
        async updateMarketPrice() { },
        async getTradeRoutes() { return []; },
        async createTradeRoute() { return {}; },
        async createInventory() { },
    };
    quests = {
        async getByCharacterId() { return []; },
        async getActive() { return []; },
        async create(data) { return data; },
        async update() { },
    };
    world = {
        async getLocations() { return []; },
        async getRegions() { return []; },
        async getActiveEvents() { return []; },
    };
}
exports.StubDBAdapter = StubDBAdapter;
//# sourceMappingURL=stub-adapter.js.map