import { describe, it, expect } from 'vitest';
import { traitToModifier } from './traits';

describe('traitToModifier', () => {
  it('returns -2 for values 0-1', () => {
    expect(traitToModifier(0)).toBe(-2);
    expect(traitToModifier(1)).toBe(-2);
  });

  it('returns -1 for values 2-3', () => {
    expect(traitToModifier(2)).toBe(-1);
    expect(traitToModifier(3)).toBe(-1);
  });

  it('returns 0 for values 4-5', () => {
    expect(traitToModifier(4)).toBe(0);
    expect(traitToModifier(5)).toBe(0);
  });

  it('returns +1 for values 6-7', () => {
    expect(traitToModifier(6)).toBe(1);
    expect(traitToModifier(7)).toBe(1);
  });

  it('returns +2 for values 8-9', () => {
    expect(traitToModifier(8)).toBe(2);
    expect(traitToModifier(9)).toBe(2);
  });

  it('returns +3 for value 10', () => {
    expect(traitToModifier(10)).toBe(3);
  });
});
