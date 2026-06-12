"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDynamicEvents = checkDynamicEvents;
exports.getActiveDynamicEvents = getActiveDynamicEvents;
const world_1 = require("../data/world");
const DYNAMIC_EVENT_TEMPLATES = [
    {
        id: 'bountiful_harvest',
        name: 'Colheita Abundante',
        description: 'Uma colheita excepcional eleva o ânimo e os preços dos grãos na região.',
        regionId: 'planicies_arvel',
        locationIds: ['veldra', 'arvel'],
        triggerCondition: (char, task) => char.vocation === 'lavrador' &&
            (task.id === 'cultivate' || task.id === 'harvest_production') &&
            char.richTickCount >= 20,
        weight: 3,
    },
    {
        id: 'trade_route_opened',
        name: 'Nova Rota Comercial',
        description: 'Uma rota comercial segura foi estabelecida, aumentando o fluxo de mercadorias.',
        regionId: 'costa_maren',
        locationIds: ['porto_maren', 'cova_especiarias'],
        triggerCondition: (char, task) => char.vocation === 'comerciante_ambulante' &&
            task.category === 'commerce' &&
            char.richTickCount >= 15,
        weight: 2,
    },
    {
        id: 'bandit_activity',
        name: 'Atividade de Bandidos',
        description: 'Bandidos foram avistados nas estradas, aumentando o perigo para viajantes.',
        regionId: 'vale_rio_maren',
        locationIds: ['aldeia_fenk', 'maren_sul'],
        triggerCondition: (char, task) => char.vocation === 'andarilho' &&
            task.id === 'escort_caravan' &&
            char.richTickCount >= 10,
        weight: 2,
    },
    {
        id: 'artisan_fair',
        name: 'Feira de Artesãos',
        description: 'Uma feira de artesãos atrai compradores de toda a região.',
        regionId: 'territorio_korrath',
        locationIds: ['sethr', 'korrath_capital'],
        triggerCondition: (char, task) => char.vocation === 'aprendiz_artesao' &&
            (task.id === 'forge_item' || task.id === 'sell_product') &&
            char.richTickCount >= 15,
        weight: 3,
    },
    {
        id: 'guard_reform',
        name: 'Reforma da Guarda',
        description: 'A guarda local passa por reformas, aumentando a segurança.',
        regionId: 'territorio_korrath',
        locationIds: ['grenn', 'korrath_capital'],
        triggerCondition: (char, task) => char.vocation === 'aspirante_guarda' &&
            (task.id === 'patrol' || task.id === 'train_combat') &&
            char.richTickCount >= 20,
        weight: 2,
    },
    {
        id: 'religious_renewal',
        name: 'Renovação Religiosa',
        description: 'Um movimento de renovação religiosa ganha força na região.',
        regionId: 'vale_rio_maren',
        locationIds: ['mosteiro_vel', 'maren_sul'],
        triggerCondition: (char, task) => char.vocation === 'clerigo' &&
            (task.id === 'bless_faithful' || task.id === 'preach_sermon') &&
            char.richTickCount >= 15,
        weight: 2,
    },
    {
        id: 'cultural_festival',
        name: 'Festival Cultural',
        description: 'Trovadores e artistas se reúnem para um festival de cultura e arte.',
        regionId: 'planicies_arvel',
        locationIds: ['veldra', 'arvel'],
        triggerCondition: (char, task) => char.vocation === 'trovador' &&
            (task.id === 'perform_tavern' || task.id === 'compose_ballad') &&
            char.richTickCount >= 15,
        weight: 3,
    },
    {
        id: 'military_campaign',
        name: 'Campanha Militar',
        description: 'Uma campanha militar é organizada, recrutando guerreiros.',
        regionId: 'territorio_korrath',
        locationIds: ['grenn', 'korrath_capital'],
        triggerCondition: (char, task) => char.vocation === 'guerreiro' &&
            (task.id === 'spar_training' || task.id === 'join_skirmish') &&
            char.richTickCount >= 20,
        weight: 2,
    },
    {
        id: 'scholarly_discovery',
        name: 'Descoberta Acadêmica',
        description: 'Escribas descobrem textos antigos com conhecimento perdido.',
        regionId: 'vale_rio_maren',
        locationIds: ['maren_sul', 'mosteiro_vel'],
        triggerCondition: (char, task) => char.vocation === 'escriba' &&
            (task.id === 'translate_text' || task.id === 'record_history') &&
            char.richTickCount >= 15,
        weight: 2,
    },
    {
        id: 'vora_surge',
        name: 'Ressurgência da Vora',
        description: 'Um aumento na presença mágica atrai aprendizes de toda a região.',
        regionId: 'vale_rio_maren',
        locationIds: ['mosteiro_vel'],
        triggerCondition: (char, task) => char.vocation === 'vorant' &&
            (task.id === 'channel_element' || task.id === 'meditate_vora') &&
            char.richTickCount >= 20,
        weight: 3,
    },
];
function checkDynamicEvents(character, chosenTask) {
    const newEvents = [];
    for (const template of DYNAMIC_EVENT_TEMPLATES) {
        if (template.triggerCondition(character, chosenTask)) {
            const existing = world_1.WORLD_EVENTS.find((e) => e.id === template.id);
            if (!existing || !existing.isActive) {
                const newEvent = {
                    id: template.id,
                    name: template.name,
                    description: template.description,
                    regionId: template.regionId,
                    locationIds: template.locationIds,
                    isActive: true,
                };
                newEvents.push(newEvent);
            }
        }
    }
    return newEvents;
}
function getActiveDynamicEvents() {
    return world_1.WORLD_EVENTS.filter((e) => e.isActive);
}
//# sourceMappingURL=dynamic-events.js.map