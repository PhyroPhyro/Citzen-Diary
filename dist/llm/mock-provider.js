"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockLLMProvider = void 0;
class MockLLMProvider {
    async generateDiaryEntry() {
        return {
            diary_entry: 'Mais um dia que passa. Fiz o que precisava ser feito.',
            chosen_action: 'generic_task',
        };
    }
    async generateMilestone() {
        return {
            title: 'Um momento que ficou',
            description: 'Algo aconteceu que mudou o rumo das coisas. Não sei bem como explicar, mas sei que não sou o mesmo.',
        };
    }
    async generateSpecialization() {
        return {
            specialization: 'trabalhador dedicado',
        };
    }
    async generateNPCProfile() {
        return {
            occupation: 'trabalha no mercado local',
            dominantTrait: 'reservado',
            physicalDescription: 'Pessoa de estatura média, olhar atento, mãos calejadas de trabalho.',
            firstImpression: 'Parece saber mais do que diz.',
        };
    }
    async generateBio() {
        return {
            bio: 'Uma alma que caminha pelo mundo com seus próprios passos, carregando consigo o peso e a leveza de quem escolheu existir.',
        };
    }
    async generateQuestBranch() {
        return { nextStepId: 'qrc_4' };
    }
}
exports.MockLLMProvider = MockLLMProvider;
//# sourceMappingURL=mock-provider.js.map