import { Character, TraitName, Milestone } from '../../models';
import { traitToModifier } from '../../models/traits';
import { getMoodModifier, getDominantMood } from '../../models/mood';
import { getCommitmentModifier } from '../../models/objective';
import { affinityToModifier } from '../../models/relation';
import { getTasksByVocation, UNIVERSAL_TASKS, TaskDefinition as TaskDef, getTasksByVocation11 } from '../../data/tasks';
import { getEventsByLocation, getLocationById, WorldEvent } from '../../data/world';
import { calculateEconomyModifier } from '../economy/modifier';
import { MarketPrice } from '../../models/economy';

export interface ScoredTask {
  task: TaskDef;
  score: number;
  breakdown: {
    base: number;
    traitPrimary: number;
    traitSecondary: number;
    mood: number;
    objective: number;
    commitment: number;
    environment: number;
    relation: number;
    faith: number;
    economy: number;
    specialization: number;
  };
}

export interface DecisionContext {
  character: Character;
  pendingSuggestion?: {
    type: 'task' | 'destination' | 'vision';
    taskId?: string;
    locationId?: string;
  };
  activeCommitments?: { taskId: string; ticksRemaining: number }[];
  relationsInLocation?: { targetId: string; affinity: number }[];
  activeMilestones?: Milestone[];
  activeWorldEvents?: WorldEvent[];
  marketPrices?: MarketPrice[];
  inventory?: {
    gold: number;
    items: { resourceId: string; quantity: number }[];
  };
}

const MOOD_CATEGORY_MAP: Record<string, { favored: string[]; penalized: string[] }> = {
  joy: { favored: ['social', 'exploration', 'leisure'], penalized: ['rest'] },
  sadness: { favored: ['rest', 'work'], penalized: ['social'] },
  anger: { favored: ['work'], penalized: ['rest', 'social'] },
  fear: { favored: ['rest'], penalized: ['exploration', 'work'] },
  disgust: { favored: ['rest'], penalized: ['social'] },
  surprise: { favored: ['exploration', 'social'], penalized: ['work'] },
};

const TASK_CATEGORY_MAP: Record<string, string> = {
  rest: 'rest',
  eat_drink: 'rest',
  stroll: 'leisure',
  visit_known: 'social',
  tavern: 'social',
  observe_surroundings: 'exploration',
  seek_work: 'work',
  cultivate: 'work',
  harvest_production: 'work',
  care_animals: 'work',
  process_raw: 'work',
  sell_market: 'commerce',
  order_tools: 'commerce',
  hire_escort: 'commerce',
  negotiate_lord: 'commerce',
  deliver_message: 'work',
  explore_route: 'exploration',
  guide_traveler: 'work',
  carry_goods: 'work',
  track_person: 'work',
  escort_caravan: 'work',
  sell_route_info: 'commerce',
  seek_work_arrival: 'work',
  forge_item: 'work',
  repair_item: 'work',
  practice_technique: 'work',
  process_refined: 'work',
  receive_order: 'commerce',
  buy_raw: 'commerce',
  sell_product: 'commerce',
  repair_guard_equipment: 'work',
  patrol: 'work',
  train_combat: 'work',
  arrest_suspect: 'work',
  defend_post: 'work',
  accept_protection_contract: 'work',
  escort_caravan_guard: 'work',
  collect_tax: 'work',
  train_recruit: 'work',
  buy_goods: 'commerce',
  sell_goods: 'commerce',
  manage_establishment: 'commerce',
  speculate_prices: 'commerce',
  negotiate_supply: 'commerce',
  join_guild: 'commerce',
  hire_escort_merchant: 'commerce',
  send_commercial_message: 'commerce',
};

function calculateTraitModifier(trait: TraitName | null, character: Character, inverse = false): number {
  if (!trait) return 0;
  const value = character.traits[trait];
  const mod = traitToModifier(value);
  return inverse ? -mod : mod;
}

function calculateMoodModifier(taskCategory: string, character: Character): number {
  const { state } = getDominantMood(character.mood);
  const moodMap: Record<string, string> = {
    animado: 'joy',
    melancolico: 'sadness',
    irritado: 'anger',
    ansioso: 'fear',
    repulsado: 'disgust',
    surpreso: 'surprise',
  };

  const emotionKey = moodMap[state] || 'joy';
  const emotionValue = character.mood[emotionKey as keyof typeof character.mood] || 5;
  const intensity = getMoodModifier(emotionValue);

  const categoryRules = MOOD_CATEGORY_MAP[emotionKey];
  if (!categoryRules) return 0;

  if (categoryRules.favored.includes(taskCategory)) return intensity;
  if (categoryRules.penalized.includes(taskCategory)) return -intensity;
  return 0;
}

function calculateObjectiveModifier(task: TaskDef, character: Character): number {
  if (!character.objective || character.objective.progressScore >= 100) return 0;

  const objectiveType = character.objective.type;
  const taskCategory = TASK_CATEGORY_MAP[task.id] || 'work';

  const typeCategoryMap: Record<string, string[]> = {
    social: ['social', 'leisure'],
    economic: ['commerce', 'work'],
    exploratory: ['exploration', 'leisure'],
    spiritual: ['rest', 'leisure'],
    military: ['work'],
    artisanal: ['work'],
  };

  const favoredCategories = typeCategoryMap[objectiveType] || [];
  if (favoredCategories.includes(taskCategory)) {
    return 2 + Math.floor(character.objective.progressScore / 25);
  }

  return 0;
}

function calculateCommitmentModifier(taskId: string, commitments?: { taskId: string; ticksRemaining: number }[]): number {
  if (!commitments) return 0;
  const commitment = commitments.find((c) => c.taskId === taskId);
  if (!commitment) return 0;
  return getCommitmentModifier(commitment.ticksRemaining);
}

function calculateEnvironmentModifier(task: TaskDef, locationId: string, character: Character): number {
  const events = getEventsByLocation(locationId);
  let modifier = 0;

  if (events.length > 0) {
    modifier += 1;

    for (const event of events) {
      if (event.isActive) {
        if (event.name.toLowerCase().includes('feira') || event.name.toLowerCase().includes('mercado')) {
          if (task.category === 'commerce') modifier += 1;
        }
        if (event.name.toLowerCase().includes('festival') || event.name.toLowerCase().includes('celebração')) {
          if (task.category === 'social' || task.category === 'leisure') modifier += 1;
        }
        if (event.name.toLowerCase().includes('conflito') || event.name.toLowerCase().includes('guerra')) {
          if (task.category === 'work' && character.vocation === 'aspirante_guarda') modifier += 2;
        }
      }
    }
  }

  const location = getLocationById(locationId);
  if (location) {
    if (location.type === 'cidade' && task.category === 'social') modifier += 1;
    if (location.type === 'roça' && (task.category === 'work' || task.id === 'cultivate')) modifier += 1;
    if (location.type === 'estrada' && task.category === 'exploration') modifier += 1;
  }

  return modifier;
}

function calculateRelationModifier(task: TaskDef, relations?: { targetId: string; affinity: number }[]): number {
  if (!relations || relations.length === 0) return 0;
  if (task.category !== 'social' && task.category !== 'commerce') return 0;
  const avgAffinity = relations.reduce((sum, r) => sum + r.affinity, 0) / relations.length;
  return affinityToModifier(avgAffinity);
}

function calculateFaithModifier(character: Character, pendingSuggestion?: { type: string; taskId?: string }, task?: TaskDef): number {
  if (!pendingSuggestion || pendingSuggestion.type !== 'task' || !task) return 0;
  if (pendingSuggestion.taskId !== task.id) return 0;

  const faith = character.faith;
  if (faith <= 1) return -4;
  if (faith <= 3) return -2;
  if (faith <= 5) return 0;
  if (faith <= 7) return 2;
  if (faith <= 9) return 4;
  return 6;
}

function calculateMilestoneModifier(task: TaskDef, milestones?: Milestone[], character?: Character): number {
  if (!milestones || milestones.length === 0) return 0;
  let modifier = 0;
  for (const m of milestones) {
    if (!m.isActiveContext) continue;
    if (m.triggerType === 'objective_achieved' && task.category === 'work') modifier += 1;
    if (m.triggerType === 'specialization_consolidated' && character?.emergentSpecialization) modifier += 1;
    if (m.triggerType === 'commitment_resolved' && task.category === 'work') modifier += 1;
    if (m.triggerType === 'world_event_impact') modifier += 1;
  }
  return Math.min(modifier, 3);
}

function calculateSpecializationModifier(task: TaskDef, character: Character): number {
  const specs = character.specializations || [];
  if (character.emergentSpecialization && !specs.includes(character.emergentSpecialization)) {
    specs.push(character.emergentSpecialization);
  }
  if (specs.length === 0) return 0;
  const taskNameLower = task.name.toLowerCase();
  for (const spec of specs) {
    const specLower = spec.toLowerCase();
    if (taskNameLower.includes(specLower.split(' ').pop()!.toLowerCase())) return 2;
  }
  return 0;
}

function calculateDynamicEventTasks(character: Character, activeEvents: WorldEvent[]): TaskDef[] {
  const dynamicTasks: TaskDef[] = [];
  for (const event of activeEvents) {
    if (!event.isActive) continue;
    if (event.name.toLowerCase().includes('feira') || event.name.toLowerCase().includes('mercado')) {
      dynamicTasks.push({
        id: `event_${event.id}_commerce`,
        name: `Aproveitar ${event.name}`,
        baseScore: 6,
        primaryTrait: 'extraversion',
        secondaryTrait: 'conscientiousness',
        secondaryWeight: 0.5,
        type: 'exclusive',
        atomicActions: ['walk', 'sell', 'negotiate'],
        category: 'commerce',
      });
    }
    if (event.name.toLowerCase().includes('festival') || event.name.toLowerCase().includes('celebração')) {
      dynamicTasks.push({
        id: `event_${event.id}_social`,
        name: `Participar de ${event.name}`,
        baseScore: 5,
        primaryTrait: 'extraversion',
        secondaryTrait: 'openness',
        secondaryWeight: 0.5,
        type: 'exclusive',
        atomicActions: ['walk', 'talk', 'announce'],
        category: 'social',
      });
    }
    if (event.name.toLowerCase().includes('conflito') || event.name.toLowerCase().includes('guerra')) {
      if (character.vocation === 'aspirante_guarda' || character.vocation === 'guerreiro') {
        dynamicTasks.push({
          id: `event_${event.id}_defense`,
          name: `Defender em ${event.name}`,
          baseScore: 7,
          primaryTrait: 'emotionalStability',
          secondaryTrait: 'conscientiousness',
          secondaryWeight: 0.5,
          type: 'exclusive',
          atomicActions: ['walk', 'watch', 'aggression'],
          category: 'work',
        });
      }
    }
    if (event.name.toLowerCase().includes('doença') || event.name.toLowerCase().includes('escassez')) {
      dynamicTasks.push({
        id: `event_${event.id}_aid`,
        name: `Ajudar em ${event.name}`,
        baseScore: 5,
        primaryTrait: 'agreeableness',
        secondaryTrait: 'conscientiousness',
        secondaryWeight: 0.5,
        type: 'exclusive',
        atomicActions: ['walk', 'visit', 'talk'],
        category: 'social',
      });
    }
  }
  return dynamicTasks;
}

export function buildTaskPool(character: Character, activeWorldEvents?: WorldEvent[]): TaskDef[] {
  const vocationTasks = getTasksByVocation(character.vocation);
  const vocation11Tasks = getTasksByVocation11(character.vocation);
  const location = getLocationById(character.locationId);

  if (!location) return [...UNIVERSAL_TASKS, ...vocationTasks, ...vocation11Tasks];

  const availableTasks = [...UNIVERSAL_TASKS, ...vocationTasks, ...vocation11Tasks];

  if (character.travelDestination) {
    return availableTasks.filter((t) =>
      t.id === 'travel' || t.category === 'rest' || t.category === 'needs'
    );
  }

  const dynamicTasks = activeWorldEvents ? calculateDynamicEventTasks(character, activeWorldEvents) : [];
  return [...availableTasks, ...dynamicTasks];
}

export function scoreTasks(
  tasks: TaskDef[],
  context: DecisionContext
): ScoredTask[] {
  const { character, pendingSuggestion, activeCommitments, relationsInLocation, activeMilestones, marketPrices, inventory } = context;

  return tasks.map((task) => {
    const category = TASK_CATEGORY_MAP[task.id] || 'work';

    const base = task.baseScore;
    const traitPrimary = calculateTraitModifier(task.primaryTrait, character);
    const traitSecondary = task.secondaryTrait
      ? calculateTraitModifier(task.secondaryTrait, character) * task.secondaryWeight
      : 0;
    const mood = calculateMoodModifier(category, character);
    const objective = calculateObjectiveModifier(task, character);
    const commitment = calculateCommitmentModifier(task.id, activeCommitments);
    const environment = calculateEnvironmentModifier(task, character.locationId, character);
    const relation = calculateRelationModifier(task, relationsInLocation);
    const faith = calculateFaithModifier(character, pendingSuggestion, task);
    const milestone = calculateMilestoneModifier(task, activeMilestones, character);
    const specialization = calculateSpecializationModifier(task, character);
    const economy = marketPrices
      ? calculateEconomyModifier(
          task,
          character,
          inventory ? { characterId: character.id, items: inventory.items, gold: inventory.gold, storageCapacity: 50, storageUsed: 0 } : null,
          marketPrices
        )
      : 0;

    const score = base + traitPrimary + traitSecondary + mood + objective + commitment + environment + relation + faith + milestone + specialization + economy;

    return {
      task,
      score,
      breakdown: {
        base,
        traitPrimary,
        traitSecondary,
        mood,
        objective,
        commitment,
        environment,
        relation,
        faith,
        economy,
        specialization,
      },
    };
  });
}

export function resolveTies(scoredTasks: ScoredTask[], character: Character): ScoredTask[] {
  return scoredTasks.sort((a, b) => {
    const diff = b.score - a.score;
    if (diff !== 0) return diff;

    if (b.breakdown.commitment !== a.breakdown.commitment) {
      return b.breakdown.commitment - a.breakdown.commitment;
    }

    if (a.task.primaryTrait && b.task.primaryTrait) {
      const aTrait = character.traits[a.task.primaryTrait];
      const bTrait = character.traits[b.task.primaryTrait];
      if (aTrait !== bTrait) return bTrait - aTrait;
    }

    return 0;
  });
}

export function runDecisionMotor(character: Character, context: DecisionContext): ScoredTask[] {
  const pool = buildTaskPool(character, context.activeWorldEvents);
  const scored = scoreTasks(pool, context);
  const sorted = resolveTies(scored, character);
  return sorted.slice(0, 3);
}
