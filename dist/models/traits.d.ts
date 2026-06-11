export type TraitName = 'openness' | 'conscientiousness' | 'extraversion' | 'emotionalStability' | 'agreeableness';
export interface Traits {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    emotionalStability: number;
    agreeableness: number;
}
export declare function traitToModifier(value: number): number;
//# sourceMappingURL=traits.d.ts.map