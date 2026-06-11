import { Router } from 'express';
import { DBAdapter } from '../db';
import { QueueAdapter } from '../queue';
import { LLMProvider } from '../llm';
interface AppDeps {
    db: DBAdapter;
    queue: QueueAdapter;
    llm: LLMProvider;
}
export declare function createRoutes(deps: AppDeps): Router;
export {};
//# sourceMappingURL=routes.d.ts.map