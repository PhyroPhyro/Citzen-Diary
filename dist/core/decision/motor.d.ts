import { Character, Milestone } from '../../models';
import { TaskDefinition as TaskDef } from '../../data/tasks';
import { WorldEvent } from '../../data/world';
import { MarketPrice } from '../../models/economy';
export interface ScoredTask {
    task: TaskDef;
    score: number;
    breakdown: {
        base: number;
        traitPrimary: number;
        traitSecondary: number;
        mood: number;
        objective: number;
        commitment: number;
        environment: number;
        relation: number;
        faith: number;
        economy: number;
        specialization: number;
    };
}
export interface DecisionContext {
    character: Character;
    pendingSuggestion?: {
        type: 'task' | 'destination' | 'vision';
        taskId?: string;
        locationId?: string;
    };
    activeCommitments?: {
        taskId: string;
        ticksRemaining: number;
    }[];
    relationsInLocation?: {
        targetId: string;
        affinity: number;
    }[];
    activeMilestones?: Milestone[];
    activeWorldEvents?: WorldEvent[];
    marketPrices?: MarketPrice[];
    inventory?: {
        gold: number;
        items: {
            resourceId: string;
            quantity: number;
        }[];
    };
}
export declare function buildTaskPool(character: Character, activeWorldEvents?: WorldEvent[]): TaskDef[];
export declare function scoreTasks(tasks: TaskDef[], context: DecisionContext): ScoredTask[];
export declare function resolveTies(scoredTasks: ScoredTask[], character: Character): ScoredTask[];
export declare function runDecisionMotor(character: Character, context: DecisionContext): ScoredTask[];
//# sourceMappingURL=motor.d.ts.map