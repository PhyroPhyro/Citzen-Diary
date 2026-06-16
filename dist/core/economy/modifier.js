"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateEconomyModifier = calculateEconomyModifier;
exports.calculateTradeRouteModifier = calculateTradeRouteModifier;
const resources_1 = require("../../data/resources");
const market_1 = require("./market");
function calculateEconomyModifier(task, character, inventory, marketPrices) {
    let modifier = 0;
    const producedResources = (0, resources_1.getResourcesByProducerTask)(task.id);
    const consumedResources = (0, resources_1.getResourcesByConsumerTask)(task.id);
    if (producedResources.length > 0) {
        for (const res of producedResources) {
            const score = (0, market_1.calculateEconomicScore)(res.id, inventory?.gold || character.faith * 10, marketPrices);
            if (score > 0)
                modifier += score;
            if (score < 0 && character.faith > 3)
                modifier += score * 0.5;
        }
    }
    if (consumedResources.length > 0 && inventory) {
        for (const res of consumedResources) {
            const hasResource = inventory.items.some((i) => i.resourceId === res.id && i.quantity > 0);
            if (!hasResource)
                modifier -= 1;
        }
    }
    if (character.vocation === 'comerciante_ambulante') {
        modifier += 1;
    }
    return Math.max(-3, Math.min(3, modifier));
}
function calculateTradeRouteModifier(character) {
    const hasTradeRoute = character.visitedLocations && character.visitedLocations.length >= 2;
    if (!hasTradeRoute)
        return 0;
    return Math.min(2, Math.floor(character.visitedLocations.length / 2));
}
//# sourceMappingURL=modifier.js.map