import { Character, Milestone, MilestoneTrigger } from '../../models';
import { LLMProvider, MilestoneLLMResponse } from '../../llm';
import { DBAdapter } from '../../db';
export interface MilestoneCheckContext {
    character: Character;
    taskId: string;
    score: number;
    locationId: string;
    hasPendingSuggestion: boolean;
    wasFollowed: boolean;
    isNewLocation: boolean;
    hasActiveWorldEvent: boolean;
    moodState: string;
    commitmentResolved: boolean;
}
export declare function checkMilestoneTriggers(context: MilestoneCheckContext): MilestoneTrigger[];
export declare function generateMilestone(llm: LLMProvider, trigger: MilestoneTrigger, character: Character, locationId: string): Promise<MilestoneLLMResponse>;
export declare function getMilestoneImportance(trigger: MilestoneTrigger): Milestone['importance'];
export declare function processMilestones(context: MilestoneCheckContext, db: DBAdapter, llm: LLMProvider): Promise<Milestone[]>;
export declare function groupTrivialEntries(characterId: string, db: DBAdapter): Promise<void>;
export declare function reevaluateSpecialization(character: Character, db: DBAdapter, llm: LLMProvider): Promise<string | null>;
//# sourceMappingURL=milestone-system.d.ts.map