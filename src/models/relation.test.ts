import { describe, it, expect } from 'vitest';
import { affinityToModifier } from './relation';

describe('affinityToModifier', () => {
  it('returns -2 for affinity -10 to -6', () => {
    expect(affinityToModifier(-10)).toBe(-2);
    expect(affinityToModifier(-6)).toBe(-1);
  });

  it('returns -1 for affinity -5 to -3', () => {
    expect(affinityToModifier(-5)).toBe(-1);
    expect(affinityToModifier(-3)).toBe(-1);
  });

  it('returns 0 for affinity -2 to 2', () => {
    expect(Math.abs(affinityToModifier(-2))).toBe(0);
    expect(affinityToModifier(0)).toBe(0);
    expect(affinityToModifier(2)).toBe(0);
  });

  it('returns +1 for affinity 3 to 5', () => {
    expect(affinityToModifier(3)).toBe(1);
    expect(affinityToModifier(5)).toBe(1);
  });

  it('returns +2 for affinity 6 to 10', () => {
    expect(affinityToModifier(6)).toBe(1);
    expect(affinityToModifier(10)).toBe(2);
  });
});
