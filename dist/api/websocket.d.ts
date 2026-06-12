import { WebSocketServer } from 'ws';
import { Server } from 'http';
interface WSBroadcast {
    type: string;
    data: any;
}
export declare class WSServer {
    private wss;
    private clients;
    initialize(server: Server): void;
    broadcast(message: WSBroadcast): void;
    broadcastToCharacter(characterId: string, message: WSBroadcast): void;
    getServer(): WebSocketServer | null;
}
export declare const wsServer: WSServer;
export {};
//# sourceMappingURL=websocket.d.ts.map