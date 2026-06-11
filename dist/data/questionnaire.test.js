"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const questionnaire_1 = require("./questionnaire");
(0, vitest_1.describe)('CHARACTER_QUESTIONS', () => {
    (0, vitest_1.it)('has 10 questions', () => {
        (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS.length).toBe(10);
    });
    (0, vitest_1.it)('each question has 4 options', () => {
        for (const question of questionnaire_1.CHARACTER_QUESTIONS) {
            (0, vitest_1.expect)(question.options.length).toBe(4);
        }
    });
    (0, vitest_1.it)('each option has a letter, text, and primaryValue', () => {
        for (const question of questionnaire_1.CHARACTER_QUESTIONS) {
            for (const option of question.options) {
                (0, vitest_1.expect)(option.letter).toBeDefined();
                (0, vitest_1.expect)(option.text.length).toBeGreaterThan(0);
                (0, vitest_1.expect)(option.primaryValue).toBeGreaterThanOrEqual(1);
                (0, vitest_1.expect)(option.primaryValue).toBeLessThanOrEqual(9);
            }
        }
    });
    (0, vitest_1.it)('question 1 maps to openness', () => {
        (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS[0].primaryTrait).toBe('openness');
    });
    (0, vitest_1.it)('question 2 maps to conscientiousness', () => {
        (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS[1].primaryTrait).toBe('conscientiousness');
    });
    (0, vitest_1.it)('question 3 maps to extraversion', () => {
        (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS[2].primaryTrait).toBe('extraversion');
    });
    (0, vitest_1.it)('question 4 maps to emotionalStability', () => {
        (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS[3].primaryTrait).toBe('emotionalStability');
    });
    (0, vitest_1.it)('question 5 maps to agreeableness', () => {
        (0, vitest_1.expect)(questionnaire_1.CHARACTER_QUESTIONS[4].primaryTrait).toBe('agreeableness');
    });
    (0, vitest_1.it)('question 6 has secondary effect on conscientiousness', () => {
        const q = questionnaire_1.CHARACTER_QUESTIONS[5];
        (0, vitest_1.expect)(q.primaryTrait).toBe('openness');
        (0, vitest_1.expect)(q.secondaryTrait).toBe('conscientiousness');
    });
});
(0, vitest_1.describe)('calculateTraits', () => {
    (0, vitest_1.it)('calculates traits within valid range (0-10)', () => {
        const answers = questionnaire_1.CHARACTER_QUESTIONS.map((q) => ({
            questionId: q.id,
            optionLetter: 'A',
        }));
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
    (0, vitest_1.it)('high-value answers produce higher traits than low-value answers', () => {
        const highAnswers = questionnaire_1.CHARACTER_QUESTIONS.map((q) => ({
            questionId: q.id,
            optionLetter: 'D',
        }));
        const lowAnswers = questionnaire_1.CHARACTER_QUESTIONS.map((q) => ({
            questionId: q.id,
            optionLetter: 'A',
        }));
        const highTraits = (0, questionnaire_1.calculateTraits)(highAnswers);
        const lowTraits = (0, questionnaire_1.calculateTraits)(lowAnswers);
        // At least some traits should be higher with D answers
        const totalHigh = highTraits.openness +
            highTraits.conscientiousness +
            highTraits.extraversion +
            highTraits.emotionalStability +
            highTraits.agreeableness;
        const totalLow = lowTraits.openness +
            lowTraits.conscientiousness +
            lowTraits.extraversion +
            lowTraits.emotionalStability +
            lowTraits.agreeableness;
        (0, vitest_1.expect)(totalHigh).toBeGreaterThan(totalLow);
    });
    (0, vitest_1.it)('ignores answers for non-existent questions', () => {
        const answers = [
            { questionId: 999, optionLetter: 'A' },
            { questionId: 1, optionLetter: 'A' },
        ];
        const traits = (0, questionnaire_1.calculateTraits)(answers);
        (0, vitest_1.expect)(traits.openness).toBeGreaterThanOrEqual(0);
    });
    (0, vitest_1.it)('ignores answers for non-existent options', () => {
        const answers = [{ questionId: 1, optionLetter: 'Z' }];
        const traits = (0, questionnaire_1.calculateTraits)(answers);
        (0, vitest_1.expect)(traits.openness).toBeGreaterThanOrEqual(0);
    });
});
//# sourceMappingURL=questionnaire.test.js.map