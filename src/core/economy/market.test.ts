import { describe, it, expect } from 'vitest';
import { RESOURCES, getResourceById, getResourcesByCategory, getResourcesByProducerTask } from '../../data/resources';
import {
  calculateBasePrice,
  calculateTradeProfitMargin,
  calculateEconomicScore,
  calculateInventoryWeight,
  canAddToInventory,
  addToInventory,
  removeFromInventory,
  findBestTradeRoute,
} from './market';
import { Inventory, MarketPrice } from '../../models/economy';

describe('Economy — Resources', () => {
  it('has 29 defined resources', () => {
    expect(RESOURCES.length).toBe(29);
  });

  it('can find resource by id', () => {
    const trigo = getResourceById('trigo');
    expect(trigo).toBeDefined();
    expect(trigo?.name).toBe('Trigo');
    expect(trigo?.category).toBe('raw');
    expect(trigo?.basePrice).toBe(3);
  });

  it('returns undefined for unknown resource', () => {
    expect(getResourceById('nonexistent')).toBeUndefined();
  });

  it('filters resources by category', () => {
    const consumables = getResourcesByCategory('consumable');
    expect(consumables.length).toBeGreaterThanOrEqual(5);
    for (const r of consumables) {
      expect(r.category).toBe('consumable');
    }
  });

  it('finds resources by producer task', () => {
    const harvestResources = getResourcesByProducerTask('harvest');
    expect(harvestResources).toContainEqual(expect.objectContaining({ id: 'trigo' }));
  });
});

describe('Economy — Market Pricing', () => {
  it('calculates base price with location population multiplier', () => {
    const priceVeldra = calculateBasePrice('trigo', 'veldra');
    expect(priceVeldra).toBeGreaterThan(0);
  });

  it('returns base price for unknown location', () => {
    const price = calculateBasePrice('ferro', 'nonexistent');
    expect(price).toBe(12);
  });
});

describe('Economy — Trade', () => {
  const mockPrices: MarketPrice[] = [
    { locationId: 'veldra', resourceId: 'trigo', currentPrice: 3, basePrice: 3, volatility: 0.1, lastUpdated: new Date() },
    { locationId: 'arvel', resourceId: 'trigo', currentPrice: 6, basePrice: 3, volatility: 0.1, lastUpdated: new Date() },
    { locationId: 'veldra', resourceId: 'ferro', currentPrice: 15, basePrice: 12, volatility: 0.1, lastUpdated: new Date() },
    { locationId: 'korth', resourceId: 'ferro', currentPrice: 10, basePrice: 12, volatility: 0.1, lastUpdated: new Date() },
  ];

  it('calculates positive trade profit margin', () => {
    const fromPrices = mockPrices.filter((p) => p.locationId === 'veldra');
    const toPrices = mockPrices.filter((p) => p.locationId === 'arvel');
    const margin = calculateTradeProfitMargin(fromPrices, toPrices, 'trigo');
    expect(margin).toBeCloseTo(1.0, 1);
  });

  it('returns 0 for missing price data', () => {
    const margin = calculateTradeProfitMargin([], [], 'trigo');
    expect(margin).toBe(0);
  });
});

describe('Economy — Scoring', () => {
  it('returns positive score for cheap resources', () => {
    const prices: MarketPrice[] = [
      { locationId: 'veldra', resourceId: 'trigo', currentPrice: 2, basePrice: 3, volatility: 0.1, lastUpdated: new Date() },
    ];
    const score = calculateEconomicScore('trigo', 50, prices);
    expect(score).toBe(2);
  });

  it('returns negative score for luxury when poor', () => {
    const prices: MarketPrice[] = [
      { locationId: 'veldra', resourceId: 'joia', currentPrice: 60, basePrice: 60, volatility: 0.1, lastUpdated: new Date() },
    ];
    const score = calculateEconomicScore('joia', 50, prices);
    expect(score).toBe(-2);
  });

  it('returns 1 for consumables', () => {
    const prices: MarketPrice[] = [
      { locationId: 'veldra', resourceId: 'pao', currentPrice: 4, basePrice: 4, volatility: 0.1, lastUpdated: new Date() },
    ];
    const score = calculateEconomicScore('pao', 50, prices);
    expect(score).toBe(1);
  });
});

describe('Economy — Inventory', () => {
  function createEmptyInventory(): Inventory {
    return { characterId: '__test__', items: [], gold: 50, storageCapacity: 50, storageUsed: 0 };
  }

  it('calculates inventory weight', () => {
    const items = [
      { resourceId: 'trigo', quantity: 5 },
      { resourceId: 'ferro', quantity: 2 },
    ];
    const weight = calculateInventoryWeight(items);
    expect(weight).toBe(5 * 2 + 2 * 6);
  });

  it('allows adding items within capacity', () => {
    const inv = createEmptyInventory();
    expect(canAddToInventory(inv, 'trigo', 10)).toBe(true);
  });

  it('rejects items exceeding capacity', () => {
    const inv = createEmptyInventory();
    expect(canAddToInventory(inv, 'pedra', 10)).toBe(false);
  });

  it('adds items to inventory', () => {
    const inv = createEmptyInventory();
    addToInventory(inv, 'trigo', 5);
    expect(inv.items).toContainEqual({ resourceId: 'trigo', quantity: 5 });
    expect(inv.storageUsed).toBe(10);
  });

  it('removes items from inventory', () => {
    const inv = createEmptyInventory();
    addToInventory(inv, 'trigo', 5);
    removeFromInventory(inv, 'trigo', 3);
    expect(inv.items).toContainEqual({ resourceId: 'trigo', quantity: 2 });
  });

  it('removes item entry when quantity reaches zero', () => {
    const inv = createEmptyInventory();
    addToInventory(inv, 'trigo', 3);
    removeFromInventory(inv, 'trigo', 3);
    expect(inv.items.length).toBe(0);
  });
});

describe('Economy — Trade Routes', () => {
  it('finds best trade route from location', () => {
    const route = findBestTradeRoute('veldra', 100);
    expect(route).not.toBeNull();
    if (route) {
      expect(route.fromLocationId).toBe('veldra');
      expect(route.profitMargin).toBeGreaterThan(0.15);
      expect(route.quantity).toBeGreaterThan(0);
    }
  });
});
