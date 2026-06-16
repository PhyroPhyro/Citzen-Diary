import {
  LLMProvider,
  LLMResponse,
  MilestoneLLMResponse,
  SpecializationLLMResponse,
  NPCProfileLLMResponse,
  BioLLMResponse,
  QuestBranchResponse,
} from './provider';

export class MockLLMProvider implements LLMProvider {
  async generateDiaryEntry(): Promise<LLMResponse> {
    return {
      diary_entry: 'Mais um dia que passa. Fiz o que precisava ser feito.',
      chosen_action: 'generic_task',
    };
  }

  async generateMilestone(): Promise<MilestoneLLMResponse> {
    return {
      title: 'Um momento que ficou',
      description: 'Algo aconteceu que mudou o rumo das coisas. Não sei bem como explicar, mas sei que não sou o mesmo.',
    };
  }

  async generateSpecialization(): Promise<SpecializationLLMResponse> {
    return {
      specialization: 'trabalhador dedicado',
    };
  }

  async generateNPCProfile(): Promise<NPCProfileLLMResponse> {
    return {
      occupation: 'trabalha no mercado local',
      dominantTrait: 'reservado',
      physicalDescription: 'Pessoa de estatura média, olhar atento, mãos calejadas de trabalho.',
      firstImpression: 'Parece saber mais do que diz.',
    };
  }

  async generateBio(): Promise<BioLLMResponse> {
    return {
      bio: 'Uma alma que caminha pelo mundo com seus próprios passos, carregando consigo o peso e a leveza de quem escolheu existir.',
    };
  }

  async generateQuestBranch(): Promise<QuestBranchResponse> {
    return { nextStepId: 'qrc_4' };
  }
}
