import express from 'express';
import { checkJwt, checkSubscription } from '../middleware/authMiddleware.js';
import * as blueprintController from '../controllers/blueprintController.js';

const router = express.Router();

// Public routes
router.get('/', blueprintController.getBlueprints);
router.get('/:id', blueprintController.getBlueprintById);
router.get('/industry/:industryId', blueprintController.getBlueprintsByIndustry);

// Protected routes
router.use(checkJwt);

// Deploy blueprint (requires subscription)
router.post('/:id/deploy', checkSubscription, blueprintController.deployBlueprint);

// Create custom blueprint (requires subscription)
router.post('/', checkSubscription, blueprintController.createBlueprint);

// Update blueprint
router.put('/:id', checkSubscription, blueprintController.updateBlueprint);

// Delete blueprint
router.delete('/:id', blueprintController.deleteBlueprint);

export default router;