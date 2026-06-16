import { Character } from '../../models/character';
import { Quest, QuestTemplate, QuestStepTemplate } from '../../models/quest';
import { DBAdapter } from '../../db';
import { LLMProvider } from '../../llm';
import { MilestoneTrigger } from '../../models/milestone';
export declare function checkQuestAvailability(character: Character, template: QuestTemplate): boolean;
export declare function getAvailableQuests(character: Character): QuestTemplate[];
export declare function startQuest(character: Character, templateId: string, db: DBAdapter): Promise<Quest | null>;
export declare function advanceQuestStep(quest: Quest, character: Character, taskId: string, locationId: string, llm: LLMProvider, db: DBAdapter): Promise<Quest | null>;
export declare function resolveQuestBranch(step: QuestStepTemplate, character: Character, llm: LLMProvider): Promise<{
    nextStepId: string;
    reason: string;
} | null>;
export declare function getQuestMilestoneTrigger(quest: Quest): MilestoneTrigger | null;
export declare function getQuestProgressKey(taskId: string): string;
//# sourceMappingURL=quest-engine.d.ts.map