import { Character } from '../models';
import { TaskDefinition } from '../data/tasks';
import { WorldEvent } from '../data/world';
export interface DynamicEventTemplate {
    id: string;
    name: string;
    description: string;
    regionId: string;
    locationIds: string[];
    triggerCondition: (character: Character, task: TaskDefinition) => boolean;
    weight: number;
}
export declare function checkDynamicEvents(character: Character, chosenTask: TaskDefinition): WorldEvent[];
export declare function getActiveDynamicEvents(): WorldEvent[];
//# sourceMappingURL=dynamic-events.d.ts.map