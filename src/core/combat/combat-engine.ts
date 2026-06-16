import { Character } from '../../models/character';
import { HealthState, CombatEncounter, CombatRound, CombatAction, CharacterSkill } from '../../models/combat';
import { getSkill, getXpToNextLevel } from '../../data/skills';
import { getResourceById } from '../../data/resources';
import { DBAdapter } from '../../db';

export function createHealthState(character: Character): HealthState {
  const baseHp = 20 + character.traits.emotionalStability * 2;
  const baseStamina = 10 + character.traits.conscientiousness * 1.5;
  return {
    hp: baseHp,
    maxHp: baseHp,
    stamina: baseStamina,
    maxStamina: baseStamina,
    conditions: [],
    wounds: 0,
  };
}

export function calculateBaseDamage(character: Character, weaponBonus: number = 0): number {
  const strengthMod = (character.traits.conscientiousness - 5) * 0.5;
  return Math.max(1, Math.round(3 + strengthMod + weaponBonus));
}

export function calculateDefense(character: Character): number {
  return Math.max(0, (character.traits.emotionalStability - 5) * 0.3 + 1);
}

export function resolveCombatRound(
  character: Character,
  enemyHp: number,
  enemyMaxHp: number,
  enemyDamage: number,
  action: CombatAction,
  characterHp: number,
  skills: CharacterSkill[]
): CombatRound {
  const attackBonus = skills.reduce((sum, s) => {
    const skill = getSkill(s.skillId);
    if (!skill) return sum;
    for (const e of skill.effects) {
      if (e.target === 'attack') sum += e.value * (s.level / skill.maxLevel);
    }
    return sum;
  }, 0);

  const defenseBonus = skills.reduce((sum, s) => {
    const skill = getSkill(s.skillId);
    if (!skill) return sum;
    for (const e of skill.effects) {
      if (e.target === 'defense') sum += e.value * (s.level / skill.maxLevel);
    }
    return sum;
  }, 0);

  const baseDamage = calculateBaseDamage(character);
  const criticalChance = skills.reduce((sum, s) => {
    const skill = getSkill(s.skillId);
    if (!skill) return sum;
    for (const e of skill.effects) {
      if (e.target === 'critical_chance') sum += e.value;
    }
    return sum;
  }, 0);

  const accuracyBonus = skills.reduce((sum, s) => {
    const skill = getSkill(s.skillId);
    if (!skill) return sum;
    for (const e of skill.effects) {
      if (e.target === 'accuracy') sum += e.value;
    }
    return sum;
  }, 0);

  let damage = 0;
  let outcome: CombatRound['outcome'] = 'hit';
  let description = '';

  switch (action.type) {
    case 'attack': {
      const hitRoll = Math.random() + accuracyBonus;
      if (hitRoll < 0.2) {
        outcome = 'miss';
        description = 'O ataque errou!';
      } else {
        const isCritical = Math.random() < criticalChance;
        damage = baseDamage + attackBonus;
        if (isCritical) {
          damage *= 2;
          outcome = 'critical';
          description = `Golpe crítico! ${damage} de dano!`;
        } else {
          outcome = 'hit';
          description = `Ataque bem-sucedido: ${damage} de dano.`;
        }
      }
      break;
    }
    case 'defend': {
      const reducedDamage = Math.max(0, enemyDamage - defenseBonus * 2);
      damage = 0;
      outcome = 'blocked';
      description = `Defesa total. Dano reduzido para ${reducedDamage}.`;
      break;
    }
    case 'retreat': {
      const retreatChance = 0.5 + character.traits.extraversion * 0.03;
      if (Math.random() < retreatChance) {
        outcome = 'retreated';
        description = 'Retirada bem-sucedida!';
        return {
          action, damage: 0, enemyDamage: 0, description,
          outcome: 'retreated', remainingHp: characterHp, remainingEnemyHp: enemyHp,
        };
      }
      outcome = 'hit';
      damage = 0;
      description = 'Tentativa de retirada falhou!';
      break;
    }
    case 'skill': {
      const skillBonus = action.skillId ? attackBonus * 1.5 : 0;
      damage = baseDamage + skillBonus + attackBonus;
      if (Math.random() < 0.3) {
        damage *= 1.5;
        outcome = 'critical';
        description = `Golpe especial! ${Math.round(damage)} de dano!`;
      } else {
        outcome = 'hit';
        description = `Ataque especial: ${Math.round(damage)} de dano.`;
      }
      break;
    }
  }

  let enemyDamageDealt = 0;
  if (action.type === 'defend') {
    enemyDamageDealt = Math.max(0, enemyDamage - defenseBonus * 2);
  } else {
    enemyDamageDealt = Math.max(0, enemyDamage - defenseBonus);
  }

  return {
    action,
    damage: Math.round(damage),
    enemyDamage: Math.round(enemyDamageDealt),
    description,
    outcome,
    remainingHp: Math.max(0, characterHp - enemyDamageDealt),
    remainingEnemyHp: Math.max(0, enemyHp - damage),
  };
}

export function generateRandomEncounter(character: Character): { name: string; type: string; hp: number; damage: number; xp: number; loot: { resourceId: string; quantity: number }[] } {
  const encounters = [
    { name: 'Bandido', type: 'humanoid', baseHp: 15, baseDamage: 4, xp: 25, loot: [{ resourceId: 'couro', quantity: 1 }] },
    { name: 'Lobo Solitário', type: 'beast', baseHp: 10, baseDamage: 5, xp: 20, loot: [{ resourceId: 'couro', quantity: 2 }] },
    { name: 'Mercenário', type: 'humanoid', baseHp: 20, baseDamage: 6, xp: 35, loot: [{ resourceId: 'arma_simples', quantity: 1 }] },
    { name: 'Criatura Vora Corrompida', type: 'magical', baseHp: 25, baseDamage: 8, xp: 50, loot: [{ resourceId: 'cristal_vora', quantity: 1 }] },
    { name: 'Urso da Serra', type: 'beast', baseHp: 30, baseDamage: 7, xp: 40, loot: [{ resourceId: 'carne_seca', quantity: 3 }, { resourceId: 'couro', quantity: 3 }] },
    { name: 'Ladrão de Estrada', type: 'humanoid', baseHp: 12, baseDamage: 3, xp: 15, loot: [{ resourceId: 'pao', quantity: 2 }] },
  ];

  const idx = Math.floor(Math.random() * encounters.length);
  const enc = encounters[idx];

  const vocationMultiplier = character.vocation === 'guerreiro' || character.vocation === 'aspirante_guarda' ? 1.3 : 1;
  const levelScale = 1 + (character.faith * 0.05);

  return {
    name: enc.name,
    type: enc.type,
    hp: Math.round(enc.baseHp * levelScale * vocationMultiplier),
    damage: Math.round(enc.baseDamage * levelScale),
    xp: Math.round(enc.xp * levelScale),
    loot: enc.loot.map((l) => ({ ...l })),
  };
}

export function calculateXpGain(taskId: string, vocation: string): number {
  const xpMap: Record<string, number> = {
    patrol: 15, train_combat: 20, arrest_suspect: 25, defend_post: 20,
    spar_training: 18, hunt_game: 15, guard_merchant: 12, challenge_rival: 30,
    join_skirmish: 35, teach_combat: 10, mercenary_contract: 25,
    cultivate: 5, harvest: 5, chop_wood: 4, forge_item: 8, repair_item: 6,
    perform_tavern: 8, compose_ballad: 6, travel: 3, explore_route: 7,
  };

  return xpMap[taskId] || 2;
}

export function getSkillsForXp(taskId: string): string[] {
  const skillTaskMap: Record<string, string[]> = {
    patrol: ['sk_swordsmanship', 'sk_survival'],
    train_combat: ['sk_swordsmanship', 'sk_tactics'],
    arrest_suspect: ['sk_swordsmanship', 'sk_tactics'],
    defend_post: ['sk_shield', 'sk_swordsmanship'],
    spar_training: ['sk_heavy_combat', 'sk_duel'],
    hunt_game: ['sk_survival', 'sk_heavy_combat'],
    guard_merchant: ['sk_swordsmanship', 'sk_trade'],
    challenge_rival: ['sk_duel', 'sk_heavy_combat'],
    join_skirmish: ['sk_heavy_combat', 'sk_tactics'],
    teach_combat: ['sk_swordsmanship', 'sk_heavy_combat'],
    mercenary_contract: ['sk_mercenary', 'sk_heavy_combat'],
    cultivate: ['sk_farming'],
    forge_item: ['sk_blacksmith'],
    repair_item: ['sk_blacksmith'],
    perform_tavern: ['sk_performance'],
    compose_ballad: ['sk_performance', 'sk_writing'],
    explore_route: ['sk_exploration', 'sk_travel'],
    travel: ['sk_travel', 'sk_exploration'],
    mediate_dispute: ['sk_persuasion'],
    negotiate_supply: ['sk_persuasion', 'sk_trade'],
    heal_wound: ['sk_medicine'],
    tend_sick: ['sk_medicine'],
  };

  return skillTaskMap[taskId] || [];
}

export async function awardSkillXp(characterId: string, taskId: string, db: DBAdapter): Promise<void> {
  const skillIds = getSkillsForXp(taskId);
  if (skillIds.length === 0) return;

  for (const skillId of skillIds) {
    const skill = getSkill(skillId);
    if (!skill) continue;

    const xpGain = skill.baseXpPerUse;
    const currentLevel = 1;
    const currentXp = 0;
    const xpToNext = getXpToNextLevel(currentLevel);

    const newXp = currentXp + xpGain;
    let newLevel = currentLevel;
    let newTotalXp = newXp;

    while (newTotalXp >= xpToNext && newLevel < skill.maxLevel) {
      newTotalXp -= xpToNext;
      newLevel++;
    }

    await db.character.update(characterId, {
      [`skill_${skillId}`]: JSON.stringify({ level: newLevel, xp: newTotalXp }),
    } as any);
  }
}
