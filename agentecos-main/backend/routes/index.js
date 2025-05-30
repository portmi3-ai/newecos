import express from 'express';
const router = express.Router();

import metaAgentRoutes from './metaAgentRoutes.js';
import metaDevOpsRoutes from './metaDevOpsRoutes.js';

router.use('/meta-agents', metaAgentRoutes);
router.use('/meta-devops', metaDevOpsRoutes);

router.get('/', (req, res) => {
  res.send('Hello from Mport Media Group Node.js API!');
});

export default router; 