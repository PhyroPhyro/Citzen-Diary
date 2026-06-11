import { LLMProvider, LLMResponse, MilestoneLLMResponse, SpecializationLLMResponse, NPCProfileLLMResponse, BioLLMResponse } from './provider';
export declare class CascadeLLMProvider implements LLMProvider {
    private gemini;
    private cerebras;
    private mock;
    private currentLevel;
    private lastGeminiFailure;
    private readonly GEMINI_RETRY_INTERVAL;
    constructor(geminiApiKey?: string, cerebrasApiKey?: string);
    get activeProvider(): string;
    resetToGemini(): void;
    private isQuotaError;
    private tryGemini;
    private tryCerebras;
    generateDiaryEntry(context: string): Promise<LLMResponse>;
    generateMilestone(context: string): Promise<MilestoneLLMResponse>;
    generateSpecialization(context: string): Promise<SpecializationLLMResponse>;
    generateNPCProfile(context: string): Promise<NPCProfileLLMResponse>;
    generateBio(context: string): Promise<BioLLMResponse>;
}
//# sourceMappingURL=cascade-provider.d.ts.map