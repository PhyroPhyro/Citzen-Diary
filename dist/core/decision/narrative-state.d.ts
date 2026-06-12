export interface RichStateCondition {
    key: string;
    description: string;
    weight: number;
}
export declare const RICH_STATE_CONDITIONS: RichStateCondition[];
export declare const RICH_STATE_THRESHOLD = 2;
export declare function getNarrativeTickMultiplier(richnessScore: number): number;
export interface NarrativeStateResult {
    isRich: boolean;
    conditions: string[];
    hasMoodConflict: boolean;
    richnessScore: number;
}
export declare function classifyNarrativeState(taskId: string, score: number, moodModifier: number, context: {
    hasOtherCharacter: boolean;
    hasInteraction: boolean;
    hasCommitmentResolved: boolean;
    hasMilestoneTriggered: boolean;
    hasPendingSuggestion: boolean;
    objectiveProgressDelta: number;
    isNewLocation: boolean;
    hasActiveWorldEvent: boolean;
}): NarrativeStateResult;
//# sourceMappingURL=narrative-state.d.ts.map