import { QuestTemplate } from '../models/quest';

export const QUEST_TEMPLATES: QuestTemplate[] = [
  {
    id: 'q_bountiful_harvest',
    title: 'A Colheita Farta',
    description: 'Os campos de Veldra precisam de ajuda. Uma praga ameaça as plantações de trigo.',
    tier: 1,
    requirements: { vocation: 'lavrador', minFaith: 3 },
    steps: [
      { id: 'qbh_1', description: 'Inspecionar os campos afetados', taskId: 'cultivate', isFinal: false, progressTaskCategory: 'work' },
      { id: 'qbh_2', description: 'Preparar remédio natural contra a praga', taskId: 'process_raw', isFinal: false },
      { id: 'qbh_3', description: 'Aplicar o tratamento nos campos', taskId: 'cultivate', isFinal: false },
      { id: 'qbh_4', description: 'Colher os frutos do trabalho', taskId: 'harvest', isFinal: true },
    ],
    rewards: { gold: 30, faith: 1, items: [{ resourceId: 'trigo', quantity: 10 }] },
  },
  {
    id: 'q_missing_heirloom',
    title: 'A Herança Perdida',
    description: 'Um comerciante perdeu um item de família valioso na rota entre Arvel e Korrath.',
    tier: 1,
    steps: [
      { id: 'qmh_1', description: 'Investigar no mercado de Arvel', taskId: 'buy_goods', isFinal: false },
      { id: 'qmh_2', description: 'Seguir pistas pela estrada', locationId: 'arvel', isFinal: false, progressTaskCategory: 'exploration' },
      {
        id: 'qmh_3', description: 'Encontrar o item perdido', taskId: 'explore_route', isFinal: false,
        choices: [
          { text: 'Devolver o item ao dono', nextStepId: 'qmh_4', faithRequirement: 5, condition: 'Honesto' },
          { text: 'Ficar com o item valioso', nextStepId: 'qmh_5', traitRequirements: [{ trait: 'conscientiousness', minValue: 3 }], condition: 'Ambicioso' },
        ],
      },
      { id: 'qmh_4', description: 'Receber a recompensa do comerciante', taskId: 'negotiate_supply', isFinal: true },
      { id: 'qmh_5', description: 'Vender o item no mercado negro', taskId: 'sell_goods', isFinal: true },
    ],
    rewards: { gold: 25, faith: 2 },
    cooldownDays: 7,
  },
  {
    id: 'q_bandit_threat',
    title: 'A Ameaça dos Bandidos',
    description: 'Bandidos estão atacando viajantes na Serra de Duren. A guarda local precisa de voluntários.',
    tier: 2,
    requirements: { vocation: 'aspirante_guarda', minFaith: 4 },
    steps: [
      { id: 'qbt_1', description: 'Patrulhar a estrada da serra', taskId: 'patrol', isFinal: false },
      { id: 'qbt_2', description: 'Montar emboscada', taskId: 'defend_post', isFinal: false },
      { id: 'qbt_3', description: 'Enfrentar o líder dos bandidos', taskId: 'arrest_suspect', isFinal: true },
    ],
    rewards: { gold: 50, faith: 3, items: [{ resourceId: 'arma_simples', quantity: 1 }] },
  },
  {
    id: 'q_guild_initiation',
    title: 'Iniciação na Guilda',
    description: 'A guilda dos artesãos exige uma prova de habilidade antes de aceitar novos membros.',
    tier: 1,
    requirements: { vocation: 'aprendiz_artesao' },
    steps: [
      { id: 'qgi_1', description: 'Forjar uma ferramenta para avaliação', taskId: 'forge_item', isFinal: false },
      { id: 'qgi_2', description: 'Reparar um item danificado da guilda', taskId: 'repair_item', isFinal: false },
      { id: 'qgi_3', description: 'Apresentar o trabalho aos mestres', taskId: 'receive_order', isFinal: true },
    ],
    rewards: { gold: 20, faith: 1, items: [{ resourceId: 'ferramenta', quantity: 2 }] },
  },
  {
    id: 'q_trade_route',
    title: 'Abrindo Rotas Comerciais',
    description: 'Um mercador rico busca alguém corajoso para explorar uma nova rota até o Território de Korrath.',
    tier: 2,
    requirements: { vocation: 'comerciante_ambulante', minFaith: 3 },
    steps: [
      { id: 'qtr_1', description: 'Negociar suprimentos para a viagem', taskId: 'buy_goods', isFinal: false },
      { id: 'qtr_2', description: 'Atravessar a Serra de Duren', locationId: 'durenfall', isFinal: false, progressTaskCategory: 'exploration' },
      { id: 'qtr_3', description: 'Estabelecer contato comercial em Korrath', taskId: 'sell_goods', isFinal: false },
      { id: 'qtr_4', description: 'Retornar com o relatório', taskId: 'send_commercial_message', isFinal: true },
    ],
    rewards: { gold: 80, faith: 2, items: [{ resourceId: 'mapa', quantity: 1 }] },
    cooldownDays: 14,
  },
  {
    id: 'q_healing_mission',
    title: 'Missão de Cura',
    description: 'Uma doença misteriosa se espalha pelo Vale do Rio Maren. Ervas raras são necessárias.',
    tier: 2,
    steps: [
      { id: 'qhm_1', description: 'Coletar ervas medicinais no vale', taskId: 'gather_herbs', locationId: 'maren_sul', isFinal: false },
      { id: 'qhm_2', description: 'Preparar poções curativas', taskId: 'heal_wound', isFinal: false },
      { id: 'qhm_3', description: 'Distribuir as poções aos doentes', taskId: 'tend_sick', isFinal: true },
    ],
    rewards: { gold: 40, faith: 4, items: [{ resourceId: 'pocao_curativa', quantity: 2 }] },
    cooldownDays: 10,
  },
  {
    id: 'q_ancient_lore',
    title: 'O Conhecimento Antigo',
    description: 'O mosteiro de Vel busca um escriba para decifrar textos antigos sobre a era pré-Korrath.',
    tier: 3,
    requirements: { vocation: 'escriba', minFaith: 6 },
    steps: [
      { id: 'qal_1', description: 'Viajar ao Mosteiro de Vel', locationId: 'mosteiro_de_vel', isFinal: false, progressTaskCategory: 'exploration' },
      { id: 'qal_2', description: 'Catalogar os manuscritos antigos', taskId: 'catalog_archive', isFinal: false },
      { id: 'qal_3', description: 'Traduzir o texto sagrado', taskId: 'translate_text', isFinal: false },
      { id: 'qal_4', description: 'Apresentar a tradução aos monges', taskId: 'teach_literacy', isFinal: true },
    ],
    rewards: { gold: 60, faith: 5, items: [{ resourceId: 'livro', quantity: 1 }, { resourceId: 'vela', quantity: 5 }] },
    cooldownDays: 21,
  },
  {
    id: 'q_performance_night',
    title: 'A Noite de Apresentação',
    description: 'A taverna local precisa de entretenimento. Uma noite de música e histórias pode atrair mais fregueses.',
    tier: 1,
    requirements: { vocation: 'trovador' },
    steps: [
      { id: 'qpn_1', description: 'Compor uma nova canção', taskId: 'compose_ballad', isFinal: false },
      { id: 'qpn_2', description: 'EnsaIar com outros músicos', taskId: 'teach_song', isFinal: false },
      { id: 'qpn_3', description: 'Apresentar-se na taverna', taskId: 'perform_tavern', isFinal: true },
    ],
    rewards: { gold: 35, faith: 1, items: [{ resourceId: 'instrumento', quantity: 1 }] },
  },
  {
    id: 'q_vora_awakening',
    title: 'O Despertar de Vora',
    description: 'Uma perturbação na energia Vora foi sentida nas redondezas. Alguém precisa investigar.',
    tier: 3,
    requirements: { vocation: 'vorant', minFaith: 7 },
    steps: [
      { id: 'qva_1', description: 'Meditar para sentir a origem da perturbação', taskId: 'meditate_vora', isFinal: false },
      { id: 'qva_2', description: 'Localizar o ponto de ruptura', taskId: 'scry_vision', isFinal: false },
      { id: 'qva_3', description: 'Realizar o ritual de equilíbrio', taskId: 'ritual_weather', isFinal: true },
    ],
    rewards: { gold: 70, faith: 6, items: [{ resourceId: 'cristal_vora', quantity: 2 }, { resourceId: 'runas', quantity: 1 }] },
    cooldownDays: 30,
  },
  {
    id: 'q_rival_challenge',
    title: 'O Desafio do Rival',
    description: 'Um guerreiro de uma companhia rival desafia a honra da sua guilda. Aceitar ou recusar?',
    tier: 2,
    requirements: { vocation: 'guerreiro', minFaith: 2 },
    steps: [
      { id: 'qrc_1', description: 'Treinar para o confronto', taskId: 'spar_training', isFinal: false },
      { id: 'qrc_2', description: 'Preparar o equipamento', taskId: 'maintain_weapon', isFinal: false },
      {
        id: 'qrc_3', description: 'Enfrentar o rival', taskId: 'challenge_rival', isFinal: false,
        choices: [
          { text: 'Lutar com honra, sem truques', nextStepId: 'qrc_4', faithRequirement: 5, condition: 'Honrado' },
          { text: 'Usar táticas sujas para vencer', nextStepId: 'qrc_5', traitRequirements: [{ trait: 'conscientiousness', minValue: 2 }], condition: 'Astuto' },
        ],
      },
      { id: 'qrc_4', description: 'Celebrar a vitória justa', taskId: 'teach_combat', isFinal: true },
      { id: 'qrc_5', description: 'Lidar com as consequências', taskId: 'mercenary_contract', isFinal: true },
    ],
    rewards: { gold: 55, faith: 2, items: [{ resourceId: 'armadura_leve', quantity: 1 }] },
    cooldownDays: 10,
  },
];

export const QUEST_TEMPLATE_MAP: Record<string, QuestTemplate> = {};
for (const qt of QUEST_TEMPLATES) {
  QUEST_TEMPLATE_MAP[qt.id] = qt;
}

export function getQuestTemplate(id: string): QuestTemplate | undefined {
  return QUEST_TEMPLATE_MAP[id];
}

export function getQuestsByVocation(vocation: string): QuestTemplate[] {
  return QUEST_TEMPLATES.filter(
    (q) => !q.requirements?.vocation || q.requirements.vocation === vocation
  );
}

export function getQuestTemplatesByTier(tier: number): QuestTemplate[] {
  return QUEST_TEMPLATES.filter((q) => q.tier === tier);
}
