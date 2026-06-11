import { describe, it, expect } from 'vitest';
import { getCommitmentModifier } from './objective';

describe('getCommitmentModifier', () => {
  it('returns +1 for more than 3 ticks remaining', () => {
    expect(getCommitmentModifier(4)).toBe(1);
    expect(getCommitmentModifier(10)).toBe(1);
  });

  it('returns +2 for 2-3 ticks remaining', () => {
    expect(getCommitmentModifier(2)).toBe(2);
    expect(getCommitmentModifier(3)).toBe(2);
  });

  it('returns +3 for 1 tick remaining (urgent)', () => {
    expect(getCommitmentModifier(1)).toBe(3);
  });

  it('returns +3 for overdue (0 or negative)', () => {
    expect(getCommitmentModifier(0)).toBe(3);
    expect(getCommitmentModifier(-1)).toBe(3);
  });
});
