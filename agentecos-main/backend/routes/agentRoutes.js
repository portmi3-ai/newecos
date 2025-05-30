import express from 'express';
import { checkJwt, checkSubscription } from '../middleware/authMiddleware.js';
import * as agentController from '../controllers/agentController.js';

const router = express.Router();

// Public routes
router.get('/templates', agentController.getAgentTemplates);
router.get('/roles', agentController.getAgentRoles);

// Protected routes
router.use(checkJwt);

// Get all agents
router.get('/', agentController.getAgents);

// Get single agent
router.get('/:id', agentController.getAgentById);

// Create new agent (requires subscription for more than 3 agents)
router.post('/', checkSubscription, agentController.createAgent);

// Update agent
router.put('/:id', agentController.updateAgent);

// Delete agent
router.delete('/:id', agentController.deleteAgent);

// Toggle agent status (active/inactive)
router.patch('/:id/status', agentController.toggleAgentStatus);

// Get agent subordinates
router.get('/:id/subordinates', agentController.getAgentSubordinates);

// Get agent supervisors
router.get('/:id/supervisors', agentController.getAgentSupervisors);

// Get agents by industry
router.get('/industry/:industryId', agentController.getAgentsByIndustry);

// Get agents by role
router.get('/role/:roleId', agentController.getAgentsByRole);

export default router;