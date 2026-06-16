import { Resource } from '../models/economy';
export declare const RESOURCES: Resource[];
export declare function getResourceById(id: string): Resource | undefined;
export declare function getResourcesByCategory(category: string): Resource[];
export declare function getResourcesByProducerTask(taskId: string): Resource[];
export declare function getResourcesByConsumerTask(taskId: string): Resource[];
export declare const BASE_PRICE_MAP: Record<string, number>;
//# sourceMappingURL=resources.d.ts.map