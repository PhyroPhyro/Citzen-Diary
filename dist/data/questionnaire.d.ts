import { TraitName } from '../models';
export interface QuestionOption {
    letter: string;
    text: string;
    primaryValue: number;
    secondaryEffect?: {
        trait: TraitName;
        value: number;
    };
}
export interface Question {
    id: number;
    text: string;
    primaryTrait: TraitName;
    secondaryTrait?: TraitName;
    options: QuestionOption[];
}
export declare const CHARACTER_QUESTIONS: Question[];
export interface TraitCalculation {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    emotionalStability: number;
    agreeableness: number;
}
export declare function calculateTraits(answers: {
    questionId: number;
    optionLetter: string;
}[]): TraitCalculation;
//# sourceMappingURL=questionnaire.d.ts.map