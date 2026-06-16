import { Skill } from '../models/combat';

export const SKILLS: Skill[] = [
  // UNIVERSAL
  { id: 'sk_survival', name: 'Sobrevivência', description: 'Habilidade de sobreviver na natureza, caçar e se alimentar', vocation: null, category: 'survival', maxLevel: 10, baseXpPerUse: 10, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'forage', value: 1, description: '+1 em atividades de forrageio' }] },
  { id: 'sk_travel', name: 'Viagem', description: 'Conhecimento de rotas e capacidade de viajar longas distâncias', vocation: null, category: 'exploration', maxLevel: 10, baseXpPerUse: 8, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'travel_speed', value: 0.1, description: '+10% velocidade de viagem' }] },
  { id: 'sk_persuasion', name: 'Persuasão', description: 'Capacidade de convencer outros com argumentos', vocation: null, category: 'social', maxLevel: 10, baseXpPerUse: 12, prerequisites: [], effects: [{ type: 'active_ability', target: 'negotiate', value: 1, description: '+1 em negociações' }] },
  { id: 'sk_medicine', name: 'Medicina', description: 'Conhecimento de curas e tratamentos', vocation: null, category: 'survival', maxLevel: 10, baseXpPerUse: 10, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'healing', value: 0.2, description: '+20% cura recebida' }] },

  // COMBAT
  { id: 'sk_swordsmanship', name: 'Esgrima', description: 'Manejo de espadas e armas brancas', vocation: 'aspirante_guarda', category: 'combat', maxLevel: 15, baseXpPerUse: 15, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'attack', value: 1, description: '+1 dano em combate' }] },
  { id: 'sk_shield', name: 'Escudo', description: 'Uso de escudos para defesa', vocation: 'aspirante_guarda', category: 'combat', maxLevel: 10, baseXpPerUse: 12, prerequisites: [{ skillId: 'sk_swordsmanship', level: 3 }], effects: [{ type: 'passive_bonus', target: 'defense', value: 1, description: '+1 defesa' }] },
  { id: 'sk_tactics', name: 'Táticas', description: 'Planejamento tático em combate', vocation: 'aspirante_guarda', category: 'combat', maxLevel: 10, baseXpPerUse: 14, prerequisites: [{ skillId: 'sk_swordsmanship', level: 5 }], effects: [{ type: 'active_ability', target: 'critical_chance', value: 0.05, description: '+5% chance crítica' }] },
  { id: 'sk_heavy_combat', name: 'Combate Pesado', description: 'Combate com armaduras pesadas e armas grandes', vocation: 'guerreiro', category: 'combat', maxLevel: 15, baseXpPerUse: 16, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'attack', value: 2, description: '+2 dano em combate' }] },
  { id: 'sk_mercenary', name: 'Mercenarismo', description: 'Habilidade de lutar por recompensa', vocation: 'guerreiro', category: 'combat', maxLevel: 10, baseXpPerUse: 12, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'gold_combat', value: 0.2, description: '+20% ouro em combate' }] },
  { id: 'sk_duel', name: 'Duelo', description: 'Combate um-contra-um com foco em precisão', vocation: 'guerreiro', category: 'combat', maxLevel: 10, baseXpPerUse: 14, prerequisites: [{ skillId: 'sk_heavy_combat', level: 3 }], effects: [{ type: 'active_ability', target: 'accuracy', value: 0.1, description: '+10% precisão' }] },

  // CRAFTING
  { id: 'sk_blacksmith', name: 'Ferraria', description: 'Forjar e reparar equipamentos', vocation: 'aprendiz_artesao', category: 'crafting', maxLevel: 15, baseXpPerUse: 10, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'craft_quality', value: 1, description: '+1 qualidade em itens forjados' }] },
  { id: 'sk_trade', name: 'Comércio', description: 'Habilidade de negociar e obter melhores preços', vocation: 'comerciante_ambulante', category: 'social', maxLevel: 10, baseXpPerUse: 10, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'trade_price', value: 0.1, description: '+10% preço de venda' }] },
  { id: 'sk_route_knowledge', name: 'Conhecimento de Rotas', description: 'Conhece rotas comerciais e atalhos', vocation: 'comerciante_ambulante', category: 'exploration', maxLevel: 10, baseXpPerUse: 8, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'travel_speed', value: 0.15, description: '+15% velocidade em rotas conhecidas' }] },

  // FARMING
  { id: 'sk_farming', name: 'Agricultura', description: 'Conhecimento de cultivo e colheita', vocation: 'lavrador', category: 'crafting', maxLevel: 15, baseXpPerUse: 8, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'harvest_yield', value: 1, description: '+1 na colheita' }] },

  // EXPANSION VOCATIONS
  { id: 'sk_faith', name: 'Fé', description: 'Conexão com o divino e poder de oração', vocation: 'clerigo', category: 'magical', maxLevel: 15, baseXpPerUse: 12, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'prayer_power', value: 0.2, description: '+20% poder de oração' }] },
  { id: 'sk_performance', name: 'Performance', description: 'Habilidade de entreter e cativar plateias', vocation: 'trovador', category: 'social', maxLevel: 10, baseXpPerUse: 10, prerequisites: [], effects: [{ type: 'active_ability', target: 'entertain', value: 1, description: '+1 em apresentações' }] },
  { id: 'sk_writing', name: 'Escrita', description: 'Habilidade de redigir documentos e histórias', vocation: 'escriba', category: 'crafting', maxLevel: 10, baseXpPerUse: 8, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'document_quality', value: 1, description: '+1 qualidade em documentos' }] },
  { id: 'sk_vora_mastery', name: 'Domínio de Vora', description: 'Controle da energia Vora', vocation: 'vorant', category: 'magical', maxLevel: 15, baseXpPerUse: 15, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'vora_power', value: 0.2, description: '+20% poder Vora' }] },
  { id: 'sk_exploration', name: 'Exploração', description: 'Navegação e descoberta de novos lugares', vocation: 'andarilho', category: 'exploration', maxLevel: 10, baseXpPerUse: 10, prerequisites: [], effects: [{ type: 'passive_bonus', target: 'discovery_chance', value: 0.1, description: '+10% chance de descobrir locais' }] },
];

export const SKILL_MAP: Record<string, Skill> = {};
for (const sk of SKILLS) {
  SKILL_MAP[sk.id] = sk;
}

export function getSkill(id: string): Skill | undefined {
  return SKILL_MAP[id];
}

export function getSkillsByVocation(vocation: string): Skill[] {
  return SKILLS.filter((s) => s.vocation === null || s.vocation === vocation);
}

export function getSkillsByCategory(category: string): Skill[] {
  return SKILLS.filter((s) => s.category === category);
}

export function getXpToNextLevel(level: number): number {
  return Math.round(100 * Math.pow(1.5, level));
}
