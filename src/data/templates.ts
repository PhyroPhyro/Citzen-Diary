export interface TemplateCategory {
  id: string;
  name: string;
  variations: string[];
  positiveSuffix: string;
  negativeSuffix: string;
}

export const DIARY_TEMPLATES: TemplateCategory[] = [
  {
    id: 'rest',
    name: 'Descanso / Dormir',
    variations: [
      'Nada de especial hoje. Comi, descansei.',
      'O dia foi longo. Deitei cedo.',
      'Fiquei na estalagem. Precisava parar um pouco.',
      'Quieto hoje. O corpo pediu descanso e eu obedeci.',
      'Um dia sem história pra contar.',
    ],
    positiveSuffix: 'Me sinto bem assim.',
    negativeSuffix: 'Mas o silêncio pesou.',
  },
  {
    id: 'work_lavrador',
    name: 'Trabalho Rotineiro (Lavrador)',
    variations: [
      'No campo o dia inteiro. A colheita segue.',
      'Plantei o que precisava ser plantado.',
      'Mais um dia cuidando do que é meu.',
      'Trabalhei até o sol baixar.',
      'A terra não espera. Eu tampouco.',
    ],
    positiveSuffix: 'Tá vindo bem.',
    negativeSuffix: 'Cansaço é companhia velha.',
  },
  {
    id: 'work_artesao',
    name: 'Trabalho Rotineiro (Artesão)',
    variations: [
      'Na forja o dia todo. As mãos sabem o que fazer.',
      'Terminei a encomenda. Nada de novo.',
      'Mais peças prontas. O trabalho não para.',
      'Dia de ofício. Sem interrupção, sem novidade.',
      'Trabalhei no que precisava ser feito.',
    ],
    positiveSuffix: 'Saiu bem feito.',
    negativeSuffix: 'A repetição cansa, mas é o que há.',
  },
  {
    id: 'patrol',
    name: 'Patrulha / Guarda',
    variations: [
      'Rondei o perímetro. Tudo quieto.',
      'Nada a reportar. O dia passou sem incidente.',
      'Patrulha cumprida. Sem novidade.',
      'Fui e voltei. O lugar continua de pé.',
      'Vigilância é isso: horas de nada pra um momento que talvez nunca venha.',
    ],
    positiveSuffix: 'Tudo como deve ser.',
    negativeSuffix: 'A monotonia é um peso próprio.',
  },
  {
    id: 'travel',
    name: 'Viagem em Trânsito',
    variations: [
      'Caminhei. Ainda não cheguei.',
      'Estrada longa, nada de especial no caminho.',
      'Mais um trecho coberto. O destino está mais perto.',
      'Pés no chão, cabeça no destino.',
      'O caminho não tem novidade hoje. Só distância.',
    ],
    positiveSuffix: 'Não me importo com isso.',
    negativeSuffix: 'Algumas horas parecem dias.',
  },
  {
    id: 'commerce',
    name: 'Comércio Rotineiro',
    variations: [
      'Comprei e vendi. As contas fecham.',
      'Mais um dia de mercado. Nada extraordinário.',
      'Os preços não surpreenderam. O dia também não.',
      'Fiz o que vim fazer.',
      'Mercado movimentado, mas nada que mudasse o rumo das coisas.',
    ],
    positiveSuffix: 'Lucro pequeno, mas lucro.',
    negativeSuffix: 'A margem estava magra hoje.',
  },
  {
    id: 'stroll',
    name: 'Passear / Observar',
    variations: [
      'Andei um pouco sem destino fixo.',
      'Fiquei observando o movimento do lugar.',
      'Passei o tempo sem pressa por aí.',
      'Dei uma volta. Às vezes é o que se precisa.',
      'Sem compromisso hoje. Deixei o dia acontecer.',
    ],
    positiveSuffix: 'Faz bem às vezes.',
    negativeSuffix: 'Mas a cabeça não sossega.',
  },
];

export function getTemplateForTask(taskId: string): TemplateCategory | null {
  const mapping: Record<string, string> = {
    rest: 'rest',
    eat_drink: 'rest',
    cultivate: 'work_lavrador',
    harvest_production: 'work_lavrador',
    care_animals: 'work_lavrador',
    process_raw: 'work_lavrador',
    forge_item: 'work_artesao',
    repair_item: 'work_artesao',
    practice_technique: 'work_artesao',
    process_refined: 'work_artesao',
    patrol: 'patrol',
    train_combat: 'patrol',
    defend_post: 'patrol',
    deliver_message: 'travel',
    explore_route: 'travel',
    guide_traveler: 'travel',
    carry_goods: 'travel',
    track_person: 'travel',
    escort_caravan: 'travel',
    escort_caravan_guard: 'travel',
    buy_goods: 'commerce',
    sell_goods: 'commerce',
    manage_establishment: 'commerce',
    speculate_prices: 'commerce',
    negotiate_supply: 'commerce',
    sell_market: 'commerce',
    sell_product: 'commerce',
    stroll: 'stroll',
    observe_surroundings: 'stroll',
  };

  const categoryId = mapping[taskId];
  if (!categoryId) return null;
  return DIARY_TEMPLATES.find((t) => t.id === categoryId) || null;
}

export function getToneSuffix(
  category: TemplateCategory,
  moodState: string
): string {
  const positiveMoods = ['animado', 'surpreso'];
  const negativeMoods = ['melancolico', 'ansioso', 'repulsado'];

  if (positiveMoods.includes(moodState)) return category.positiveSuffix;
  if (negativeMoods.includes(moodState)) return category.negativeSuffix;
  return '';
}
