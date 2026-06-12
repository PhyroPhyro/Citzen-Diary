export interface Mood {
  joy: number;
  sadness: number;
  anger: number;
  fear: number;
  disgust: number;
  surprise: number;
}

export type MoodState =
  | 'animado'
  | 'melancolico'
  | 'irritado'
  | 'ansioso'
  | 'repulsado'
  | 'surpreso'
  | 'neutro';

export function getDominantMood(mood: Mood): { state: MoodState; value: number } {
  const entries = Object.entries(mood) as [keyof Mood, number][];
  const [dominantEmotion, dominantValue] = entries.reduce(
    (max, entry) => (entry[1] > max[1] ? entry : max),
    entries[0]
  );

  const stateMap: Record<keyof Mood, MoodState> = {
    joy: 'animado',
    sadness: 'melancolico',
    anger: 'irritado',
    fear: 'ansioso',
    disgust: 'repulsado',
    surprise: 'surpreso',
  };

  if (dominantValue <= 3) return { state: 'neutro', value: dominantValue };
  return { state: stateMap[dominantEmotion], value: dominantValue };
}

export function getMoodModifier(value: number): number {
  if (value <= 1) return -2;
  if (value <= 3) return -1;
  if (value <= 5) return 0;
  if (value <= 7) return 1;
  if (value <= 9) return 2;
  return 3;
}

export function decayMood(mood: Mood, hoursElapsed: number): Mood {
  const decayRate = 0.3 * hoursElapsed;
  return {
    joy: clampMood(mood.joy + (5 - mood.joy) * decayRate * 0.3),
    sadness: clampMood(mood.sadness - mood.sadness * decayRate * 0.5),
    anger: clampMood(mood.anger - mood.anger * decayRate * 0.5),
    fear: clampMood(mood.fear - mood.fear * decayRate * 0.5),
    disgust: clampMood(mood.disgust - mood.disgust * decayRate * 0.5),
    surprise: clampMood(mood.surprise - mood.surprise * decayRate * 0.5),
  };
}

function clampMood(value: number): number {
  return Math.max(0, Math.min(10, Math.round(value * 10) / 10));
}
