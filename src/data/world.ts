export interface Location {
  id: string;
  name: string;
  regionId: string;
  type: string;
  population: number;
  description: string;
  connections: { locationId: string; travelDays: number }[];
}

export interface Region {
  id: string;
  name: string;
  climate: string;
  culture: string;
  dominantPower: string;
  narrativeTone: string;
}

export interface WorldEvent {
  id: string;
  name: string;
  description: string;
  regionId: string;
  locationIds: string[];
  isActive: boolean;
}

export const REGIONS: Region[] = [
  {
    id: 'planicies_arvel',
    name: 'Planícies de Arvel',
    climate: 'Temperado, invernos moderados, verões quentes e longos',
    culture: 'Agrária, familiar, tradição oral forte',
    dominantPower: 'Pequenos lordes rurais, Guilda dos Artesãos Unidos',
    narrativeTone: 'Começo de tudo. Familiar, lento, com a sensação de que o mundo grande existe mas ainda está longe.',
  },
  {
    id: 'costa_maren',
    name: 'Costa de Maren',
    climate: 'Úmido, ventos constantes, invernos chuvosos',
    culture: 'Cosmopolita, pragmática, multilíngue, orientada para negócios',
    dominantPower: 'Irmandade do Estreito, famílias mercantes, Guilda das Especiarias',
    narrativeTone: 'Movimento, oportunidade, perigo discreto. O mundo maior chegando em forma de barco.',
  },
  {
    id: 'serra_duren',
    name: 'Serra de Duren',
    climate: 'Frio, neve no inverno, verões curtos',
    culture: 'Clânica, guerreira, desconfiada de estranhos',
    dominantPower: 'Clãs Duren (Clã Roth, Clã Vael, Clã Murn)',
    narrativeTone: 'Duro, leal, isolado. O passado que o resto de Valdrim está esquecendo.',
  },
  {
    id: 'vale_rio_maren',
    name: 'Vale do Rio Maren',
    climate: 'Temperado úmido, cheias sazonais',
    culture: 'Transitória, mista, muita circulação de pessoas',
    dominantPower: 'GMV, Igreja de Auren',
    narrativeTone: 'Passagem, encontro, diversidade de tipos humanos. Lugar de quem está indo a algum lugar.',
  },
  {
    id: 'territorio_korrath',
    name: 'Território de Korrath',
    climate: 'Temperado clássico',
    culture: 'Feudal organizada, nobreza ativa, cavalaria, corte',
    dominantPower: 'Coroa de Korrath, nobreza territorial, cavalaria real',
    narrativeTone: 'Poder visível, hierarquia clara, oportunidade e armadilha em igual medida.',
  },
];

export const LOCATIONS: Location[] = [
  {
    id: 'veldra',
    name: 'Veldra',
    regionId: 'planicies_arvel',
    type: 'agrarian_village',
    population: 400,
    description: 'Vila agrária. Local de início de todos os personagens. Casas de pedra e madeira, mercado semanal, forja, taberna O Anzol Torto, ermida da Igreja.',
    connections: [
      { locationId: 'arvel', travelDays: 2 },
      { locationId: 'passo_korven', travelDays: 4 },
    ],
  },
  {
    id: 'arvel',
    name: 'Arvel',
    regionId: 'planicies_arvel',
    type: 'larger_village',
    population: 1800,
    description: 'Vila maior, centro agrário regional. Muralha baixa, mercado permanente, representante da GMV, guarda, ferreiro, curandeiro, cartorário da Ordem dos Escribas.',
    connections: [
      { locationId: 'veldra', travelDays: 2 },
      { locationId: 'korrath_capital', travelDays: 1 },
      { locationId: 'maren_sul', travelDays: 1 },
    ],
  },
  {
    id: 'porto_maren',
    name: 'Porto Maren',
    regionId: 'costa_maren',
    type: 'port_city',
    population: 12000,
    description: 'Cidade portuária, hub comercial principal. Três docas, mercado de especiarias, sede da Irmandade do Estreito, canteiros navais, bairro estrangeiro.',
    connections: [
      { locationId: 'salcove', travelDays: 1 },
      { locationId: 'maren_sul', travelDays: 1 },
      { locationId: 'mercado_borda', travelDays: 1 },
    ],
  },
  {
    id: 'salcove',
    name: 'Salcove',
    regionId: 'costa_maren',
    type: 'fishing_village',
    population: 900,
    description: 'Vila costeira de pescadores. Estalagem O Sal e o Mar, mercado de peixe, oficina de barcos, mestre Vorant especializado em vento.',
    connections: [
      { locationId: 'porto_maren', travelDays: 1 },
    ],
  },
  {
    id: 'cova_especiarias',
    name: 'Cova das Especiarias',
    regionId: 'costa_maren',
    type: 'trading_post',
    population: 300,
    description: 'Entreposto comercial da Guilda das Especiarias. Armazéns, guarda privada, estalagem, pesador e avaliador oficial.',
    connections: [
      { locationId: 'porto_maren', travelDays: 1 },
      { locationId: 'arvel', travelDays: 2 },
    ],
  },
  {
    id: 'durenfall',
    name: 'Durenfall',
    regionId: 'serra_duren',
    type: 'clan_village',
    population: 600,
    description: 'Aldeia clânica, sede do Clã Roth. Salão do clã, ferreiro especializado em armas, curandeira Vorant de frio.',
    connections: [
      { locationId: 'passo_korven', travelDays: 2 },
    ],
  },
  {
    id: 'passo_korven',
    name: 'Passo de Korven',
    regionId: 'serra_duren',
    type: 'checkpoint',
    population: 150,
    description: 'Posto de controle entre Serra e planícies. Torre de pedra, estalagem Pedra e Vento, armazém, oficial de pedágio.',
    connections: [
      { locationId: 'durenfall', travelDays: 2 },
      { locationId: 'arvel', travelDays: 2 },
      { locationId: 'grenn', travelDays: 1 },
    ],
  },
  {
    id: 'maren_sul',
    name: 'Maren Sul',
    regionId: 'vale_rio_maren',
    type: 'river_city',
    population: 5000,
    description: 'Cidade fluvial, centro religioso e administrativo. Hospital da Igreja, catedral, sede regional da Ordem dos Escribas, arquivo histórico.',
    connections: [
      { locationId: 'porto_maren', travelDays: 1 },
      { locationId: 'arvel', travelDays: 1 },
      { locationId: 'korrath_capital', travelDays: 2 },
      { locationId: 'mosteiro_vel', travelDays: 1 },
    ],
  },
  {
    id: 'aldeia_fenk',
    name: 'Aldeia de Fenk',
    regionId: 'vale_rio_maren',
    type: 'river_village',
    population: 350,
    description: 'Aldeia fluvial de barqueiros. Cais, taberna A Corrente, ferreiro improvisado, celeiro de passagem.',
    connections: [
      { locationId: 'maren_sul', travelDays: 1 },
      { locationId: 'arvel', travelDays: 2 },
    ],
  },
  {
    id: 'mosteiro_vel',
    name: 'Mosteiro de Vel',
    regionId: 'vale_rio_maren',
    type: 'monastery',
    population: 80,
    description: 'Escola da Ordem dos Vorants. Escola de Vora, hospício, jardins medicinais, biblioteca de Vora.',
    connections: [
      { locationId: 'maren_sul', travelDays: 1 },
    ],
  },
  {
    id: 'korrath_capital',
    name: 'Korrath Capital',
    regionId: 'territorio_korrath',
    type: 'capital_city',
    population: 18000,
    description: 'Capital do reino, maior cidade da região. Castelo real, corte, cavalaria real, sede da GMV, mercado central.',
    connections: [
      { locationId: 'arvel', travelDays: 1 },
      { locationId: 'maren_sul', travelDays: 2 },
      { locationId: 'grenn', travelDays: 1 },
      { locationId: 'sethr', travelDays: 1 },
      { locationId: 'convento_alleth', travelDays: 1 },
      { locationId: 'mercado_borda', travelDays: 1 },
    ],
  },
  {
    id: 'grenn',
    name: 'Fortaleza de Grenn',
    regionId: 'territorio_korrath',
    type: 'fortress',
    population: 400,
    description: 'Guarnição de fronteira norte de Korrath. Casernas, armeiro, estábulo, campo de treino.',
    connections: [
      { locationId: 'korrath_capital', travelDays: 1 },
      { locationId: 'passo_korven', travelDays: 1 },
    ],
  },
  {
    id: 'sethr',
    name: 'Vila de Sethr',
    regionId: 'territorio_korrath',
    type: 'artisan_village',
    population: 1200,
    description: 'Vila artesanal especializada em metalurgia. Fundição, mina de ferro, sede local da Guilda dos Artesãos.',
    connections: [
      { locationId: 'korrath_capital', travelDays: 1 },
    ],
  },
  {
    id: 'convento_alleth',
    name: 'Convento de Alleth',
    regionId: 'territorio_korrath',
    type: 'convent',
    population: 60,
    description: 'Convento e hospital rural da Igreja. Hospital, jardim medicinal, Vorant residente.',
    connections: [
      { locationId: 'korrath_capital', travelDays: 1 },
      { locationId: 'maren_sul', travelDays: 2 },
    ],
  },
  {
    id: 'mercado_borda',
    name: 'Mercado de Borda',
    regionId: 'territorio_korrath',
    type: 'border_market',
    population: 500,
    description: 'Mercado de fronteira, zona cinza. Mercado misto (legal e ilegal), estalagem Sem Nome, cambista, atravessador.',
    connections: [
      { locationId: 'korrath_capital', travelDays: 1 },
      { locationId: 'porto_maren', travelDays: 1 },
      { locationId: 'arvel', travelDays: 2 },
    ],
  },
];

export const WORLD_EVENTS: WorldEvent[] = [
  {
    id: 'tensao_clans',
    name: 'Tensão entre Clã Roth e Clã Vael',
    description: 'Disputa por pasto alto na Serra; pode escalar se nenhum mediador aparecer.',
    regionId: 'serra_duren',
    locationIds: ['durenfall'],
    isActive: true,
  },
  {
    id: 'rota_especiarias_ameacada',
    name: 'Rota de Especiarias Ameaçada',
    description: 'Piratas no Estreito afetam preços em Porto Maren e Cova das Especiarias.',
    regionId: 'costa_maren',
    locationIds: ['porto_maren', 'cova_especiarias'],
    isActive: true,
  },
  {
    id: 'doenca_colheitas',
    name: 'Doença nas Colheitas de Arvel',
    description: 'Escassez de grãos, preços sobem, migrações internas.',
    regionId: 'planicies_arvel',
    locationIds: ['arvel', 'veldra'],
    isActive: true,
  },
  {
    id: 'sucessao_korrath',
    name: 'Sucessão em Korrath',
    description: 'O rei não tem herdeiro claro; facções na corte se formam.',
    regionId: 'territorio_korrath',
    locationIds: ['korrath_capital'],
    isActive: true,
  },
  {
    id: 'mestre_vorant_desaparece',
    name: 'Mestre Vorant de Vel Desaparece',
    description: 'Aprendizes sem orientação; rumores de descoberta proibida.',
    regionId: 'vale_rio_maren',
    locationIds: ['mosteiro_vel'],
    isActive: true,
  },
  {
    id: 'navio_encalha',
    name: 'Navio do Além-Estreito Encalha',
    description: 'Navio encalha em Salcove; carga desconhecida começa a circular.',
    regionId: 'costa_maren',
    locationIds: ['salcove'],
    isActive: true,
  },
  {
    id: 'operacao_guarda_borda',
    name: 'Operação da Guarda no Mercado de Borda',
    description: 'Guarda de Korrath alveja rede de atravessadores no Mercado de Borda.',
    regionId: 'territorio_korrath',
    locationIds: ['mercado_borda'],
    isActive: true,
  },
];

export function getLocationById(id: string): Location | undefined {
  return LOCATIONS.find((l) => l.id === id);
}

export function getRegionById(id: string): Region | undefined {
  return REGIONS.find((r) => r.id === id);
}

export function getEventsByLocation(locationId: string): WorldEvent[] {
  return WORLD_EVENTS.filter(
    (e) => e.isActive && e.locationIds.includes(locationId)
  );
}

export function getEventsByRegion(regionId: string): WorldEvent[] {
  return WORLD_EVENTS.filter((e) => e.isActive && e.regionId === regionId);
}
