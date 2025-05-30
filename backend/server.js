import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';
import { Logging } from '@google-cloud/logging';
import { auth } from 'express-oauth2-jwt-bearer';

// Routes
import agentRoutes from './routes/agentRoutes.js';
import userRoutes from './routes/userRoutes.js';
import deploymentRoutes from './routes/deploymentRoutes.js';
import relationshipRoutes from './routes/relationshipRoutes.js';
import blueprintRoutes from './routes/blueprintRoutes.js';
import metricsRoutes from './routes/metricsRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorMiddleware.js';
import { requestLogger } from './middleware/loggerMiddleware.js';

// Configuration
dotenv.config();

// Initialize Express app
const app = express();
const port = process.env.PORT || 8080; // Use 8080 for Cloud Run compatibility

// Setup Google Cloud Logging
const logging = new Logging();
const log = logging.log('agentEcos-api');

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));
app.use(requestLogger(log));

// JWT Auth Middleware (for protected routes)
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

// Routes
app.use('/api/agents', agentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/deployments', deploymentRoutes);
app.use('/api/relationships', relationshipRoutes);
app.use('/api/blueprints', blueprintRoutes);
app.use('/api/metrics', metricsRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port} on host 0.0.0.0`);
  
  // Log server startup
  const metadata = {
    resource: { type: 'global' },
    severity: 'INFO',
  };
  
  const entry = log.entry(metadata, {
    message: `Server started on port ${port}`,
    timestamp: new Date().toISOString(),
  });
  
  log.write(entry);
});

export default app;