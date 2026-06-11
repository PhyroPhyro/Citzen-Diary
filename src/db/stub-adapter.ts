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
  };

  diary = {
    async getByCharacterId(): Promise<any[]> { return []; },
    async create(): Promise<any> { return {}; },
    async getAnchored(): Promise<any[]> { return []; },
    async enforceLimit(): Promise<void> {},
  };

  milestones = {
    async getByCharacterId(): Promise<any[]> { return []; },
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
    async getByCharacterId(): Promise<any[]> { return []; },
    async create(): Promise<any> { return {}; },
    async update(): Promise<any> { return {}; },
    async getByTarget(): Promise<null> { return null; },
  };

  suggestions = {
    async getPending(): Promise<null> { return null; },
    async create(): Promise<any> { return {}; },
    async markProcessed(): Promise<void> {},
    async replacePending(): Promise<any> { return {}; },
  };

  world = {
    async getLocations(): Promise<any[]> { return []; },
    async getRegions(): Promise<any[]> { return []; },
    async getActiveEvents(): Promise<any[]> { return []; },
  };
}
