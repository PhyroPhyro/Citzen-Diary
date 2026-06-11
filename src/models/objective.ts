export type Vocation =
  | 'lavrador'
  | 'andarilho'
  | 'aprendiz_artesao'
  | 'aspirante_guarda'
  | 'comerciante_ambulante';

export type ObjectiveType =
  | 'social'
  | 'economic'
  | 'exploratory'
  | 'spiritual'
  | 'military'
  | 'artisanal';

export interface Objective {
  id: string;
  description: string;
  type: ObjectiveType;
  difficulty: 1 | 2 | 3 | 4 | 5;
  requirements: Requirement[];
  progressScore: number;
}

export interface Requirement {
  type: string;
  target: number;
  current: number;
}

export interface Commitment {
  id: string;
  description: string;
  deadline: Date;
  urgency: 'low' | 'medium' | 'high';
  targetCharacterId?: string;
  taskId?: string;
  createdAt: Date;
}

export function getCommitmentModifier(ticksRemaining: number): number {
  if (ticksRemaining > 3) return 1;
  if (ticksRemaining >= 2) return 2;
  if (ticksRemaining >= 1) return 3;
  return 3;
}

const TASK_OBJECTIVE_CONTRIBUTION: Record<string, number> = {
  rest: 0,
  eat_drink: 0,
  stroll: 1,
  visit_known: 2,
  tavern: 2,
  observe_surroundings: 1,
  seek_work: 1,
  cultivate: 2,
  harvest_production: 2,
  care_animals: 2,
  process_raw: 2,
  sell_market: 2,
  order_tools: 1,
  hire_escort: 1,
  negotiate_lord: 3,
  deliver_message: 2,
  explore_route: 3,
  guide_traveler: 2,
  carry_goods: 1,
  track_person: 2,
  escort_caravan: 2,
  sell_route_info: 2,
  seek_work_arrival: 1,
  forge_item: 2,
  repair_item: 2,
  practice_technique: 2,
  process_refined: 2,
  receive_order: 1,
  buy_raw: 1,
  sell_product: 2,
  repair_guard_equipment: 2,
  patrol: 2,
  train_combat: 2,
  arrest_suspect: 3,
  defend_post: 2,
  accept_protection_contract: 2,
  escort_caravan_guard: 2,
  collect_tax: 2,
  train_recruit: 2,
  buy_goods: 2,
  sell_goods: 2,
  manage_establishment: 3,
  speculate_prices: 2,
  negotiate_supply: 2,
  join_guild: 3,
  hire_escort_merchant: 1,
  send_commercial_message: 1,
};

export function calculateObjectiveProgress(taskId: string, objectiveType: string): number {
  const taskCategory = TASK_CATEGORY_BY_ID[taskId] || 'work';
  const baseContribution = TASK_OBJECTIVE_CONTRIBUTION[taskId] ?? 1;

  const typeAlignment = getObjectiveTypeAlignment(taskCategory, objectiveType);

  return Math.round(baseContribution * typeAlignment * 10) / 10;
}

const TASK_CATEGORY_BY_ID: Record<string, string> = {
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

function getObjectiveTypeAlignment(taskCategory: string, objectiveType: string): number {
  const alignmentMap: Record<string, string[]> = {
    social: ['social', 'leisure'],
    economic: ['commerce', 'work'],
    exploratory: ['exploration', 'leisure'],
    spiritual: ['rest', 'leisure'],
    military: ['work'],
    artisanal: ['work'],
  };

  const favoredCategories = alignmentMap[objectiveType] || [];
  return favoredCategories.includes(taskCategory) ? 1.5 : 0.7;
}
