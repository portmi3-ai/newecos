import express from 'express';
import { checkJwt } from '../middleware/authMiddleware.js';
import * as relationshipController from '../controllers/relationshipController.js';

const router = express.Router();

// All relationship routes are protected
router.use(checkJwt);

// Get all relationships
router.get('/', relationshipController.getRelationships);

// Create relationship
router.post('/', relationshipController.createRelationship);

// Delete relationship
router.delete('/:sourceAgentId/:targetAgentId', relationshipController.deleteRelationship);

// Get hierarchy
router.get('/hierarchy', relationshipController.getAgentHierarchy);

// Get network
router.get('/network', relationshipController.getAgentNetwork);

export default router;