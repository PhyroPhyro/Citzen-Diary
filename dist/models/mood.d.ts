export interface Mood {
    joy: number;
    sadness: number;
    anger: number;
    fear: number;
    disgust: number;
    surprise: number;
}
export type MoodState = 'animado' | 'melancolico' | 'irritado' | 'ansioso' | 'repulsado' | 'surpreso' | 'neutro';
export declare function getDominantMood(mood: Mood): {
    state: MoodState;
    value: number;
};
export declare function getMoodModifier(value: number): number;
export declare function decayMood(mood: Mood, hoursElapsed: number): Mood;
//# sourceMappingURL=mood.d.ts.map