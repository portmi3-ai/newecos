import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createServer } from 'http';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { loadConfig, validateConfig } from './config/environment.js';
import { connectDB } from './config/database.js';
import { createWebSocketManager } from './config/websocket.js';
import agentRoutes from './routes/agentRoutes.js';
import deploymentRoutes from './routes/deploymentRoutes.js';
import { Logging } from '@google-cloud/logging';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize logging
const logging = new Logging();
const log = logging.log('agentEcos-api');

console.log('DEBUG (top): process.env.VERTEX_AI_PROJECT_ID =', process.env.VERTEX_AI_PROJECT_ID);

// Create Express app
const app = express();

// Create HTTP server for WebSocket support
const server = createServer(app);

// Middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', environment: process.env.NODE_ENV });
});

// API routes
app.use('/api/agents', agentRoutes);
app.use('/api/deployments', deploymentRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  const metadata = {
    resource: { type: 'global' },
    severity: 'ERROR',
  };
  
  const entry = log.entry(metadata, {
    message: 'Server error',
    error: err.message,
    stack: err.stack,
    environment: process.env.NODE_ENV,
  });
  
  log.write(entry);
  
  res.status(500).json({ error: 'Internal server error' });
});

// Connect to database and start server
const startServer = async () => {
  try {
    console.log('Starting server: loading config...');
    const config = await loadConfig();
    console.log('Config loaded:', config);
    await validateConfig(config);
    console.log('Config validated. Connecting to DB...');
    await connectDB(config);
    console.log('DB connected. Initializing WebSocket manager...');

    // Initialize WebSocket manager with config
    const wsManager = createWebSocketManager(config);
    wsManager.initialize(server);

    server.listen(config.server.port, config.server.host, () => {
      console.log(`Server running on ${config.server.host}:${config.server.port}`);
      
      const metadata = {
        resource: { type: 'global' },
        severity: 'INFO',
      };
      
      const entry = log.entry(metadata, {
        message: 'Server started',
        host: config.server.host,
        port: config.server.port,
        environment: config.server.env,
      });
      
      log.write(entry);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();