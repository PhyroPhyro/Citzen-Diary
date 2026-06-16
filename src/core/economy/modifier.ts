import { Character } from '../../models/character';
import { TaskDefinition } from '../../data/tasks';
import { Resource, Inventory, MarketPrice } from '../../models/economy';
import { getResourcesByProducerTask, getResourcesByConsumerTask } from '../../data/resources';
import { calculateEconomicScore } from './market';

export function calculateEconomyModifier(
  task: TaskDefinition,
  character: Character,
  inventory: Inventory | null,
  marketPrices: MarketPrice[]
): number {
  let modifier = 0;

  const producedResources = getResourcesByProducerTask(task.id);
  const consumedResources = getResourcesByConsumerTask(task.id);

  if (producedResources.length > 0) {
    for (const res of producedResources) {
      const score = calculateEconomicScore(res.id, inventory?.gold || character.faith * 10, marketPrices);
      if (score > 0) modifier += score;
      if (score < 0 && character.faith > 3) modifier += score * 0.5;
    }
  }

  if (consumedResources.length > 0 && inventory) {
    for (const res of consumedResources) {
      const hasResource = inventory.items.some((i) => i.resourceId === res.id && i.quantity > 0);
      if (!hasResource) modifier -= 1;
    }
  }

  if (character.vocation === 'comerciante_ambulante') {
    modifier += 1;
  }

  return Math.max(-3, Math.min(3, modifier));
}

export function calculateTradeRouteModifier(character: Character): number {
  const hasTradeRoute = character.visitedLocations && character.visitedLocations.length >= 2;
  if (!hasTradeRoute) return 0;

  return Math.min(2, Math.floor(character.visitedLocations.length / 2));
}
