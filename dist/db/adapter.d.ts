import { Character, DiaryEntry, Milestone, NPC, Relation, PendingPlayerAction } from '../models';
export interface DBAdapter {
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    character: {
        getById(id: string): Promise<Character | null>;
        create(data: Partial<Character>): Promise<Character>;
        update(id: string, data: Partial<Character>): Promise<Character>;
        getAllActive(): Promise<Character[]>;
        getByPlayerId(playerId: string): Promise<Character[]>;
    };
    diary: {
        getByCharacterId(characterId: string, limit?: number): Promise<DiaryEntry[]>;
        create(entry: Partial<DiaryEntry>): Promise<DiaryEntry>;
        getAnchored(characterId: string): Promise<DiaryEntry[]>;
        enforceLimit(characterId: string, limit: number): Promise<void>;
    };
    milestones: {
        getByCharacterId(characterId: string): Promise<Milestone[]>;
        create(data: Partial<Milestone>): Promise<Milestone>;
        getActiveContext(characterId: string): Promise<Milestone[]>;
    };
    npcs: {
        getById(id: string): Promise<NPC | null>;
        create(data: Partial<NPC>): Promise<NPC>;
        update(id: string, data: Partial<NPC>): Promise<NPC>;
        getAll(): Promise<NPC[]>;
    };
    relations: {
        getByCharacterId(characterId: string): Promise<Relation[]>;
        create(data: Partial<Relation>): Promise<Relation>;
        update(id: string, data: Partial<Relation>): Promise<Relation>;
        getByTarget(characterId: string, targetId: string): Promise<Relation | null>;
    };
    suggestions: {
        getPending(characterId: string): Promise<PendingPlayerAction | null>;
        create(data: Partial<PendingPlayerAction>): Promise<PendingPlayerAction>;
        markProcessed(id: string, wasFollowed: boolean): Promise<void>;
        replacePending(characterId: string, data: Partial<PendingPlayerAction>): Promise<PendingPlayerAction>;
    };
    world: {
        getLocations(): Promise<any[]>;
        getRegions(): Promise<any[]>;
        getActiveEvents(): Promise<any[]>;
    };
}
//# sourceMappingURL=adapter.d.ts.map