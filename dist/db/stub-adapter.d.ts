import { DBAdapter } from './adapter';
export declare class StubDBAdapter implements DBAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    character: {
        getById(): Promise<null>;
        create(): Promise<any>;
        update(): Promise<any>;
        getAllActive(): Promise<any[]>;
        getByPlayerId(): Promise<any[]>;
        updateObjectiveProgress(): Promise<void>;
    };
    diary: {
        getByCharacterId(_characterId: string): Promise<any[]>;
        create(): Promise<any>;
        getAnchored(): Promise<any[]>;
        enforceLimit(): Promise<void>;
    };
    milestones: {
        getByCharacterId(_characterId: string): Promise<any[]>;
        create(): Promise<any>;
        getActiveContext(): Promise<any[]>;
    };
    npcs: {
        getById(): Promise<null>;
        create(): Promise<any>;
        update(): Promise<any>;
        getAll(): Promise<any[]>;
    };
    relations: {
        getByCharacterId(_characterId: string): Promise<any[]>;
        create(): Promise<any>;
        update(): Promise<any>;
        getByTarget(): Promise<null>;
    };
    suggestions: {
        getPending(): Promise<null>;
        getByCharacterId(_characterId: string): Promise<any[]>;
        create(): Promise<any>;
        markProcessed(): Promise<void>;
        replacePending(): Promise<any>;
    };
    economy: {
        getInventory(): Promise<any>;
        updateGold(): Promise<void>;
        updateInventory(): Promise<void>;
        getMarketPrices(): Promise<any[]>;
        updateMarketPrice(): Promise<void>;
        getTradeRoutes(): Promise<any[]>;
        createTradeRoute(): Promise<any>;
        createInventory(): Promise<void>;
    };
    quests: {
        getByCharacterId(): Promise<any[]>;
        getActive(): Promise<any[]>;
        create(data: any): Promise<any>;
        update(): Promise<void>;
    };
    world: {
        getLocations(): Promise<any[]>;
        getRegions(): Promise<any[]>;
        getActiveEvents(): Promise<any[]>;
    };
}
//# sourceMappingURL=stub-adapter.d.ts.map