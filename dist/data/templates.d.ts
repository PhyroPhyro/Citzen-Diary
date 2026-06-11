export interface TemplateCategory {
    id: string;
    name: string;
    variations: string[];
    positiveSuffix: string;
    negativeSuffix: string;
}
export declare const DIARY_TEMPLATES: TemplateCategory[];
export declare function getTemplateForTask(taskId: string): TemplateCategory | null;
export declare function getToneSuffix(category: TemplateCategory, moodState: string): string;
//# sourceMappingURL=templates.d.ts.map