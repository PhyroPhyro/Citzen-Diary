import { describe, it, expect } from 'vitest';
import { calculateTraits, CHARACTER_QUESTIONS } from '../data/questionnaire';

describe('Character Creation Flow', () => {
  describe('calculateTraits', () => {
    it('calculates traits from answers', () => {
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

      const traits = calculateTraits(answers);

      expect(traits.openness).toBeGreaterThan(0);
      expect(traits.conscientiousness).toBeGreaterThan(0);
      expect(traits.extraversion).toBeGreaterThan(0);
      expect(traits.emotionalStability).toBeGreaterThan(0);
      expect(traits.agreeableness).toBeGreaterThan(0);
    });

    it('returns traits within valid range (0-10)', () => {
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

    it('handles mixed answers correctly', () => {
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

      const traits = calculateTraits(answers);

      expect(traits.openness).toBeGreaterThanOrEqual(0);
      expect(traits.conscientiousness).toBeGreaterThanOrEqual(0);
      expect(traits.extraversion).toBeGreaterThanOrEqual(0);
      expect(traits.emotionalStability).toBeGreaterThanOrEqual(0);
      expect(traits.agreeableness).toBeGreaterThanOrEqual(0);
    });
  });

  describe('CHARACTER_QUESTIONS', () => {
    it('has exactly 10 questions', () => {
      expect(CHARACTER_QUESTIONS.length).toBe(10);
    });

    it('each question has 4 options', () => {
      for (const question of CHARACTER_QUESTIONS) {
        expect(question.options.length).toBe(4);
      }
    });

    it('each option has a letter A-D', () => {
      const expectedLetters = ['A', 'B', 'C', 'D'];
      for (const question of CHARACTER_QUESTIONS) {
        const letters = question.options.map((o) => o.letter);
        expect(letters).toEqual(expectedLetters);
      }
    });

    it('each option has a primaryValue between 1-9', () => {
      for (const question of CHARACTER_QUESTIONS) {
        for (const option of question.options) {
          expect(option.primaryValue).toBeGreaterThanOrEqual(1);
          expect(option.primaryValue).toBeLessThanOrEqual(9);
        }
      }
    });

    it('covers all five traits', () => {
      const traits = new Set(CHARACTER_QUESTIONS.map((q) => q.primaryTrait));
      expect(traits.has('openness')).toBe(true);
      expect(traits.has('conscientiousness')).toBe(true);
      expect(traits.has('extraversion')).toBe(true);
      expect(traits.has('emotionalStability')).toBe(true);
      expect(traits.has('agreeableness')).toBe(true);
    });
  });
});
