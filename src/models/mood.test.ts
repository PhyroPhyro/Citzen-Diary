import { describe, it, expect } from 'vitest';
import { getDominantMood, getMoodModifier, Mood } from './mood';

describe('getDominantMood', () => {
  it('returns joy state when joy is highest', () => {
    const mood: Mood = { joy: 8, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 3 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('animado');
    expect(result.value).toBe(8);
  });

  it('returns sadness state when sadness is highest', () => {
    const mood: Mood = { joy: 2, sadness: 9, anger: 1, fear: 2, disgust: 1, surprise: 1 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('melancolico');
  });

  it('returns anger state when anger is highest', () => {
    const mood: Mood = { joy: 2, sadness: 1, anger: 7, fear: 2, disgust: 1, surprise: 1 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('irritado');
  });

  it('returns fear state when fear is highest', () => {
    const mood: Mood = { joy: 2, sadness: 1, anger: 1, fear: 8, disgust: 1, surprise: 1 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('ansioso');
  });

  it('returns disgust state when disgust is highest', () => {
    const mood: Mood = { joy: 2, sadness: 1, anger: 1, fear: 2, disgust: 7, surprise: 1 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('repulsado');
  });

  it('returns surprise state when surprise is highest', () => {
    const mood: Mood = { joy: 2, sadness: 1, anger: 1, fear: 2, disgust: 1, surprise: 8 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('surpreso');
  });

  it('returns neutro when dominant emotion value is <= 3', () => {
    const mood: Mood = { joy: 3, sadness: 2, anger: 1, fear: 2, disgust: 1, surprise: 2 };
    const result = getDominantMood(mood);
    expect(result.state).toBe('neutro');
  });
});

describe('getMoodModifier', () => {
  it('returns -2 for values 0-1', () => {
    expect(getMoodModifier(0)).toBe(-2);
    expect(getMoodModifier(1)).toBe(-2);
  });

  it('returns -1 for values 2-3', () => {
    expect(getMoodModifier(2)).toBe(-1);
    expect(getMoodModifier(3)).toBe(-1);
  });

  it('returns 0 for values 4-5', () => {
    expect(getMoodModifier(4)).toBe(0);
    expect(getMoodModifier(5)).toBe(0);
  });

  it('returns +1 for values 6-7', () => {
    expect(getMoodModifier(6)).toBe(1);
    expect(getMoodModifier(7)).toBe(1);
  });

  it('returns +2 for values 8-9', () => {
    expect(getMoodModifier(8)).toBe(2);
    expect(getMoodModifier(9)).toBe(2);
  });

  it('returns +3 for value 10', () => {
    expect(getMoodModifier(10)).toBe(3);
  });
});
