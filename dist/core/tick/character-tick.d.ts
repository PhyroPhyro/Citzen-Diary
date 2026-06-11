import { Character, DiaryEntry, Milestone } from '../../models';
import { ScoredTask } from '../decision';
import { NarrativeStateResult } from '../decision/narrative-state';
import { LLMProvider } from '../../llm';
import { DBAdapter } from '../../db';
import { QueueAdapter } from '../../queue';
export interface TickResult {
    characterId: string;
    chosenTask: ScoredTask;
    narrativeState: NarrativeStateResult;
    diaryEntry: DiaryEntry | null;
    milestone: Milestone | null;
    nextTickAt: Date;
    characterUpdated: Partial<Character>;
}
export declare function calculateTickInterval(character: Character): number;
export declare function shouldConvertToNPC(character: Character): boolean;
export declare function executeCharacterTick(character: Character, db: DBAdapter, queue: QueueAdapter, llm: LLMProvider): Promise<TickResult | null>;
//# sourceMappingURL=character-tick.d.ts.map