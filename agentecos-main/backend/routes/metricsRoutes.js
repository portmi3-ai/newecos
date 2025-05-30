import express from 'express';
import { checkJwt } from '../middleware/authMiddleware.js';
import * as metricsController from '../controllers/metricsController.js';

const router = express.Router();

// All metrics routes are protected
router.use(checkJwt);

// Get ecosystem metrics
router.get('/ecosystem', metricsController.getEcosystemMetrics);

// Get agent performance metrics
router.get('/agent/:agentId', metricsController.getAgentMetrics);

// Get industry metrics
router.get('/industry/:industryId', metricsController.getIndustryMetrics);

// Get relationship metrics
router.get('/relationships', metricsController.getRelationshipMetrics);

export default router;