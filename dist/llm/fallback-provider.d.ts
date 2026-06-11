import { LLMProvider, LLMResponse, MilestoneLLMResponse, SpecializationLLMResponse, NPCProfileLLMResponse, BioLLMResponse } from './provider';
export declare class FallbackLLMProvider implements LLMProvider {
    private primary;
    private fallback;
    private useFallback;
    constructor(apiKey: string, model: string);
    private isQuotaError;
    generateDiaryEntry(_context: string): Promise<LLMResponse>;
    generateMilestone(_context: string): Promise<MilestoneLLMResponse>;
    generateSpecialization(_context: string): Promise<SpecializationLLMResponse>;
    generateNPCProfile(_context: string): Promise<NPCProfileLLMResponse>;
    generateBio(_context: string): Promise<BioLLMResponse>;
}
//# sourceMappingURL=fallback-provider.d.ts.map