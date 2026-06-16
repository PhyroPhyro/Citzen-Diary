export type QuestState = 'locked' | 'available' | 'active' | 'in_progress' | 'completed' | 'failed' | 'abandoned';
export interface QuestChoice {
    text: string;
    nextStepId: string;
    traitRequirements?: {
        trait: string;
        minValue: number;
    }[];
    faithRequirement?: number;
    condition?: string;
}
export interface QuestStepTemplate {
    id: string;
    description: string;
    taskId?: string;
    locationId?: string;
    choices?: QuestChoice[];
    isFinal: boolean;
    progressTaskCategory?: string;
}
export interface QuestRewards {
    gold?: number;
    faith?: number;
    traitChanges?: Record<string, number>;
    items?: {
        resourceId: string;
        quantity: number;
    }[];
    experience?: number;
}
export interface QuestTemplate {
    id: string;
    title: string;
    description: string;
    tier: number;
    minLevel?: number;
    prerequisites?: string[];
    requirements?: {
        vocation?: string;
        minFaith?: number;
        minTraits?: Record<string, number>;
    };
    steps: QuestStepTemplate[];
    rewards: QuestRewards;
    cooldownDays?: number;
}
export interface Quest {
    id: string;
    characterId: string;
    templateId: string;
    title: string;
    description: string;
    state: QuestState;
    currentStepId: string | null;
    completedSteps: string[];
    startedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    tier: number;
    rewards: QuestRewards;
}
export interface QuestProgress {
    questId: string;
    characterId: string;
    stepId: string;
    progress: number;
    updatedAt: Date;
}
//# sourceMappingURL=quest.d.ts.map