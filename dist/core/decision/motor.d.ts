import { Character, Milestone } from '../../models';
import { TaskDefinition as TaskDef } from '../../data/tasks';
import { WorldEvent } from '../../data/world';
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
}
export declare function buildTaskPool(character: Character, activeWorldEvents?: WorldEvent[]): TaskDef[];
export declare function scoreTasks(tasks: TaskDef[], context: DecisionContext): ScoredTask[];
export declare function resolveTies(scoredTasks: ScoredTask[], character: Character): ScoredTask[];
export declare function runDecisionMotor(character: Character, context: DecisionContext): ScoredTask[];
//# sourceMappingURL=motor.d.ts.map