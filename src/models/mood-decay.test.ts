import { describe, it, expect } from 'vitest';
import { decayMood, getDominantMood } from './mood';

describe('decayMood', () => {
  it('returns mood towards neutral after elapsed time', () => {
    const mood = { joy: 9, sadness: 8, anger: 7, fear: 6, disgust: 5, surprise: 4 };
    const decayed = decayMood(mood, 2);

    expect(decayed.joy).toBeLessThan(mood.joy);
    expect(decayed.sadness).toBeLessThan(mood.sadness);
    expect(decayed.anger).toBeLessThan(mood.anger);
    expect(decayed.fear).toBeLessThan(mood.fear);
  });

  it('does not change mood when no time elapsed', () => {
    const mood = { joy: 8, sadness: 5, anger: 3, fear: 2, disgust: 4, surprise: 6 };
    const decayed = decayMood(mood, 0);

    expect(decayed.joy).toBe(8);
    expect(decayed.sadness).toBe(5);
    expect(decayed.anger).toBe(3);
  });

  it('clamps values between 0 and 10', () => {
    const mood = { joy: 0, sadness: 10, anger: 10, fear: 10, disgust: 10, surprise: 10 };
    const decayed = decayMood(mood, 5);

    for (const value of Object.values(decayed)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(10);
    }
  });

  it('moves joy towards 5 (neutral) over time', () => {
    const highJoy = decayMood({ joy: 10, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0 }, 3);
    const lowJoy = decayMood({ joy: 1, sadness: 0, anger: 0, fear: 0, disgust: 0, surprise: 0 }, 3);

    expect(highJoy.joy).toBeLessThan(10);
    expect(lowJoy.joy).toBeGreaterThan(1);
  });

  it('reduces negative emotions over time', () => {
    const mood = { joy: 2, sadness: 9, anger: 8, fear: 7, disgust: 6, surprise: 3 };
    const decayed = decayMood(mood, 4);

    expect(decayed.sadness).toBeLessThan(9);
    expect(decayed.anger).toBeLessThan(8);
    expect(decayed.fear).toBeLessThan(7);
    expect(decayed.disgust).toBeLessThan(6);
  });
});
