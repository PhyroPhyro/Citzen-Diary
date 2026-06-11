import { DBAdapter } from '../db';
import { QueueAdapter } from '../queue';
import { LLMProvider } from '../llm';
declare const app: import("express-serve-static-core").Express;
export declare function setupAPI(deps: {
    db: DBAdapter;
    queue: QueueAdapter;
    llm: LLMProvider;
}): import("express-serve-static-core").Express;
export { app };
//# sourceMappingURL=app.d.ts.map