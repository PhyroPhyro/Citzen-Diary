import { Character } from '../models';
import { ScoredTask } from '../core/decision';
import { NarrativeStateResult } from '../core/decision/narrative-state';
import { Location, WorldEvent } from '../data/world';
export declare function buildLLMContext(character: Character, chosenTask: ScoredTask, narrativeState: NarrativeStateResult, location: Location | undefined, activeEvents: WorldEvent[], recentDiary: string[]): string;
//# sourceMappingURL=llm-context.d.ts.map