export type DiarySource = 'llm' | 'template';
export interface DiaryEntry {
    id: string;
    characterId: string;
    text: string;
    source: DiarySource;
    occurredAt: Date;
    createdAt: Date;
    locationId: string;
    locationName: string;
    taskId: string;
    moodState: string;
    isGrouped: boolean;
    groupCount: number | null;
    isAnchored: boolean;
    milestoneId: string | null;
}
export declare const DIARY_LIMIT = 30;
//# sourceMappingURL=diary.d.ts.map