import { WebSocketServer } from 'ws';
import { Logging } from '@google-cloud/logging';

class WebSocketManager {
  constructor(config) {
    this.config = config;
    this.clients = new Map(); // Map<agentId, Set<ws>>
    this.logging = new Logging();
    this.log = this.logging.log('agentEcos-api');
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });
    this.wss.on('connection', (ws, req) => {
      ws.on('message', (message) => this.handleMessage(ws, message));
      ws.on('close', () => this.handleDisconnect(ws));
      ws.on('error', (err) => this.sendError(ws, err));
    });
    console.log('WebSocket server initialized');
  }

  handleMessage(ws, message) {
    try {
      const data = JSON.parse(message);
      if (data.type === 'subscribe' && data.agentId) {
        this.handleSubscribe(ws, data.agentId);
      } else if (data.type === 'unsubscribe' && data.agentId) {
        this.handleUnsubscribe(ws, data.agentId);
      }
    } catch (err) {
      this.sendError(ws, err);
    }
  }

  handleSubscribe(ws, agentId) {
    if (!this.clients.has(agentId)) {
      this.clients.set(agentId, new Set());
    }
    this.clients.get(agentId).add(ws);
    this.logEvent('WebSocket client subscribed', { agentId });
  }

  handleUnsubscribe(ws, agentId) {
    if (this.clients.has(agentId)) {
      this.clients.get(agentId).delete(ws);
      if (this.clients.get(agentId).size === 0) {
        this.clients.delete(agentId);
      }
    }
    this.logEvent('WebSocket client unsubscribed', { agentId });
  }

  handleDisconnect(ws) {
    for (const [agentId, set] of this.clients.entries()) {
      set.delete(ws);
      if (set.size === 0) {
        this.clients.delete(agentId);
      }
    }
    this.logEvent('WebSocket client disconnected', {});
  }

  broadcastToAgent(agentId, data) {
    if (this.clients.has(agentId)) {
      for (const ws of this.clients.get(agentId)) {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify(data));
        }
      }
    }
  }

  sendError(ws, err) {
    ws.send(JSON.stringify({ type: 'error', error: err.message }));
    this.logEvent('WebSocket error', { error: err.message });
  }

  logEvent(message, details) {
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    const entry = this.log.entry(metadata, {
      message,
      ...details,
      environment: this.config?.server?.env,
    });
    this.log.write(entry);
  }
}

let wsManager;
export function createWebSocketManager(config) {
  wsManager = new WebSocketManager(config);
  return wsManager;
}
export { wsManager }; 