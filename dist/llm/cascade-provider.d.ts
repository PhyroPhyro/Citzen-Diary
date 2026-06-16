import { LLMProvider, LLMResponse, MilestoneLLMResponse, SpecializationLLMResponse, NPCProfileLLMResponse, BioLLMResponse, QuestBranchResponse } from './provider';
export declare class CascadeLLMProvider implements LLMProvider {
    private gemini;
    private cerebras;
    private mock;
    private currentLevel;
    private lastGeminiFailure;
    private lastCerebrasFailure;
    private readonly GEMINI_RETRY_INTERVAL;
    private readonly CEREBRAS_RETRY_INTERVAL;
    constructor(geminiApiKey?: string, cerebrasApiKey?: string);
    get activeProvider(): string;
    resetToGemini(): void;
    resetToCerebras(): void;
    private isQuotaError;
    private tryGemini;
    private tryCerebras;
    generateDiaryEntry(context: string): Promise<LLMResponse>;
    generateMilestone(context: string): Promise<MilestoneLLMResponse>;
    generateSpecialization(context: string): Promise<SpecializationLLMResponse>;
    generateNPCProfile(context: string): Promise<NPCProfileLLMResponse>;
    generateBio(context: string): Promise<BioLLMResponse>;
    generateQuestBranch(context: string): Promise<QuestBranchResponse>;
}
//# sourceMappingURL=cascade-provider.d.ts.map