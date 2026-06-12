"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wsServer = exports.WSServer = void 0;
const ws_1 = require("ws");
class WSServer {
    wss = null;
    clients = new Set();
    initialize(server) {
        this.wss = new ws_1.WebSocketServer({ server, path: '/ws' });
        this.wss.on('connection', (ws) => {
            this.clients.add(ws);
            ws.on('close', () => {
                this.clients.delete(ws);
            });
        });
        console.log('[WS] WebSocket server initialized at /ws');
    }
    broadcast(message) {
        const payload = JSON.stringify(message);
        for (const client of this.clients) {
            if (client.readyState === 1) {
                client.send(payload);
            }
        }
    }
    broadcastToCharacter(characterId, message) {
        const payload = JSON.stringify(message);
        for (const client of this.clients) {
            if (client.readyState === 1) {
                const subscribed = client.__characterId;
                if (!subscribed || subscribed === characterId) {
                    client.send(payload);
                }
            }
        }
    }
    getServer() {
        return this.wss;
    }
}
exports.WSServer = WSServer;
exports.wsServer = new WSServer();
//# sourceMappingURL=websocket.js.map