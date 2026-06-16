import { Skill } from '../models/combat';
export declare const SKILLS: Skill[];
export declare const SKILL_MAP: Record<string, Skill>;
export declare function getSkill(id: string): Skill | undefined;
export declare function getSkillsByVocation(vocation: string): Skill[];
export declare function getSkillsByCategory(category: string): Skill[];
export declare function getXpToNextLevel(level: number): number;
//# sourceMappingURL=skills.d.ts.map