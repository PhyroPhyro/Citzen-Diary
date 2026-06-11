import { describe, it, expect } from 'vitest';
import { CHARACTER_QUESTIONS, calculateTraits } from './questionnaire';

describe('CHARACTER_QUESTIONS', () => {
  it('has 10 questions', () => {
    expect(CHARACTER_QUESTIONS.length).toBe(10);
  });

  it('each question has 4 options', () => {
    for (const question of CHARACTER_QUESTIONS) {
      expect(question.options.length).toBe(4);
    }
  });

  it('each option has a letter, text, and primaryValue', () => {
    for (const question of CHARACTER_QUESTIONS) {
      for (const option of question.options) {
        expect(option.letter).toBeDefined();
        expect(option.text.length).toBeGreaterThan(0);
        expect(option.primaryValue).toBeGreaterThanOrEqual(1);
        expect(option.primaryValue).toBeLessThanOrEqual(9);
      }
    }
  });

  it('question 1 maps to openness', () => {
    expect(CHARACTER_QUESTIONS[0].primaryTrait).toBe('openness');
  });

  it('question 2 maps to conscientiousness', () => {
    expect(CHARACTER_QUESTIONS[1].primaryTrait).toBe('conscientiousness');
  });

  it('question 3 maps to extraversion', () => {
    expect(CHARACTER_QUESTIONS[2].primaryTrait).toBe('extraversion');
  });

  it('question 4 maps to emotionalStability', () => {
    expect(CHARACTER_QUESTIONS[3].primaryTrait).toBe('emotionalStability');
  });

  it('question 5 maps to agreeableness', () => {
    expect(CHARACTER_QUESTIONS[4].primaryTrait).toBe('agreeableness');
  });

  it('question 6 has secondary effect on conscientiousness', () => {
    const q = CHARACTER_QUESTIONS[5];
    expect(q.primaryTrait).toBe('openness');
    expect(q.secondaryTrait).toBe('conscientiousness');
  });
});

describe('calculateTraits', () => {
  it('calculates traits within valid range (0-10)', () => {
    const answers = CHARACTER_QUESTIONS.map((q) => ({
      questionId: q.id,
      optionLetter: 'A',
    }));

    const traits = calculateTraits(answers);

    expect(traits.openness).toBeGreaterThanOrEqual(0);
    expect(traits.openness).toBeLessThanOrEqual(10);
    expect(traits.conscientiousness).toBeGreaterThanOrEqual(0);
    expect(traits.conscientiousness).toBeLessThanOrEqual(10);
    expect(traits.extraversion).toBeGreaterThanOrEqual(0);
    expect(traits.extraversion).toBeLessThanOrEqual(10);
    expect(traits.emotionalStability).toBeGreaterThanOrEqual(0);
    expect(traits.emotionalStability).toBeLessThanOrEqual(10);
    expect(traits.agreeableness).toBeGreaterThanOrEqual(0);
    expect(traits.agreeableness).toBeLessThanOrEqual(10);
  });

  it('high-value answers produce higher traits than low-value answers', () => {
    const highAnswers = CHARACTER_QUESTIONS.map((q) => ({
      questionId: q.id,
      optionLetter: 'D',
    }));

    const lowAnswers = CHARACTER_QUESTIONS.map((q) => ({
      questionId: q.id,
      optionLetter: 'A',
    }));

    const highTraits = calculateTraits(highAnswers);
    const lowTraits = calculateTraits(lowAnswers);

    // At least some traits should be higher with D answers
    const totalHigh =
      highTraits.openness +
      highTraits.conscientiousness +
      highTraits.extraversion +
      highTraits.emotionalStability +
      highTraits.agreeableness;

    const totalLow =
      lowTraits.openness +
      lowTraits.conscientiousness +
      lowTraits.extraversion +
      lowTraits.emotionalStability +
      lowTraits.agreeableness;

    expect(totalHigh).toBeGreaterThan(totalLow);
  });

  it('ignores answers for non-existent questions', () => {
    const answers = [
      { questionId: 999, optionLetter: 'A' },
      { questionId: 1, optionLetter: 'A' },
    ];

    const traits = calculateTraits(answers);
    expect(traits.openness).toBeGreaterThanOrEqual(0);
  });

  it('ignores answers for non-existent options', () => {
    const answers = [{ questionId: 1, optionLetter: 'Z' }];

    const traits = calculateTraits(answers);
    expect(traits.openness).toBeGreaterThanOrEqual(0);
  });
});
