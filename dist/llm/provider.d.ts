export interface LLMResponse {
    diary_entry: string;
    chosen_action: string;
}
export interface MilestoneLLMResponse {
    title: string;
    description: string;
}
export interface SpecializationLLMResponse {
    specialization: string;
}
export interface NPCProfileLLMResponse {
    occupation: string;
    dominantTrait: string;
    physicalDescription: string;
    firstImpression: string;
}
export interface BioLLMResponse {
    bio: string;
}
export interface QuestBranchResponse {
    nextStepId: string;
}
export interface LLMProvider {
    generateDiaryEntry(context: string): Promise<LLMResponse>;
    generateMilestone(context: string): Promise<MilestoneLLMResponse>;
    generateSpecialization(context: string): Promise<SpecializationLLMResponse>;
    generateNPCProfile(context: string): Promise<NPCProfileLLMResponse>;
    generateBio(context: string): Promise<BioLLMResponse>;
    generateQuestBranch(context: string): Promise<QuestBranchResponse>;
}
//# sourceMappingURL=provider.d.ts.map