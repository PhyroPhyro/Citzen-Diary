import { DBAdapter } from './adapter';

export class StubDBAdapter implements DBAdapter {
  async connect(): Promise<void> {
    console.log('[DB] Stub adapter connected (PostgreSQL not yet configured)');
  }

  async disconnect(): Promise<void> {
    console.log('[DB] Stub adapter disconnected');
  }

  character = {
    async getById(): Promise<null> { return null; },
    async create(): Promise<any> { return {}; },
    async update(): Promise<any> { return {}; },
    async getAllActive(): Promise<any[]> { return []; },
    async getByPlayerId(): Promise<any[]> { return []; },
    async updateObjectiveProgress(): Promise<void> {},
  };

  diary = {
    async getByCharacterId(_characterId: string): Promise<any[]> { return []; },
    async create(): Promise<any> { return {}; },
    async getAnchored(): Promise<any[]> { return []; },
    async enforceLimit(): Promise<void> {},
  };

  milestones = {
    async getByCharacterId(_characterId: string): Promise<any[]> { return []; },
    async create(): Promise<any> { return {}; },
    async getActiveContext(): Promise<any[]> { return []; },
  };

  npcs = {
    async getById(): Promise<null> { return null; },
    async create(): Promise<any> { return {}; },
    async update(): Promise<any> { return {}; },
    async getAll(): Promise<any[]> { return []; },
  };

  relations = {
    async getByCharacterId(_characterId: string): Promise<any[]> { return []; },
    async create(): Promise<any> { return {}; },
    async update(): Promise<any> { return {}; },
    async getByTarget(): Promise<null> { return null; },
  };

  suggestions = {
    async getPending(): Promise<null> { return null; },
    async getByCharacterId(_characterId: string): Promise<any[]> { return []; },
    async create(): Promise<any> { return {}; },
    async markProcessed(): Promise<void> {},
    async replacePending(): Promise<any> { return {}; },
  };

  economy = {
    async getInventory(): Promise<any> { return { gold: 50, storageCapacity: 50, storageUsed: 0, items: [] }; },
    async updateGold(): Promise<void> {},
    async updateInventory(): Promise<void> {},
    async getMarketPrices(): Promise<any[]> { return []; },
    async updateMarketPrice(): Promise<void> {},
    async getTradeRoutes(): Promise<any[]> { return []; },
    async createTradeRoute(): Promise<any> { return {}; },
    async createInventory(): Promise<void> {},
  };

  quests = {
    async getByCharacterId(): Promise<any[]> { return []; },
    async getActive(): Promise<any[]> { return []; },
    async create(data: any): Promise<any> { return data; },
    async update(): Promise<void> {},
  };

  world = {
    async getLocations(): Promise<any[]> { return []; },
    async getRegions(): Promise<any[]> { return []; },
    async getActiveEvents(): Promise<any[]> { return []; },
  };
}
