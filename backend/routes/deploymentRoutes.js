import express from 'express';
import { checkJwt, checkSubscription } from '../middleware/authMiddleware.js';
import * as deploymentController from '../controllers/deploymentController.js';
import { authenticateJWT } from '../middleware/auth.js';

const router = express.Router();

// All deployment routes are protected
router.use(checkJwt);

// Get all deployments
router.get('/', deploymentController.getDeployments);

// Get single deployment
router.get('/:id', deploymentController.getDeploymentById);

// Deploy agent
router.post('/:agentId', checkSubscription, deploymentController.deployAgent);

// Get deployment status
router.get('/:id/status', deploymentController.getDeploymentStatus);

// Get deployment logs
router.get('/:id/logs', deploymentController.getDeploymentLogs);

// Update deployment configuration
router.put('/:id/configuration', deploymentController.updateDeploymentConfiguration);

// Delete deployment
router.delete('/:id', deploymentController.deleteDeployment);

// Apply authentication middleware to all routes
router.use(authenticateJWT);

// Deploy an agent
router.post('/:id/deploy', deploymentController.deployAgent);

// Undeploy an agent
router.post('/:id/undeploy', deploymentController.undeployAgent);

// Update deployment configuration
router.put('/:id/config', deploymentController.updateDeploymentConfig);

export default router;