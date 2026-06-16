import { Character } from '../../models/character';
import { HealthState, CombatRound, CombatAction, CharacterSkill } from '../../models/combat';
import { DBAdapter } from '../../db';
export declare function createHealthState(character: Character): HealthState;
export declare function calculateBaseDamage(character: Character, weaponBonus?: number): number;
export declare function calculateDefense(character: Character): number;
export declare function resolveCombatRound(character: Character, enemyHp: number, enemyMaxHp: number, enemyDamage: number, action: CombatAction, characterHp: number, skills: CharacterSkill[]): CombatRound;
export declare function generateRandomEncounter(character: Character): {
    name: string;
    type: string;
    hp: number;
    damage: number;
    xp: number;
    loot: {
        resourceId: string;
        quantity: number;
    }[];
};
export declare function calculateXpGain(taskId: string, vocation: string): number;
export declare function getSkillsForXp(taskId: string): string[];
export declare function awardSkillXp(characterId: string, taskId: string, db: DBAdapter): Promise<void>;
//# sourceMappingURL=combat-engine.d.ts.map