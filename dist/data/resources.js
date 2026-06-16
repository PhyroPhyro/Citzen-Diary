"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BASE_PRICE_MAP = exports.RESOURCES = void 0;
exports.getResourceById = getResourceById;
exports.getResourcesByCategory = getResourcesByCategory;
exports.getResourcesByProducerTask = getResourcesByProducerTask;
exports.getResourcesByConsumerTask = getResourcesByConsumerTask;
exports.RESOURCES = [
    // RAW
    { id: 'trigo', name: 'Trigo', category: 'raw', basePrice: 3, weight: 2, description: 'Grão cultivado nos campos de Veldra', producedBy: ['cultivate', 'harvest'], consumedBy: ['process_raw', 'bake_bread'] },
    { id: 'madeira', name: 'Madeira', category: 'raw', basePrice: 5, weight: 4, description: 'Tábuas cortadas da Serra de Duren', producedBy: ['chop_wood'], consumedBy: ['forge_item', 'repair_item', 'build'] },
    { id: 'ferro', name: 'Ferro Bruto', category: 'raw', basePrice: 12, weight: 6, description: 'Minério extraído das minas de Korrath', producedBy: ['mine_ore'], consumedBy: ['forge_item', 'smith_weapon'] },
    { id: 'erva_curativa', name: 'Erva Curativa', category: 'raw', basePrice: 8, weight: 1, description: 'Plantas medicinais do Vale do Rio Maren', producedBy: ['gather_herbs', 'forage'], consumedBy: ['heal_wound', 'brew_potion'] },
    { id: 'couro', name: 'Couro Cru', category: 'raw', basePrice: 7, weight: 3, description: 'Pele curtida dos rebanhos locais', producedBy: ['hunt_game', 'raise_cattle'], consumedBy: ['process_refined', 'craft_armor'] },
    { id: 'argila', name: 'Argila', category: 'raw', basePrice: 2, weight: 5, description: 'Barro versátil das margens do rio', producedBy: ['dig_clay'], consumedBy: ['process_refined', 'pottery'] },
    { id: 'pedra', name: 'Pedra Lavrada', category: 'raw', basePrice: 4, weight: 7, description: 'Blocos de pedra das pedreiras', producedBy: ['quarry_stone'], consumedBy: ['build', 'repair_wall'] },
    { id: 'especiaria', name: 'Especiarias', category: 'raw', basePrice: 25, weight: 1, description: 'Raras especiarias da Cova das Especiarias', producedBy: ['trade_stories', 'explore_route'], consumedBy: ['sell_goods', 'cook_feast'] },
    { id: 'cristal_vora', name: 'Cristal de Vora', category: 'raw', basePrice: 40, weight: 1, description: 'Cristais imbuídos de energia Vora', producedBy: ['channel_element', 'meditate_vora'], consumedBy: ['enchant_item', 'ritual_weather'] },
    // PROCESSED
    { id: 'pao', name: 'Pão', category: 'consumable', basePrice: 4, weight: 1, description: 'Pão fresco assado no forno comunitário', producedBy: ['bake_bread', 'process_raw'], consumedBy: ['rest', 'eat_drink'] },
    { id: 'cerveja', name: 'Cerveja', category: 'consumable', basePrice: 6, weight: 2, description: 'Cerveja encorpada dos tavernistas', producedBy: ['brew_beer'], consumedBy: ['tavern', 'celebrate'] },
    { id: 'tecido', name: 'Tecido Fino', category: 'processed', basePrice: 15, weight: 2, description: 'Tecido fiado nos teares de Arvel', producedBy: ['weave_cloth', 'process_refined'], consumedBy: ['sell_product', 'craft_clothing'] },
    { id: 'ferramenta', name: 'Ferramentas', category: 'tool', basePrice: 20, weight: 5, description: 'Ferramentas forjadas na bigorna do artesão', producedBy: ['forge_item'], consumedBy: ['cultivate', 'harvest', 'build'] },
    { id: 'pocao_curativa', name: 'Poção Curativa', category: 'consumable', basePrice: 18, weight: 1, description: 'Poção que acelera a regeneração', producedBy: ['brew_potion', 'heal_wound'], consumedBy: ['recover_health'] },
    { id: 'armadura_leve', name: 'Armadura Leve', category: 'weapon', basePrice: 35, weight: 8, description: 'Armadura de couro reforçada', producedBy: ['craft_armor'], consumedBy: ['patrol', 'defend_post', 'guard_merchant'] },
    { id: 'arma_simples', name: 'Arma Simples', category: 'weapon', basePrice: 25, weight: 5, description: 'Espada ou lança de qualidade mediana', producedBy: ['smith_weapon'], consumedBy: ['train_combat', 'hunt_game', 'patrol'] },
    { id: 'documento', name: 'Documento Oficial', category: 'processed', basePrice: 30, weight: 1, description: 'Documento selado pela guilda dos escribas', producedBy: ['copy_document', 'draft_contract'], consumedBy: ['negotiate_lord', 'join_guild'] },
    { id: 'mapa', name: 'Mapa da Região', category: 'processed', basePrice: 22, weight: 1, description: 'Mapa detalhado com rotas comerciais', producedBy: ['catalog_archive', 'explore_route'], consumedBy: ['guide_traveler', 'plan_expedition'] },
    { id: 'joia', name: 'Joia Artesanal', category: 'luxury', basePrice: 60, weight: 1, description: 'Joia ornamentada pelos ourives locais', producedBy: ['craft_jewelry', 'process_refined'], consumedBy: ['sell_product', 'entertain_lord', 'negotiate_supply'] },
    { id: 'instrumento', name: 'Instrumento Musical', category: 'luxury', basePrice: 45, weight: 3, description: 'Alaúde ou flauta esculpida à mão', producedBy: ['compose_ballad', 'craft_instrument'], consumedBy: ['perform_tavern', 'entertain_lord', 'teach_song'] },
    { id: 'livro', name: 'Livro Copiado', category: 'processed', basePrice: 50, weight: 2, description: 'Cópia iluminada de um manuscrito antigo', producedBy: ['copy_scripture', 'copy_document'], consumedBy: ['teach_literacy', 'study_lore', 'catalog_archive'] },
    { id: 'runas', name: 'Pedra de Runas', category: 'magical', basePrice: 55, weight: 1, description: 'Pedra gravada com runas de proteção', producedBy: ['channel_element', 'study_lore'], consumedBy: ['ward_area', 'scry_vision', 'enchant_item'] },
    { id: 'carne_seca', name: 'Carne Seca', category: 'consumable', basePrice: 5, weight: 2, description: 'Carne salgada e defumada', producedBy: ['hunt_game', 'process_raw'], consumedBy: ['travel', 'rest'] },
    { id: 'queijo', name: 'Queijo Curado', category: 'consumable', basePrice: 7, weight: 2, description: 'Queijo envelhecido das fazendas de Veldra', producedBy: ['care_animals', 'process_raw'], consumedBy: ['sell_market', 'eat_drink'] },
    { id: 'vela', name: 'Vela de Cera', category: 'consumable', basePrice: 3, weight: 1, description: 'Vela de cera de abelha para iluminação', producedBy: ['process_refined'], consumedBy: ['study_lore', 'meditate_vora', 'copy_scripture'] },
    { id: 'corda', name: 'Corda de Cânhamo', category: 'tool', basePrice: 8, weight: 3, description: 'Corda trançada resistente', producedBy: ['weave_rope'], consumedBy: ['travel', 'escort_caravan', 'climb'] },
    { id: 'tonel', name: 'Tonel de Madeira', category: 'tool', basePrice: 10, weight: 6, description: 'Tonel para armazenar líquidos', producedBy: ['process_refined'], consumedBy: ['brew_beer', 'store_goods', 'travel'] },
    { id: 'entorpecente', name: 'Óleo de Sonho', category: 'luxury', basePrice: 35, weight: 1, description: 'Óleo extraído de plantas raras, usado por poetas', producedBy: ['gather_herbs'], consumedBy: ['perform_tavern', 'scry_vision'] },
    { id: 'sal', name: 'Sal Marinho', category: 'raw', basePrice: 10, weight: 3, description: 'Sal extraído das salinas da Costa de Maren', producedBy: ['process_raw'], consumedBy: ['process_raw', 'sell_goods', 'preserve_food'] },
];
function getResourceById(id) {
    return exports.RESOURCES.find((r) => r.id === id);
}
function getResourcesByCategory(category) {
    return exports.RESOURCES.filter((r) => r.category === category);
}
function getResourcesByProducerTask(taskId) {
    return exports.RESOURCES.filter((r) => r.producedBy.includes(taskId));
}
function getResourcesByConsumerTask(taskId) {
    return exports.RESOURCES.filter((r) => r.consumedBy.includes(taskId));
}
exports.BASE_PRICE_MAP = {};
for (const r of exports.RESOURCES) {
    exports.BASE_PRICE_MAP[r.id] = r.basePrice;
}
//# sourceMappingURL=resources.js.map