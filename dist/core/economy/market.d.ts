import { MarketPrice, InventoryItem } from '../../models/economy';
export declare function calculateBasePrice(resourceId: string, locationId: string): number;
export declare function generateInitialMarketPrices(locationId: string): MarketPrice[];
export declare function simulatePriceChange(price: MarketPrice, recentSales: number, recentPurchases: number): number;
export declare function calculateTradeProfitMargin(fromLocationPrices: MarketPrice[], toLocationPrices: MarketPrice[], resourceId: string): number;
export declare function findBestTradeRoute(currentLocationId: string, characterGold: number): {
    fromLocationId: string;
    toLocationId: string;
    resourceId: string;
    profitMargin: number;
    quantity: number;
} | null;
export declare function getMarketDemand(resourceId: string, locationType: string): number;
export declare function calculateEconomicScore(resourceId: string, characterGold: number, marketPrices: MarketPrice[]): number;
export declare function calculateInventoryWeight(items: InventoryItem[]): number;
export declare function canAddToInventory(inventory: {
    items: InventoryItem[];
    storageUsed: number;
    storageCapacity: number;
}, resourceId: string, quantity: number): boolean;
export declare function addToInventory(inventory: {
    items: InventoryItem[];
    storageUsed: number;
    storageCapacity: number;
    characterId?: string;
    gold?: number;
}, resourceId: string, quantity: number): typeof inventory;
export declare function removeFromInventory(inventory: {
    items: InventoryItem[];
    storageUsed: number;
}, resourceId: string, quantity: number): typeof inventory;
//# sourceMappingURL=market.d.ts.map