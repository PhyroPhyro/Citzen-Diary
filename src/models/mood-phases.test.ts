import { describe, it, expect } from 'vitest';
import { decayMood } from './mood';

describe('Mood Decay — Phase 19 Enhancements', () => {
  describe('decayMood returns to neutral over time', () => {
    it('decays high joy towards 5', () => {
      const mood = { joy: 9, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 1 };
      const decayed = decayMood(mood, 2);
      expect(decayed.joy).toBeLessThan(9);
      expect(decayed.joy).toBeGreaterThan(5);
    });

    it('decays high sadness towards 0', () => {
      const mood = { joy: 5, sadness: 9, anger: 1, fear: 1, disgust: 1, surprise: 1 };
      const decayed = decayMood(mood, 2);
      expect(decayed.sadness).toBeLessThan(9);
    });

    it('decays high anger towards 0', () => {
      const mood = { joy: 5, sadness: 1, anger: 9, fear: 1, disgust: 1, surprise: 1 };
      const decayed = decayMood(mood, 2);
      expect(decayed.anger).toBeLessThan(9);
    });

    it('decays high fear towards 0', () => {
      const mood = { joy: 5, sadness: 1, anger: 1, fear: 9, disgust: 1, surprise: 1 };
      const decayed = decayMood(mood, 2);
      expect(decayed.fear).toBeLessThan(9);
    });

    it('decays high disgust towards 0', () => {
      const mood = { joy: 5, sadness: 1, anger: 1, fear: 1, disgust: 9, surprise: 1 };
      const decayed = decayMood(mood, 2);
      expect(decayed.disgust).toBeLessThan(9);
    });

    it('decays high surprise towards 0', () => {
      const mood = { joy: 5, sadness: 1, anger: 1, fear: 1, disgust: 1, surprise: 9 };
      const decayed = decayMood(mood, 2);
      expect(decayed.surprise).toBeLessThan(9);
    });

    it('low joy increases towards 5', () => {
      const mood = { joy: 1, sadness: 5, anger: 5, fear: 5, disgust: 5, surprise: 5 };
      const decayed = decayMood(mood, 2);
      expect(decayed.joy).toBeGreaterThan(1);
    });

    it('clamps values between 0 and 10', () => {
      const mood = { joy: 10, sadness: 10, anger: 10, fear: 10, disgust: 10, surprise: 10 };
      const decayed = decayMood(mood, 10);
      for (const value of Object.values(decayed)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(10);
      }
    });
  });
});
