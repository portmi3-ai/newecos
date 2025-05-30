import express from 'express';
import { checkJwt } from '../middleware/authMiddleware.js';
import verifyGoogleToken from '../middleware/verifyGoogleToken.js';
import { createMetaAgent, createAdvisorAgentTeam } from '../controllers/metaAgentController.js';

const router = express.Router();

// Accept either Auth0 JWT or Google ID token for authentication
router.post('/', verifyGoogleToken, createMetaAgent);
router.post('/advisor-team', checkJwt, createAdvisorAgentTeam);

export default router; 