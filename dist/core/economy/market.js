"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateBasePrice = calculateBasePrice;
exports.generateInitialMarketPrices = generateInitialMarketPrices;
exports.simulatePriceChange = simulatePriceChange;
exports.calculateTradeProfitMargin = calculateTradeProfitMargin;
exports.findBestTradeRoute = findBestTradeRoute;
exports.getMarketDemand = getMarketDemand;
exports.calculateEconomicScore = calculateEconomicScore;
exports.calculateInventoryWeight = calculateInventoryWeight;
exports.canAddToInventory = canAddToInventory;
exports.addToInventory = addToInventory;
exports.removeFromInventory = removeFromInventory;
const resources_1 = require("../../data/resources");
const world_1 = require("../../data/world");
const TREND_WINDOW = 5;
const VOLATILITY_DECAY = 0.3;
function calculateBasePrice(resourceId, locationId) {
    const resource = (0, resources_1.getResourceById)(resourceId);
    if (!resource)
        throw new Error(`Resource not found: ${resourceId}`);
    const location = world_1.LOCATIONS.find((l) => l.id === locationId);
    if (!location)
        return resource.basePrice;
    const populationMultiplier = location.population > 0
        ? 1 + (location.population - 500) / 10000
        : 1;
    const baseWithLocation = Math.round(resource.basePrice * populationMultiplier * 10) / 10;
    return baseWithLocation;
}
function generateInitialMarketPrices(locationId) {
    return resources_1.RESOURCES.map((r) => {
        const basePrice = calculateBasePrice(r.id, locationId);
        const volatility = Math.random() * 0.2 + 0.05;
        const variation = 1 + (Math.random() - 0.5) * volatility * 2;
        const currentPrice = Math.round(basePrice * variation * 10) / 10;
        return {
            locationId,
            resourceId: r.id,
            currentPrice: Math.max(1, currentPrice),
            basePrice,
            volatility,
            lastUpdated: new Date(),
        };
    });
}
function simulatePriceChange(price, recentSales, recentPurchases) {
    const supplyDemandFactor = (recentSales - recentPurchases) / 10;
    const randomWalk = (Math.random() - 0.5) * price.volatility;
    const change = supplyDemandFactor * 0.1 + randomWalk;
    const newPrice = price.currentPrice * (1 + change);
    return Math.max(1, Math.round(newPrice * 10) / 10);
}
function calculateTradeProfitMargin(fromLocationPrices, toLocationPrices, resourceId) {
    const fromPrice = fromLocationPrices.find((p) => p.resourceId === resourceId);
    const toPrice = toLocationPrices.find((p) => p.resourceId === resourceId);
    if (!fromPrice || !toPrice)
        return 0;
    if (fromPrice.currentPrice <= 0)
        return 0;
    return (toPrice.currentPrice - fromPrice.currentPrice) / fromPrice.currentPrice;
}
function findBestTradeRoute(currentLocationId, characterGold) {
    const currentLocation = world_1.LOCATIONS.find((l) => l.id === currentLocationId);
    if (!currentLocation?.connections)
        return null;
    const currentPrices = generateInitialMarketPrices(currentLocationId);
    let bestRoute = null;
    for (const conn of currentLocation.connections) {
        const destinationPrices = generateInitialMarketPrices(conn.locationId);
        for (const resource of resources_1.RESOURCES) {
            const margin = calculateTradeProfitMargin(currentPrices, destinationPrices, resource.id);
            if (margin > 0.15 && (!bestRoute || margin > bestRoute.profitMargin)) {
                const maxAfford = Math.floor(characterGold / resource.basePrice);
                bestRoute = {
                    fromLocationId: currentLocationId,
                    toLocationId: conn.locationId,
                    resourceId: resource.id,
                    profitMargin: margin,
                    quantity: Math.min(maxAfford, 10),
                };
            }
        }
    }
    return bestRoute;
}
function getMarketDemand(resourceId, locationType) {
    const resource = (0, resources_1.getResourceById)(resourceId);
    if (!resource)
        return 0;
    const locationDemandMap = {
        village: {
            raw: 0.6, processed: 0.4, luxury: 0.1, consumable: 1.0,
            weapon: 0.3, tool: 0.7, magical: 0.0,
        },
        town: {
            raw: 0.8, processed: 0.7, luxury: 0.4, consumable: 1.2,
            weapon: 0.5, tool: 0.8, magical: 0.1,
        },
        city: {
            raw: 1.0, processed: 1.0, luxury: 1.2, consumable: 1.5,
            weapon: 0.8, tool: 0.9, magical: 0.3,
        },
        capital: {
            raw: 1.5, processed: 1.5, luxury: 2.0, consumable: 2.0,
            weapon: 1.2, tool: 1.0, magical: 0.5,
        },
        fortress: {
            raw: 0.5, processed: 0.6, luxury: 0.1, consumable: 0.8,
            weapon: 1.5, tool: 0.3, magical: 0.0,
        },
        monastery: {
            raw: 0.3, processed: 0.5, luxury: 0.2, consumable: 0.6,
            weapon: 0.0, tool: 0.4, magical: 0.8,
        },
    };
    return locationDemandMap[locationType]?.[resource.category] ?? 0.5;
}
function calculateEconomicScore(resourceId, characterGold, marketPrices) {
    const resource = (0, resources_1.getResourceById)(resourceId);
    if (!resource)
        return 0;
    const price = marketPrices.find((p) => p.resourceId === resourceId);
    if (!price)
        return 0;
    if (resource.category === 'luxury' && characterGold < resource.basePrice * 3)
        return -2;
    if (resource.category === 'consumable')
        return 1;
    if (price.currentPrice < price.basePrice * 0.7)
        return 2;
    if (price.currentPrice > price.basePrice * 1.3)
        return -1;
    return 0;
}
function calculateInventoryWeight(items) {
    return items.reduce((total, item) => {
        const resource = (0, resources_1.getResourceById)(item.resourceId);
        return total + (resource?.weight || 1) * item.quantity;
    }, 0);
}
function canAddToInventory(inventory, resourceId, quantity) {
    const resource = (0, resources_1.getResourceById)(resourceId);
    if (!resource)
        return false;
    const additionalWeight = resource.weight * quantity;
    return inventory.storageUsed + additionalWeight <= inventory.storageCapacity;
}
function addToInventory(inventory, resourceId, quantity) {
    const existing = inventory.items.find((i) => i.resourceId === resourceId);
    if (existing) {
        existing.quantity += quantity;
    }
    else {
        inventory.items.push({ resourceId, quantity });
    }
    inventory.storageUsed = calculateInventoryWeight(inventory.items);
    return inventory;
}
function removeFromInventory(inventory, resourceId, quantity) {
    const existing = inventory.items.find((i) => i.resourceId === resourceId);
    if (!existing || existing.quantity < quantity)
        return inventory;
    existing.quantity -= quantity;
    if (existing.quantity <= 0) {
        inventory.items = inventory.items.filter((i) => i.resourceId !== resourceId);
    }
    inventory.storageUsed = calculateInventoryWeight(inventory.items);
    return inventory;
}
//# sourceMappingURL=market.js.map