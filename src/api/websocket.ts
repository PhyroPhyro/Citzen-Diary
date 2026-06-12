import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

interface WSBroadcast {
  type: string;
  data: any;
}

export class WSServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws) => {
      this.clients.add(ws);
      ws.on('close', () => {
        this.clients.delete(ws);
      });
    });

    console.log('[WS] WebSocket server initialized at /ws');
  }

  broadcast(message: WSBroadcast) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) {
        client.send(payload);
      }
    }
  }

  broadcastToCharacter(characterId: string, message: WSBroadcast) {
    const payload = JSON.stringify(message);
    for (const client of this.clients) {
      if (client.readyState === 1) {
        const subscribed = (client as any).__characterId;
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

export const wsServer = new WSServer();
