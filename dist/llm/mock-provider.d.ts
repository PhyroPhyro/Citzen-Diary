import { LLMProvider, LLMResponse, MilestoneLLMResponse, SpecializationLLMResponse, NPCProfileLLMResponse, BioLLMResponse, QuestBranchResponse } from './provider';
export declare class MockLLMProvider implements LLMProvider {
    generateDiaryEntry(): Promise<LLMResponse>;
    generateMilestone(): Promise<MilestoneLLMResponse>;
    generateSpecialization(): Promise<SpecializationLLMResponse>;
    generateNPCProfile(): Promise<NPCProfileLLMResponse>;
    generateBio(): Promise<BioLLMResponse>;
    generateQuestBranch(): Promise<QuestBranchResponse>;
}
//# sourceMappingURL=mock-provider.d.ts.map