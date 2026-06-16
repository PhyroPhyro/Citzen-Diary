import { LLMProvider, LLMResponse, MilestoneLLMResponse, SpecializationLLMResponse, NPCProfileLLMResponse, BioLLMResponse, QuestBranchResponse } from './provider';
export declare class CerebrasProvider implements LLMProvider {
    private apiKey;
    private model;
    constructor(apiKey: string, model?: string);
    private callLLM;
    private parseJSON;
    generateDiaryEntry(context: string): Promise<LLMResponse>;
    generateMilestone(context: string): Promise<MilestoneLLMResponse>;
    generateSpecialization(context: string): Promise<SpecializationLLMResponse>;
    generateNPCProfile(context: string): Promise<NPCProfileLLMResponse>;
    generateBio(context: string): Promise<BioLLMResponse>;
    generateQuestBranch(context: string): Promise<QuestBranchResponse>;
}
//# sourceMappingURL=cerebras-provider.d.ts.map