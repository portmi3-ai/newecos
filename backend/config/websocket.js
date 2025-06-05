import { WebSocketServer } from 'ws';
import { Logging } from '@google-cloud/logging';
import config from './environment.js';

const logging = new Logging();
const log = logging.log('agentEcos-api');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map of client connections
    this.agentSubscriptions = new Map(); // Map of agent subscriptions
  }

  initialize(server) {
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws, req) => {
      const clientId = this.generateClientId();
      this.clients.set(clientId, ws);

      // Log connection
      const metadata = {
        resource: { type: 'global' },
        severity: 'INFO',
      };
      
      const entry = log.entry(metadata, {
        message: 'WebSocket client connected',
        clientId,
        environment: config.server.env,
      });
      
      log.write(entry);

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(clientId, data);
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(clientId);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.handleDisconnect(clientId);
      });
    });
  }

  generateClientId() {
    return Math.random().toString(36).substring(2, 15);
  }

  handleMessage(clientId, data) {
    const { type, agentId, sessionId } = data;

    switch (type) {
      case 'subscribe':
        this.handleSubscribe(clientId, agentId, sessionId);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(clientId, agentId);
        break;
      default:
        this.sendError(this.clients.get(clientId), 'Unknown message type');
    }
  }

  handleSubscribe(clientId, agentId, sessionId) {
    if (!this.agentSubscriptions.has(agentId)) {
      this.agentSubscriptions.set(agentId, new Set());
    }

    const subscriptions = this.agentSubscriptions.get(agentId);
    subscriptions.add({
      clientId,
      sessionId,
      ws: this.clients.get(clientId),
    });

    // Log subscription
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Client subscribed to agent',
      clientId,
      agentId,
      sessionId,
      environment: config.server.env,
    });
    
    log.write(entry);
  }

  handleUnsubscribe(clientId, agentId) {
    if (this.agentSubscriptions.has(agentId)) {
      const subscriptions = this.agentSubscriptions.get(agentId);
      subscriptions.forEach(sub => {
        if (sub.clientId === clientId) {
          subscriptions.delete(sub);
        }
      });

      if (subscriptions.size === 0) {
        this.agentSubscriptions.delete(agentId);
      }
    }

    // Log unsubscription
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'Client unsubscribed from agent',
      clientId,
      agentId,
      environment: config.server.env,
    });
    
    log.write(entry);
  }

  handleDisconnect(clientId) {
    // Remove client from all subscriptions
    this.agentSubscriptions.forEach((subscriptions, agentId) => {
      subscriptions.forEach(sub => {
        if (sub.clientId === clientId) {
          subscriptions.delete(sub);
        }
      });

      if (subscriptions.size === 0) {
        this.agentSubscriptions.delete(agentId);
      }
    });

    // Remove client
    this.clients.delete(clientId);

    // Log disconnection
    const metadata = {
      resource: { type: 'global' },
      severity: 'INFO',
    };
    
    const entry = log.entry(metadata, {
      message: 'WebSocket client disconnected',
      clientId,
      environment: config.server.env,
    });
    
    log.write(entry);
  }

  broadcastToAgent(agentId, message) {
    if (this.agentSubscriptions.has(agentId)) {
      const subscriptions = this.agentSubscriptions.get(agentId);
      subscriptions.forEach(sub => {
        if (sub.ws.readyState === 1) { // Check if connection is open
          sub.ws.send(JSON.stringify({
            ...message,
            sessionId: sub.sessionId,
          }));
        }
      });
    }
  }

  sendError(ws, message) {
    if (ws.readyState === 1) {
      ws.send(JSON.stringify({
        type: 'error',
        message,
      }));
    }
  }
}

export const wsManager = new WebSocketManager(); 