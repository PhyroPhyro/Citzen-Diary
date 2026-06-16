"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const resources_1 = require("../../data/resources");
const market_1 = require("./market");
(0, vitest_1.describe)('Economy — Resources', () => {
    (0, vitest_1.it)('has 29 defined resources', () => {
        (0, vitest_1.expect)(resources_1.RESOURCES.length).toBe(29);
    });
    (0, vitest_1.it)('can find resource by id', () => {
        const trigo = (0, resources_1.getResourceById)('trigo');
        (0, vitest_1.expect)(trigo).toBeDefined();
        (0, vitest_1.expect)(trigo?.name).toBe('Trigo');
        (0, vitest_1.expect)(trigo?.category).toBe('raw');
        (0, vitest_1.expect)(trigo?.basePrice).toBe(3);
    });
    (0, vitest_1.it)('returns undefined for unknown resource', () => {
        (0, vitest_1.expect)((0, resources_1.getResourceById)('nonexistent')).toBeUndefined();
    });
    (0, vitest_1.it)('filters resources by category', () => {
        const consumables = (0, resources_1.getResourcesByCategory)('consumable');
        (0, vitest_1.expect)(consumables.length).toBeGreaterThanOrEqual(5);
        for (const r of consumables) {
            (0, vitest_1.expect)(r.category).toBe('consumable');
        }
    });
    (0, vitest_1.it)('finds resources by producer task', () => {
        const harvestResources = (0, resources_1.getResourcesByProducerTask)('harvest');
        (0, vitest_1.expect)(harvestResources).toContainEqual(vitest_1.expect.objectContaining({ id: 'trigo' }));
    });
});
(0, vitest_1.describe)('Economy — Market Pricing', () => {
    (0, vitest_1.it)('calculates base price with location population multiplier', () => {
        const priceVeldra = (0, market_1.calculateBasePrice)('trigo', 'veldra');
        (0, vitest_1.expect)(priceVeldra).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('returns base price for unknown location', () => {
        const price = (0, market_1.calculateBasePrice)('ferro', 'nonexistent');
        (0, vitest_1.expect)(price).toBe(12);
    });
});
(0, vitest_1.describe)('Economy — Trade', () => {
    const mockPrices = [
        { locationId: 'veldra', resourceId: 'trigo', currentPrice: 3, basePrice: 3, volatility: 0.1, lastUpdated: new Date() },
        { locationId: 'arvel', resourceId: 'trigo', currentPrice: 6, basePrice: 3, volatility: 0.1, lastUpdated: new Date() },
        { locationId: 'veldra', resourceId: 'ferro', currentPrice: 15, basePrice: 12, volatility: 0.1, lastUpdated: new Date() },
        { locationId: 'korth', resourceId: 'ferro', currentPrice: 10, basePrice: 12, volatility: 0.1, lastUpdated: new Date() },
    ];
    (0, vitest_1.it)('calculates positive trade profit margin', () => {
        const fromPrices = mockPrices.filter((p) => p.locationId === 'veldra');
        const toPrices = mockPrices.filter((p) => p.locationId === 'arvel');
        const margin = (0, market_1.calculateTradeProfitMargin)(fromPrices, toPrices, 'trigo');
        (0, vitest_1.expect)(margin).toBeCloseTo(1.0, 1);
    });
    (0, vitest_1.it)('returns 0 for missing price data', () => {
        const margin = (0, market_1.calculateTradeProfitMargin)([], [], 'trigo');
        (0, vitest_1.expect)(margin).toBe(0);
    });
});
(0, vitest_1.describe)('Economy — Scoring', () => {
    (0, vitest_1.it)('returns positive score for cheap resources', () => {
        const prices = [
            { locationId: 'veldra', resourceId: 'trigo', currentPrice: 2, basePrice: 3, volatility: 0.1, lastUpdated: new Date() },
        ];
        const score = (0, market_1.calculateEconomicScore)('trigo', 50, prices);
        (0, vitest_1.expect)(score).toBe(2);
    });
    (0, vitest_1.it)('returns negative score for luxury when poor', () => {
        const prices = [
            { locationId: 'veldra', resourceId: 'joia', currentPrice: 60, basePrice: 60, volatility: 0.1, lastUpdated: new Date() },
        ];
        const score = (0, market_1.calculateEconomicScore)('joia', 50, prices);
        (0, vitest_1.expect)(score).toBe(-2);
    });
    (0, vitest_1.it)('returns 1 for consumables', () => {
        const prices = [
            { locationId: 'veldra', resourceId: 'pao', currentPrice: 4, basePrice: 4, volatility: 0.1, lastUpdated: new Date() },
        ];
        const score = (0, market_1.calculateEconomicScore)('pao', 50, prices);
        (0, vitest_1.expect)(score).toBe(1);
    });
});
(0, vitest_1.describe)('Economy — Inventory', () => {
    function createEmptyInventory() {
        return { characterId: '__test__', items: [], gold: 50, storageCapacity: 50, storageUsed: 0 };
    }
    (0, vitest_1.it)('calculates inventory weight', () => {
        const items = [
            { resourceId: 'trigo', quantity: 5 },
            { resourceId: 'ferro', quantity: 2 },
        ];
        const weight = (0, market_1.calculateInventoryWeight)(items);
        (0, vitest_1.expect)(weight).toBe(5 * 2 + 2 * 6);
    });
    (0, vitest_1.it)('allows adding items within capacity', () => {
        const inv = createEmptyInventory();
        (0, vitest_1.expect)((0, market_1.canAddToInventory)(inv, 'trigo', 10)).toBe(true);
    });
    (0, vitest_1.it)('rejects items exceeding capacity', () => {
        const inv = createEmptyInventory();
        (0, vitest_1.expect)((0, market_1.canAddToInventory)(inv, 'pedra', 10)).toBe(false);
    });
    (0, vitest_1.it)('adds items to inventory', () => {
        const inv = createEmptyInventory();
        (0, market_1.addToInventory)(inv, 'trigo', 5);
        (0, vitest_1.expect)(inv.items).toContainEqual({ resourceId: 'trigo', quantity: 5 });
        (0, vitest_1.expect)(inv.storageUsed).toBe(10);
    });
    (0, vitest_1.it)('removes items from inventory', () => {
        const inv = createEmptyInventory();
        (0, market_1.addToInventory)(inv, 'trigo', 5);
        (0, market_1.removeFromInventory)(inv, 'trigo', 3);
        (0, vitest_1.expect)(inv.items).toContainEqual({ resourceId: 'trigo', quantity: 2 });
    });
    (0, vitest_1.it)('removes item entry when quantity reaches zero', () => {
        const inv = createEmptyInventory();
        (0, market_1.addToInventory)(inv, 'trigo', 3);
        (0, market_1.removeFromInventory)(inv, 'trigo', 3);
        (0, vitest_1.expect)(inv.items.length).toBe(0);
    });
});
(0, vitest_1.describe)('Economy — Trade Routes', () => {
    (0, vitest_1.it)('finds best trade route from location', () => {
        const route = (0, market_1.findBestTradeRoute)('veldra', 100);
        (0, vitest_1.expect)(route).not.toBeNull();
        if (route) {
            (0, vitest_1.expect)(route.fromLocationId).toBe('veldra');
            (0, vitest_1.expect)(route.profitMargin).toBeGreaterThan(0.15);
            (0, vitest_1.expect)(route.quantity).toBeGreaterThan(0);
        }
    });
});
//# sourceMappingURL=market.test.js.map