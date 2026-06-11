export type TraitName =
  | 'openness'
  | 'conscientiousness'
  | 'extraversion'
  | 'emotionalStability'
  | 'agreeableness';

export interface Traits {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  emotionalStability: number;
  agreeableness: number;
}

export function traitToModifier(value: number): number {
  if (value <= 1) return -2;
  if (value <= 3) return -1;
  if (value <= 5) return 0;
  if (value <= 7) return 1;
  if (value <= 9) return 2;
  return 3;
}
