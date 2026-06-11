"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const questionnaire_1 = require("../data/questionnaire");
(0, vitest_1.describe)('Character Creation Flow', () => {
    (0, vitest_1.describe)('calculateTraits', () => {
        (0, vitest_1.it)('calculates traits from answers', () => {
            const answers = [
                { questionId: 1, optionLetter: 'D' },
                { questionId: 2, optionLetter: 'D' },
                { questionId: 3, optionLetter: 'D' },
                { questionId: 4, optionLetter: 'D' },
                { questionId: 5, optionLetter: 'D' },
                { questionId: 6, optionLetter: 'D' },
                { questionId: 7, optionLetter: 'D' },
                { questionId: 8, optionLetter: 'D' },
                { questionId: 9, optionLetter: 'D' },
                { questionId: 10, optionLetter: 'D' },
            ];
            const traits = (0, questionnaire_1.calculateTraits)(answers);
            (0, vitest_1.expect)(traits.openness).toBeGreaterThan(0);
            (0, vitest_1.expect)(traits.conscientiousness).toBeGreaterThan(0);
            (0, vitest_1.expect)(traits.extraversion).toBeGreaterThan(0);
            (0, vitest_1.expect)(traits.emotionalStability).toBeGreaterThan(0);
            (0, vitest_1.expect)(traits.agreeableness).toBeGreaterThan(0);
        });
        (0, vitest_1.it)('returns traits within valid range (0-10)', () => {
            const answers = [
                { questionId: 1, optionLetter: 'A' },
                { questionId: 2, optionLetter: 'A' },
                { questionId: 3, optionLetter: 'A' },
                { questionId: 4, optionLetter: 'A' },
                { questionId: 5, optionLetter: 'A' },
                { questionId: 6, optionLetter: 'A' },
                { questionId: 7, optionLetter: 'A' },
                { questionId: 8, optionLetter: 'A' },
                { questionId: 9, optionLetter: 'A' },
                { questionId: 10, optionLetter: 'A' },
            ];
            const traits = (0, questionnaire_1.calculateTraits)(answers);
            (0, vitest_1.expect)(traits.openness).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.openness).toBeLessThanOrEqual(10);
            (0, vitest_1.expect)(traits.conscientiousness).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.conscientiousness).toBeLessThanOrEqual(10);
            (0, vitest_1.expect)(traits.extraversion).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.extraversion).toBeLessThanOrEqual(10);
            (0, vitest_1.expect)(traits.emotionalStability).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.emotionalStability).toBeLessThanOrEqual(10);
            (0, vitest_1.expect)(traits.agreeableness).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.agreeableness).toBeLessThanOrEqual(10);
        });
        (0, vitest_1.it)('handles mixed answers correctly', () => {
            const answers = [
                { questionId: 1, optionLetter: 'A' },
                { questionId: 2, optionLetter: 'D' },
                { questionId: 3, optionLetter: 'B' },
                { questionId: 4, optionLetter: 'C' },
                { questionId: 5, optionLetter: 'A' },
                { questionId: 6, optionLetter: 'B' },
                { questionId: 7, optionLetter: 'C' },
                { questionId: 8, optionLetter: 'D' },
                { questionId: 9, optionLetter: 'B' },
                { questionId: 10, optionLetter: 'C' },
            ];
            const traits = (0, questionnaire_1.calculateTraits)(answers);
            (0, vitest_1.expect)(traits.openness).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.conscientiousness).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.extraversion).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.emotionalStability).toBeGreaterThanOrEqual(0);
            (0, vitest_1.expect)(traits.agreeableness).toBeGreaterThanOrEqual(0);
        });
    });
    (0, vitest_1.describe)('CHARACTER_QUESTIONS', () => {
        (0, vitest_1.it)('has exactly 10 questions', () => {
            (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS.length).toBe(10);
        });
        (0, vitest_1.it)('each question has 4 options', () => {
            for (const question of questionnaire_1.CHARACTER_QUESTIONS) {
                (0, vitest_1.expect)(question.options.length).toBe(4);
            }
        });
        (0, vitest_1.it)('each option has a letter A-D', () => {
            const expectedLetters = ['A', 'B', 'C', 'D'];
            for (const question of questionnaire_1.CHARACTER_QUESTIONS) {
                const letters = question.options.map((o) => o.letter);
                (0, vitest_1.expect)(letters).toEqual(expectedLetters);
            }
        });
        (0, vitest_1.it)('each option has a primaryValue between 1-9', () => {
            for (const question of questionnaire_1.CHARACTER_QUESTIONS) {
                for (const option of question.options) {
                    (0, vitest_1.expect)(option.primaryValue).toBeGreaterThanOrEqual(1);
                    (0, vitest_1.expect)(option.primaryValue).toBeLessThanOrEqual(9);
                }
            }
        });
        (0, vitest_1.it)('covers all five traits', () => {
            const traits = new Set(questionnaire_1.CHARACTER_QUESTIONS.map((q) => q.primaryTrait));
            (0, vitest_1.expect)(traits.has('openness')).toBe(true);
            (0, vitest_1.expect)(traits.has('conscientiousness')).toBe(true);
            (0, vitest_1.expect)(traits.has('extraversion')).toBe(true);
            (0, vitest_1.expect)(traits.has('emotionalStability')).toBe(true);
            (0, vitest_1.expect)(traits.has('agreeableness')).toBe(true);
        });
    });
});
//# sourceMappingURL=character-creation.test.js.map