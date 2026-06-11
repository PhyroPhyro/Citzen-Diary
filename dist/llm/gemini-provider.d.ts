import { LLMProvider, LLMResponse, MilestoneLLMResponse, SpecializationLLMResponse, NPCProfileLLMResponse, BioLLMResponse } from './provider';
export declare class GeminiProvider implements LLMProvider {
    private genAI;
    private model;
    constructor(apiKey: string, model?: string);
    private callLLM;
    private parseJSON;
    generateDiaryEntry(context: string): Promise<LLMResponse>;
    generateMilestone(context: string): Promise<MilestoneLLMResponse>;
    generateSpecialization(context: string): Promise<SpecializationLLMResponse>;
    generateNPCProfile(context: string): Promise<NPCProfileLLMResponse>;
    generateBio(context: string): Promise<BioLLMResponse>;
}
//# sourceMappingURL=gemini-provider.d.ts.map