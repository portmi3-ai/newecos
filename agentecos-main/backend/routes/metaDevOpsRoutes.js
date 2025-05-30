import express from 'express';
import { checkJwt } from '../middleware/authMiddleware.js';
import { handleMetaDevOpsCommand } from '../controllers/metaDevOpsController.js';

const router = express.Router();

router.post('/command', checkJwt, handleMetaDevOpsCommand);

export default router; 