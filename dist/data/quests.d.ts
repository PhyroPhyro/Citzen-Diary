import { QuestTemplate } from '../models/quest';
export declare const QUEST_TEMPLATES: QuestTemplate[];
export declare const QUEST_TEMPLATE_MAP: Record<string, QuestTemplate>;
export declare function getQuestTemplate(id: string): QuestTemplate | undefined;
export declare function getQuestsByVocation(vocation: string): QuestTemplate[];
export declare function getQuestTemplatesByTier(tier: number): QuestTemplate[];
//# sourceMappingURL=quests.d.ts.map