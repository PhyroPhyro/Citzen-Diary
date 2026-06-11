import { TraitName } from '../models';
export type TaskType = 'exclusive' | 'shared';
export interface AtomicTask {
    id: string;
    name: string;
}
export declare const ATOMIC_TASKS: AtomicTask[];
export interface TaskDefinition {
    id: string;
    name: string;
    baseScore: number;
    primaryTrait: TraitName | null;
    secondaryTrait: TraitName | null;
    secondaryWeight: number;
    type: TaskType;
    atomicActions: string[];
    category: string;
}
export declare const UNIVERSAL_TASKS: TaskDefinition[];
export declare const LAVRADOR_TASKS: TaskDefinition[];
export declare const ANDARILHO_TASKS: TaskDefinition[];
export declare const ARTESAO_TASKS: TaskDefinition[];
export declare const GUARDA_TASKS: TaskDefinition[];
export declare const COMERCIANTE_TASKS: TaskDefinition[];
export declare function getTasksByVocation(vocation: string): TaskDefinition[];
export declare function getAllTasks(): TaskDefinition[];
export declare function getTaskById(id: string): TaskDefinition | undefined;
//# sourceMappingURL=tasks.d.ts.map