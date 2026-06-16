import { Character, NPC, NpcAutonomyState } from '../../models';
import { DBAdapter } from '../../db';
import { LLMProvider } from '../../llm';
export declare function createAutonomyState(npc: NPC, character: Character): NpcAutonomyState;
export declare function ensureNpcCharacters(db: DBAdapter): Promise<void>;
export declare function getNpcTickInterval(): number;
export declare function processNpcMood(mood: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    disgust: number;
    surprise: number;
}): {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    disgust: number;
    surprise: number;
};
export declare function buildNpcRelationships(characterId: string, locationId: string, db: DBAdapter, characters: Character[]): Promise<void>;
export declare function getDominantEmotion(mood: {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    disgust: number;
    surprise: number;
}): string;
export declare function autoSpawnNpcs(db: DBAdapter, llm: LLMProvider, maxTotalNpcs?: number): Promise<void>;
//# sourceMappingURL=npc-autonomy.d.ts.map