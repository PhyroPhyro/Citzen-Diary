import { Character } from '../../models/character';
import { TaskDefinition } from '../../data/tasks';
import { Inventory, MarketPrice } from '../../models/economy';
export declare function calculateEconomyModifier(task: TaskDefinition, character: Character, inventory: Inventory | null, marketPrices: MarketPrice[]): number;
export declare function calculateTradeRouteModifier(character: Character): number;
//# sourceMappingURL=modifier.d.ts.map