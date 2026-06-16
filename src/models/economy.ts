export type ResourceCategory = 'raw' | 'processed' | 'luxury' | 'consumable' | 'weapon' | 'tool' | 'magical';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  basePrice: number;
  weight: number;
  description: string;
  producedBy: string[];
  consumedBy: string[];
}

export interface InventoryItem {
  resourceId: string;
  quantity: number;
}

export interface Inventory {
  characterId: string;
  items: InventoryItem[];
  gold: number;
  storageCapacity: number;
  storageUsed: number;
}

export interface MarketPrice {
  locationId: string;
  resourceId: string;
  currentPrice: number;
  basePrice: number;
  volatility: number;
  lastUpdated: Date;
}

export interface PriceHistory {
  resourceId: string;
  locationId: string;
  price: number;
  recordedAt: Date;
}

export interface TradeRoute {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  resourceId: string;
  profitMargin: number;
  distance: number;
  isActive: boolean;
  discoveredBy: string;
  discoveredAt: Date;
}

export interface EconomicAction {
  type: 'buy' | 'sell' | 'produce' | 'consume' | 'travel_trade';
  resourceId: string;
  quantity: number;
  locationId: string;
  price?: number;
}
