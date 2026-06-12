import { DBAdapter } from '../db';
import { QueueAdapter } from '../queue';
import { LLMProvider } from '../llm';
import { wsServer } from './websocket';
import { Server } from 'http';
declare const app: import("express-serve-static-core").Express;
export declare function setupAPI(deps: {
    db: DBAdapter;
    queue: QueueAdapter;
    llm: LLMProvider;
}): import("express-serve-static-core").Express;
export declare function attachWebSocket(server: Server): import("./websocket").WSServer;
export { app, wsServer };
//# sourceMappingURL=app.d.ts.map