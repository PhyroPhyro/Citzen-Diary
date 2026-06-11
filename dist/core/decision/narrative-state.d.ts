export interface RichStateCondition {
    key: string;
    description: string;
}
export declare const RICH_STATE_CONDITIONS: RichStateCondition[];
export interface NarrativeStateResult {
    isRich: boolean;
    conditions: string[];
    hasMoodConflict: boolean;
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