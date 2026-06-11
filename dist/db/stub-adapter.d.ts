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
    };
    diary: {
        getByCharacterId(): Promise<any[]>;
        create(): Promise<any>;
        getAnchored(): Promise<any[]>;
        enforceLimit(): Promise<void>;
    };
    milestones: {
        getByCharacterId(): Promise<any[]>;
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
        getByCharacterId(): Promise<any[]>;
        create(): Promise<any>;
        update(): Promise<any>;
        getByTarget(): Promise<null>;
    };
    suggestions: {
        getPending(): Promise<null>;
        create(): Promise<any>;
        markProcessed(): Promise<void>;
        replacePending(): Promise<any>;
    };
    world: {
        getLocations(): Promise<any[]>;
        getRegions(): Promise<any[]>;
        getActiveEvents(): Promise<any[]>;
    };
}
//# sourceMappingURL=stub-adapter.d.ts.map