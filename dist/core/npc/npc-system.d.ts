import { NPC, NPCProfile, Relation, RelationMemory } from '../../models';
import { LLMProvider } from '../../llm';
import { DBAdapter } from '../../db';
export interface NPCGenerationContext {
    locationId: string;
    vocation?: string;
    traitBias?: string;
}
export declare function generateNPCName(): {
    firstName: string;
    lastName: string;
    fullName: string;
};
export declare function generateDefaultProfile(context: NPCGenerationContext): NPCProfile;
export declare function generateNPCProfile(llm: LLMProvider, context: NPCGenerationContext): Promise<NPCProfile>;
export declare function createNPCForLocation(locationId: string, db: DBAdapter, llm: LLMProvider, context?: Partial<NPCGenerationContext>): Promise<NPC>;
export declare function shouldAutoNameNPC(npc: NPC): boolean;
export declare function autoNameNPC(npc: NPC): string;
export declare function calculateAffinityDecay(hoursSinceInteraction: number): number;
export declare function applyAffinityDecay(relation: Relation): number;
export declare function addRelationMemory(relation: Relation, memory: Omit<RelationMemory, 'id'>): Relation;
export declare function getRelationType(affinity: number): Relation['relationType'];
export declare function processNPCDecay(db: DBAdapter): Promise<void>;
export declare function processRelationDecay(db: DBAdapter): Promise<void>;
//# sourceMappingURL=npc-system.d.ts.map