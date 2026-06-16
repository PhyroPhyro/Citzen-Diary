export interface NpcAutonomyState {
    id: string;
    npcId: string;
    characterId: string;
    lastTickAt: Date;
    nextTickAt: Date;
    tickCount: number;
    mood: {
        joy: number;
        sadness: number;
        anger: number;
        fear: number;
        disgust: number;
        surprise: number;
    };
    faith: number;
    dominantEmotion: string;
    lastAction: string;
    locationId: string;
    relationshipCount: number;
    history: string[];
}
export interface NpcSpawnConfig {
    locationId: string;
    minNpcs: number;
    maxNpcs: number;
    spawnIntervalMs: number;
    lastSpawnAt: Date;
}
export interface CrossCharacterEvent {
    id: string;
    type: 'meeting' | 'cooperation' | 'conflict' | 'trade' | 'conversation' | 'shared_observation';
    participants: string[];
    locationId: string;
    description: string;
    occurredAt: Date;
    outcomes: {
        characterId: string;
        moodDelta: Record<string, number>;
        affinityDelta: number;
        narrative: string;
    }[];
}
//# sourceMappingURL=npc-autonomy.d.ts.map