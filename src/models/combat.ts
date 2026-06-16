export interface SkillEffect {
  type: 'passive_bonus' | 'active_ability' | 'trait_boost';
  target: string;
  value: number;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  vocation: string | null;
  category: 'combat' | 'survival' | 'social' | 'crafting' | 'magical' | 'exploration';
  maxLevel: number;
  baseXpPerUse: number;
  prerequisites: { skillId: string; level: number }[];
  effects: SkillEffect[];
}

export interface CharacterSkill {
  characterId: string;
  skillId: string;
  level: number;
  xp: number;
  xpToNext: number;
}

export interface HealthState {
  hp: number;
  maxHp: number;
  stamina: number;
  maxStamina: number;
  conditions: string[];
  wounds: number;
}

export interface CombatAction {
  type: 'attack' | 'defend' | 'skill' | 'retreat' | 'item';
  skillId?: string;
  description: string;
}

export interface CombatRound {
  action: CombatAction;
  damage: number;
  enemyDamage: number;
  description: string;
  outcome: 'hit' | 'miss' | 'critical' | 'blocked' | 'retreated';
  remainingHp: number;
  remainingEnemyHp: number;
}

export interface CombatEncounter {
  id: string;
  characterId: string;
  enemyName: string;
  enemyType: string;
  enemyHp: number;
  enemyMaxHp: number;
  enemyDamage: number;
  rounds: CombatRound[];
  outcome: 'victory' | 'defeat' | 'retreat' | 'ongoing';
  xpEarned: number;
  loot: { resourceId: string; quantity: number }[];
  occurredAt: Date;
}
